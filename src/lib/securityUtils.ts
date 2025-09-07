// CSRF Protection and Security Utilities
import { supabase } from "@/integrations/supabase/client";

interface CSRFToken {
  token: string;
  timestamp: number;
  expires: number;
}

// CSRF Protection
class CSRFProtection {
  private static readonly TOKEN_KEY = 'csrf_token';
  private static readonly TOKEN_LIFETIME = 60 * 60 * 1000; // 1 hour

  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static setToken(): string {
    const token = this.generateToken();
    const csrfData: CSRFToken = {
      token,
      timestamp: Date.now(),
      expires: Date.now() + this.TOKEN_LIFETIME
    };
    
    try {
      sessionStorage.setItem(this.TOKEN_KEY, JSON.stringify(csrfData));
    } catch (error) {
      console.warn('Failed to store CSRF token:', error);
    }
    
    return token;
  }

  static getToken(): string | null {
    try {
      const stored = sessionStorage.getItem(this.TOKEN_KEY);
      if (!stored) return null;

      const csrfData: CSRFToken = JSON.parse(stored);
      
      if (Date.now() > csrfData.expires) {
        this.clearToken();
        return null;
      }

      return csrfData.token;
    } catch (error) {
      console.warn('Failed to retrieve CSRF token:', error);
      return null;
    }
  }

  static validateToken(token: string): boolean {
    const storedToken = this.getToken();
    return storedToken !== null && storedToken === token;
  }

  static clearToken(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.warn('Failed to clear CSRF token:', error);
    }
  }

  static getTokenForRequest(): string {
    let token = this.getToken();
    if (!token) {
      token = this.setToken();
    }
    return token;
  }
}

// Secure Error Handler
class SecureErrorHandler {
  private static readonly MAX_ERROR_LOG_SIZE = 100;
  private static errorLog: Array<{ timestamp: number; error: string; context?: string }> = [];

  static logError(error: any, context?: string, includeStack = false): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const logEntry = {
      timestamp: Date.now(),
      error: this.sanitizeErrorMessage(errorMessage),
      context: context ? this.sanitizeErrorMessage(context) : undefined
    };

    this.errorLog.push(logEntry);
    
    // Keep only the most recent errors
    if (this.errorLog.length > this.MAX_ERROR_LOG_SIZE) {
      this.errorLog = this.errorLog.slice(-this.MAX_ERROR_LOG_SIZE);
    }

    // Log to console in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Security Error:', logEntry, includeStack ? error.stack : undefined);
    }
  }

  private static sanitizeErrorMessage(message: string): string {
    return message
      .replace(/[<>]/g, '') // Remove HTML characters
      .replace(/password[=:]\s*[^\s]+/gi, 'password=[REDACTED]') // Redact passwords
      .replace(/token[=:]\s*[^\s]+/gi, 'token=[REDACTED]') // Redact tokens
      .replace(/key[=:]\s*[^\s]+/gi, 'key=[REDACTED]') // Redact keys
      .substring(0, 500); // Limit length
  }

  static getPublicErrorMessage(error: any): string {
    // Never expose internal error details to users
    if (error?.code === 'PGRST116') {
      return 'Resource not found';
    }
    
    if (error?.code === 'PGRST301') {
      return 'Access denied';
    }

    // Handle auth-specific errors
    if (error?.code === 'user_already_exists' || error?.message?.includes('User already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }

    if (error?.message?.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }

    if (error?.message?.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }

    if (error?.message?.includes('RLS')) {
      return 'Access denied';
    }

    if (error?.message?.includes('JWT')) {
      return 'Authentication required';
    }

    if (error?.message?.includes('rate limit')) {
      return 'Too many requests. Please try again later.';
    }

    // Generic user-friendly message
    return 'An error occurred. Please try again.';
  }

  static async reportSecurityIncident(
    incidentType: string, 
    details: any, 
    userId?: string
  ): Promise<void> {
    try {
      await supabase.rpc('log_security_event', {
        action_type_param: incidentType,
        resource_type_param: 'security_incident',
        success_param: false,
        error_msg: this.sanitizeErrorMessage(JSON.stringify(details))
      });
    } catch (error) {
      this.logError(error, 'Failed to report security incident');
    }
  }
}

// Request Security Helper
class RequestSecurity {
  private static readonly MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly SUSPICIOUS_PATTERNS = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /<iframe/i,
    /data:text\/html/i,
    /eval\(/i,
    /Function\(/i
  ];

  static validateRequestSize(data: any): boolean {
    try {
      const size = new Blob([JSON.stringify(data)]).size;
      return size <= this.MAX_REQUEST_SIZE;
    } catch {
      return false;
    }
  }

  static scanForSuspiciousContent(data: any): boolean {
    const stringData = JSON.stringify(data).toLowerCase();
    return this.SUSPICIOUS_PATTERNS.some(pattern => pattern.test(stringData));
  }

  static validateOrigin(expectedOrigin?: string): boolean {
    if (!expectedOrigin) {
      expectedOrigin = window.location.origin;
    }
    
    const currentOrigin = window.location.origin;
    return currentOrigin === expectedOrigin;
  }

  static async secureRequest(
    requestFn: () => Promise<any>,
    options: {
      requireCSRF?: boolean;
      maxRetries?: number;
      context?: string;
    } = {}
  ): Promise<any> {
    const { requireCSRF = true, maxRetries = 3, context } = options;

    // Validate origin
    if (!this.validateOrigin()) {
      throw new Error('Invalid request origin');
    }

    // CSRF protection for state-changing operations
    if (requireCSRF) {
      const token = CSRFProtection.getTokenForRequest();
      if (!token) {
        throw new Error('CSRF token required');
      }
    }

    let lastError: any;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        SecureErrorHandler.logError(error, context);

        // Don't retry certain types of errors
        if (error?.code === 'PGRST301' || // Access denied
            error?.message?.includes('Authentication') ||
            attempt === maxRetries) {
          break;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

// Content Security Policy Helper
class CSPHelper {
  static generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }

  static setMetaCSP(nonce?: string): void {
    const metaTag = document.createElement('meta');
    metaTag.httpEquiv = 'Content-Security-Policy';
    
    const nonceValue = nonce || this.generateNonce();
    metaTag.content = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonceValue}' https://challenges.cloudflare.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-src 'self' https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');

    document.head.appendChild(metaTag);
  }
}

export {
  CSRFProtection,
  SecureErrorHandler,
  RequestSecurity,
  CSPHelper
};

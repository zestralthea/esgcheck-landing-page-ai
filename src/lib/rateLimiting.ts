// Simple client-side rate limiting utility
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const RATE_LIMIT_STORAGE_KEY = 'rate_limits';
const DEFAULT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_REQUESTS = 3;

class RateLimiter {
  private storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  private getStoredLimits(): Record<string, RateLimitRecord> {
    try {
      const stored = this.storage.getItem(RATE_LIMIT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private setStoredLimits(limits: Record<string, RateLimitRecord>): void {
    try {
      this.storage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(limits));
    } catch {
      // Storage failed, continue without persistence
    }
  }

  private generateKey(identifier: string, action: string): string {
    return `${action}:${identifier}`;
  }

  isAllowed(
    identifier: string,
    action: string,
    maxRequests: number = DEFAULT_MAX_REQUESTS,
    windowMs: number = DEFAULT_WINDOW_MS
  ): boolean {
    const key = this.generateKey(identifier, action);
    const now = Date.now();
    const limits = this.getStoredLimits();

    // Clean up expired entries
    Object.keys(limits).forEach(k => {
      if (limits[k].resetTime <= now) {
        delete limits[k];
      }
    });

    const current = limits[key];
    
    if (!current || current.resetTime <= now) {
      // Create new or reset expired limit
      limits[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      this.setStoredLimits(limits);
      return true;
    }

    if (current.count >= maxRequests) {
      return false;
    }

    // Increment count
    current.count += 1;
    this.setStoredLimits(limits);
    return true;
  }

  getRemainingTime(identifier: string, action: string): number {
    const key = this.generateKey(identifier, action);
    const limits = this.getStoredLimits();
    const current = limits[key];
    
    if (!current) return 0;
    
    const remaining = current.resetTime - Date.now();
    return Math.max(0, remaining);
  }

  reset(identifier: string, action: string): void {
    const key = this.generateKey(identifier, action);
    const limits = this.getStoredLimits();
    delete limits[key];
    this.setStoredLimits(limits);
  }
}

export const rateLimiter = new RateLimiter();

// Helper function for common rate limiting scenarios
export const checkFormSubmissionLimit = (formType: string, email?: string): boolean => {
  const identifier = email || 'anonymous';
  return rateLimiter.isAllowed(identifier, `form_${formType}`, 3, 5 * 60 * 1000); // 3 submissions per 5 minutes
};

export const getRemainingCooldown = (formType: string, email?: string): number => {
  const identifier = email || 'anonymous';
  return rateLimiter.getRemainingTime(identifier, `form_${formType}`);
};
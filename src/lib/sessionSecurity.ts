import { supabase } from "@/integrations/supabase/client";

// Session timeout configuration
const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry
const SESSION_IDLE_TIME = 30 * 60 * 1000; // 30 minutes of inactivity
const SESSION_CHECK_INTERVAL = 60 * 1000; // Check every minute

interface SessionManager {
  startSessionMonitoring: () => void;
  stopSessionMonitoring: () => void;
  refreshSession: () => Promise<void>;
  logoutOnPageClose: () => void;
  updateLastActivity: () => void;
}

class SessionSecurityManager implements SessionManager {
  private sessionTimer: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();
  private beforeUnloadHandler: ((event: BeforeUnloadEvent) => void) | null = null;
  private activityListeners: (() => void)[] = [];

  constructor() {
    this.updateLastActivity = this.updateLastActivity.bind(this);
    this.refreshSession = this.refreshSession.bind(this);
  }

  startSessionMonitoring(): void {
    this.updateLastActivity();
    this.setupActivityListeners();
    
    // Start the session check timer
    this.sessionTimer = setInterval(() => {
      this.checkSessionStatus();
    }, SESSION_CHECK_INTERVAL);
  }

  stopSessionMonitoring(): void {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
    this.removeActivityListeners();
  }

  private setupActivityListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      const listener = () => this.updateLastActivity();
      document.addEventListener(event, listener, true);
      this.activityListeners.push(() => document.removeEventListener(event, listener, true));
    });
  }

  private removeActivityListeners(): void {
    this.activityListeners.forEach(removeListener => removeListener());
    this.activityListeners = [];
  }

  updateLastActivity(): void {
    this.lastActivity = Date.now();
  }

  private async checkSessionStatus(): Promise<void> {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;

    // Check if user has been idle too long
    if (timeSinceLastActivity > SESSION_IDLE_TIME) {
      await this.handleIdleTimeout();
      return;
    }

    // Check session expiry
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const expiresAt = new Date(session.expires_at || 0).getTime();
      const timeUntilExpiry = expiresAt - now;

      // Warn user if session is about to expire
      if (timeUntilExpiry <= SESSION_WARNING_TIME && timeUntilExpiry > 0) {
        this.showSessionWarning(timeUntilExpiry);
      }

      // Auto-refresh if needed
      if (timeUntilExpiry <= SESSION_CHECK_INTERVAL) {
        await this.refreshSession();
      }
    }
  }

  private async handleIdleTimeout(): Promise<void> {
    console.log('Session timeout due to inactivity');
    await supabase.auth.signOut();
    
    // Optional: Show notification to user
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Session Expired', {
        body: 'You have been logged out due to inactivity.',
        icon: '/favicon.ico'
      });
    }
  }

  private showSessionWarning(timeRemaining: number): void {
    const minutes = Math.ceil(timeRemaining / 60000);
    console.log(`Session will expire in ${minutes} minute(s)`);
    
    // You can implement a toast notification here
    // For now, just log to console
  }

  async refreshSession(): Promise<void> {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Failed to refresh session:', error);
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      await supabase.auth.signOut();
    }
  }

  logoutOnPageClose(): void {
    // Set up beforeunload handler for security
    this.beforeUnloadHandler = (event: BeforeUnloadEvent) => {
      // Note: Modern browsers ignore custom messages in beforeunload
      event.preventDefault();
      
      // Use sendBeacon for reliable logout on page close
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/logout', JSON.stringify({ logout: true }));
      }
      
      // Fallback: try synchronous logout
      try {
        supabase.auth.signOut();
      } catch (error) {
        console.error('Logout on page close failed:', error);
      }
    };

    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  private removeBeforeUnloadHandler(): void {
    if (this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
      this.beforeUnloadHandler = null;
    }
  }

  // Cleanup method
  destroy(): void {
    this.stopSessionMonitoring();
    this.removeBeforeUnloadHandler();
  }
}

export const sessionManager = new SessionSecurityManager();

// Hook for easy integration with React components
export const useSessionSecurity = () => {
  const startMonitoring = () => sessionManager.startSessionMonitoring();
  const stopMonitoring = () => sessionManager.stopSessionMonitoring();
  const refreshSession = () => sessionManager.refreshSession();
  const updateActivity = () => sessionManager.updateLastActivity();

  return {
    startMonitoring,
    stopMonitoring,
    refreshSession,
    updateActivity
  };
};
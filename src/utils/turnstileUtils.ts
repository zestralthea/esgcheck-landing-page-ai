
export interface TurnstileConfig {
  sitekey: string;
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
  'refresh-expired'?: 'auto' | 'manual' | 'never';
  retry?: 'auto' | 'never';
  'retry-interval'?: number;
  appearance?: 'always' | 'execute' | 'interaction-only';
}

declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement | string, options: TurnstileConfig) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      execute: (container?: HTMLElement | string, options?: TurnstileConfig) => Promise<string>;
      isReady: () => boolean;
    };
  }
}

export const TURNSTILE_SITE_KEY = '0x4AAAAAABmAJXX1tHQtUYp_';

export const waitForTurnstile = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }

    let attempts = 0;
    const maxAttempts = 30; // 15 seconds total
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      if (window.turnstile) {
        clearInterval(checkInterval);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        reject(new Error('Turnstile failed to load'));
      }
    }, 500);
  });
};

export const executeInvisibleTurnstile = async (): Promise<string> => {
  await waitForTurnstile();
  
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary invisible container
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);

      const widgetId = window.turnstile.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          // Clean up
          try {
            window.turnstile.remove(widgetId);
          } catch (e) {
            console.warn('Error removing invisible widget:', e);
          }
          document.body.removeChild(container);
          resolve(token);
        },
        'error-callback': () => {
          // Clean up
          try {
            window.turnstile.remove(widgetId);
          } catch (e) {
            console.warn('Error removing invisible widget:', e);
          }
          document.body.removeChild(container);
          reject(new Error('Turnstile verification failed'));
        },
        'timeout-callback': () => {
          // Clean up
          try {
            window.turnstile.remove(widgetId);
          } catch (e) {
            console.warn('Error removing invisible widget:', e);
          }
          document.body.removeChild(container);
          reject(new Error('Turnstile verification timeout'));
        },
        theme: 'light',
        size: 'normal',
        appearance: 'execute'
      });

    } catch (error) {
      console.error('Error executing invisible Turnstile:', error);
      reject(error);
    }
  });
};

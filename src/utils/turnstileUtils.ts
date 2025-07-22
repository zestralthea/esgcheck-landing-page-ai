
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
    if (window.turnstile?.isReady?.()) {
      resolve();
      return;
    }

    let attempts = 0;
    const maxAttempts = 60; // 30 seconds total
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      if (window.turnstile?.isReady?.()) {
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
  try {
    await waitForTurnstile();
    
    return new Promise((resolve, reject) => {
      // Create a temporary invisible container
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '300px';
      container.style.height = '65px';
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-1';
      document.body.appendChild(container);

      let widgetId: string;
      let isResolved = false;

      const cleanup = () => {
        if (container && container.parentNode) {
          try {
            if (widgetId && window.turnstile?.remove) {
              window.turnstile.remove(widgetId);
            }
          } catch (e) {
            console.warn('Error removing invisible Turnstile widget:', e);
          }
          document.body.removeChild(container);
        }
      };

      const timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          reject(new Error('Turnstile verification timeout'));
        }
      }, 30000); // 30 second timeout

      try {
        widgetId = window.turnstile.render(container, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => {
            if (!isResolved) {
              isResolved = true;
              clearTimeout(timeoutId);
              cleanup();
              console.log('Background Turnstile verification successful');
              resolve(token);
            }
          },
          'error-callback': () => {
            if (!isResolved) {
              isResolved = true;
              clearTimeout(timeoutId);
              cleanup();
              console.log('Background Turnstile verification failed');
              reject(new Error('Turnstile verification failed'));
            }
          },
          'timeout-callback': () => {
            if (!isResolved) {
              isResolved = true;
              clearTimeout(timeoutId);
              cleanup();
              reject(new Error('Turnstile verification timeout'));
            }
          },
          theme: 'light',
          size: 'normal',
          appearance: 'execute'
        });

      } catch (error) {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeoutId);
          cleanup();
          reject(error);
        }
      }
    });
  } catch (error) {
    console.error('Error executing invisible Turnstile:', error);
    throw error;
  }
};

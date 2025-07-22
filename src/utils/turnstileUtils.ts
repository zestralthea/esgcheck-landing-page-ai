
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
    turnstileLoadCallbacks?: (() => void)[];
  }
}

export const TURNSTILE_SITE_KEY = '0x4AAAAAABmAJXX1tHQtUYp_';

// Enhanced script loading with multiple detection methods
export const ensureTurnstileScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if Turnstile is already loaded and ready
    if (window.turnstile?.isReady?.()) {
      console.log('Turnstile already loaded and ready');
      resolve();
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src*="challenges.cloudflare.com"]');
    if (existingScript) {
      console.log('Turnstile script found in DOM, waiting for load...');
      // Script exists, wait for it to load
      waitForTurnstileLoad().then(resolve).catch(reject);
      return;
    }

    console.log('Loading Turnstile script...');
    
    // Create and inject the script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;

    let isResolved = false;

    const cleanup = () => {
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
    };

    const onLoad = () => {
      if (isResolved) return;
      console.log('Turnstile script loaded successfully');
      cleanup();
      waitForTurnstileLoad().then(() => {
        if (!isResolved) {
          isResolved = true;
          resolve();
        }
      }).catch((error) => {
        if (!isResolved) {
          isResolved = true;
          reject(error);
        }
      });
    };

    const onError = () => {
      if (isResolved) return;
      isResolved = true;
      cleanup();
      console.error('Failed to load Turnstile script');
      reject(new Error('Failed to load Turnstile script'));
    };

    script.addEventListener('load', onLoad);
    script.addEventListener('error', onError);

    // Fallback timeout
    setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        cleanup();
        console.error('Turnstile script loading timeout');
        reject(new Error('Turnstile script loading timeout'));
      }
    }, 15000);

    document.head.appendChild(script);
  });
};

// Enhanced waiting mechanism with better detection
const waitForTurnstileLoad = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 60; // 30 seconds
    let isResolved = false;

    const checkTurnstile = () => {
      if (isResolved) return;
      
      attempts++;
      console.log(`Checking Turnstile availability (attempt ${attempts}/${maxAttempts})`);

      // Multiple checks for Turnstile availability
      const hasTurnstileObject = typeof window.turnstile === 'object' && window.turnstile !== null;
      const hasRenderMethod = typeof window.turnstile?.render === 'function';
      const hasIsReadyMethod = typeof window.turnstile?.isReady === 'function';
      const isReady = window.turnstile?.isReady?.() === true;

      console.log('Turnstile check:', {
        hasTurnstileObject,
        hasRenderMethod,
        hasIsReadyMethod,
        isReady,
        turnstileType: typeof window.turnstile
      });

      if (hasTurnstileObject && hasRenderMethod && hasIsReadyMethod && isReady) {
        isResolved = true;
        console.log('Turnstile is fully ready');
        resolve();
        return;
      }

      if (attempts >= maxAttempts) {
        isResolved = true;
        console.error('Turnstile failed to become ready within timeout period');
        reject(new Error('Turnstile failed to load properly'));
        return;
      }

      setTimeout(checkTurnstile, 500);
    };

    checkTurnstile();
  });
};

// Improved waitForTurnstile with script loading
export const waitForTurnstile = (): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      // First ensure the script is loaded
      await ensureTurnstileScript();
      
      // Then wait for Turnstile to be ready
      if (window.turnstile?.isReady?.()) {
        console.log('Turnstile ready immediately');
        resolve();
        return;
      }

      await waitForTurnstileLoad();
      resolve();
    } catch (error) {
      console.error('Failed to load Turnstile:', error);
      reject(error);
    }
  });
};

export const executeInvisibleTurnstile = async (): Promise<string> => {
  try {
    console.log('Starting invisible Turnstile execution...');
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
      container.setAttribute('data-turnstile-invisible', 'true');
      document.body.appendChild(container);

      let widgetId: string;
      let isResolved = false;

      const cleanup = () => {
        if (container && container.parentNode) {
          try {
            if (widgetId && window.turnstile?.remove) {
              console.log('Cleaning up invisible widget:', widgetId);
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
          console.error('Invisible Turnstile verification timeout');
          reject(new Error('Turnstile verification timeout'));
        }
      }, 30000);

      try {
        console.log('Rendering invisible Turnstile widget...');
        widgetId = window.turnstile.render(container, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => {
            if (!isResolved) {
              isResolved = true;
              clearTimeout(timeoutId);
              cleanup();
              console.log('Invisible Turnstile verification successful');
              resolve(token);
            }
          },
          'error-callback': () => {
            if (!isResolved) {
              isResolved = true;
              clearTimeout(timeoutId);
              cleanup();
              console.error('Invisible Turnstile verification failed');
              reject(new Error('Turnstile verification failed'));
            }
          },
          'timeout-callback': () => {
            if (!isResolved) {
              isResolved = true;
              clearTimeout(timeoutId);
              cleanup();
              console.error('Invisible Turnstile verification timeout callback');
              reject(new Error('Turnstile verification timeout'));
            }
          },
          theme: 'light',
          size: 'normal',
          appearance: 'execute'
        });

        console.log('Invisible widget rendered with ID:', widgetId);

      } catch (error) {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeoutId);
          cleanup();
          console.error('Error rendering invisible Turnstile:', error);
          reject(error);
        }
      }
    });
  } catch (error) {
    console.error('Error executing invisible Turnstile:', error);
    throw error;
  }
};

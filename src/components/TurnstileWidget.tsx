
import React, { useEffect, useRef, useCallback } from 'react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement, options: any) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onVerify,
  onError,
  onExpire,
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const isRenderingRef = useRef(false);

  const resetWidget = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch (error) {
        console.error('Failed to reset Turnstile widget:', error);
      }
    }
  }, []);

  const removeWidget = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      } catch (error) {
        console.error('Failed to remove Turnstile widget:', error);
      }
    }
  }, []);

  const renderWidget = useCallback(() => {
    if (!widgetRef.current || !window.turnstile || isRenderingRef.current) {
      return;
    }

    // Remove existing widget if present
    if (widgetIdRef.current) {
      removeWidget();
    }

    try {
      isRenderingRef.current = true;
      
      widgetIdRef.current = window.turnstile.render(widgetRef.current, {
        sitekey: '0x4AAAAAABmAJXX1tHQtUYp_',
        callback: (token: string) => {
          console.log('Turnstile verification successful');
          onVerify(token);
        },
        'error-callback': () => {
          console.error('Turnstile verification failed');
          onError?.();
        },
        'expired-callback': () => {
          console.log('Turnstile token expired');
          onExpire?.();
        },
        theme: 'light',
        size: 'normal',
      });
      
      console.log('Turnstile widget rendered with ID:', widgetIdRef.current);
    } catch (error) {
      console.error('Failed to render Turnstile widget:', error);
      onError?.();
    } finally {
      isRenderingRef.current = false;
    }
  }, [onVerify, onError, onExpire, removeWidget]);

  useEffect(() => {
    // Check if Turnstile is already loaded
    if (window.turnstile) {
      renderWidget();
    } else {
      // Wait for Turnstile to load
      const checkTurnstile = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkTurnstile);
          renderWidget();
        }
      }, 100);

      // Cleanup interval after 10 seconds
      const timeoutId = setTimeout(() => {
        clearInterval(checkTurnstile);
        if (!window.turnstile) {
          console.error('Turnstile failed to load within 10 seconds');
          onError?.();
        }
      }, 10000);

      return () => {
        clearInterval(checkTurnstile);
        clearTimeout(timeoutId);
      };
    }

    return () => {
      removeWidget();
    };
  }, [renderWidget, removeWidget, onError]);

  // Expose reset function for parent components
  useEffect(() => {
    const widget = widgetRef.current;
    if (widget) {
      (widget as any).resetTurnstile = resetWidget;
    }
  }, [resetWidget]);

  return (
    <div className="flex justify-center my-4">
      <div ref={widgetRef} />
    </div>
  );
};

import React, { useEffect, useRef } from 'react';

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

  useEffect(() => {
    const renderWidget = () => {
      if (widgetRef.current && window.turnstile) {
        try {
          widgetIdRef.current = window.turnstile.render(widgetRef.current, {
            sitekey: '0x4AAAAAABmAJXX1tHQtUYp_',
            callback: onVerify,
            'error-callback': onError,
            'expired-callback': onExpire,
            theme: 'light',
            size: 'normal',
          });
        } catch (error) {
          console.error('Failed to render Turnstile widget:', error);
          onError?.();
        }
      }
    };

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
      setTimeout(() => clearInterval(checkTurnstile), 10000);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.error('Failed to remove Turnstile widget:', error);
        }
      }
    };
  }, [onVerify, onError, onExpire]);

  return (
    <div className="flex justify-center my-4">
      <div ref={widgetRef} />
    </div>
  );
};
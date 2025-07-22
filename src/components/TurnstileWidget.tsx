
import React, { useEffect, useRef, useCallback } from 'react';
import { TURNSTILE_SITE_KEY, waitForTurnstile } from '@/utils/turnstileUtils';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onVerify,
  onError,
  onExpire,
  className = ""
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  const isUnmountedRef = useRef(false);
  const renderAttemptsRef = useRef(0);

  const cleanupWidget = useCallback(() => {
    if (widgetIdRef.current && window.turnstile?.remove) {
      try {
        console.log('Cleaning up visible Turnstile widget:', widgetIdRef.current);
        window.turnstile.remove(widgetIdRef.current);
      } catch (error) {
        console.warn('Error during widget cleanup:', error);
      } finally {
        widgetIdRef.current = null;
        isInitializedRef.current = false;
        renderAttemptsRef.current = 0;
      }
    }
  }, []);

  const renderWidget = useCallback(async () => {
    if (!widgetRef.current || isInitializedRef.current || isUnmountedRef.current) {
      console.log('Skipping render:', {
        hasRef: !!widgetRef.current,
        isInitialized: isInitializedRef.current,
        isUnmounted: isUnmountedRef.current
      });
      return;
    }

    renderAttemptsRef.current++;
    console.log(`Attempting to render visible Turnstile widget (attempt ${renderAttemptsRef.current})`);

    try {
      await waitForTurnstile();
      
      if (isUnmountedRef.current) {
        console.log('Component unmounted during Turnstile loading');
        return;
      }

      if (!widgetRef.current) {
        console.error('Widget ref is null after Turnstile loading');
        return;
      }
      
      console.log('Rendering visible Turnstile widget...');
      
      widgetIdRef.current = window.turnstile.render(widgetRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          console.log('Visible Turnstile verification successful');
          onVerify(token);
        },
        'error-callback': () => {
          console.error('Visible Turnstile verification error');
          onError?.();
        },
        'expired-callback': () => {
          console.log('Visible Turnstile token expired');
          onExpire?.();
        },
        'timeout-callback': () => {
          console.log('Visible Turnstile timeout');
          onError?.();
        },
        theme: 'light',
        size: 'normal',
        'refresh-expired': 'auto',
        retry: 'auto',
      });
      
      if (widgetIdRef.current) {
        console.log('Visible Turnstile widget rendered successfully with ID:', widgetIdRef.current);
        isInitializedRef.current = true;
      } else {
        console.error('Failed to get widget ID from Turnstile render');
        onError?.();
      }
    } catch (error) {
      console.error('Failed to render visible Turnstile widget:', error);
      
      // Retry logic for failed renders
      if (renderAttemptsRef.current < 3 && !isUnmountedRef.current) {
        console.log(`Retrying widget render in 2 seconds (attempt ${renderAttemptsRef.current + 1}/3)`);
        setTimeout(() => {
          if (!isUnmountedRef.current) {
            renderWidget();
          }
        }, 2000);
      } else {
        console.error('Max render attempts reached or component unmounted');
        if (!isUnmountedRef.current) {
          onError?.();
        }
      }
    }
  }, [onVerify, onError, onExpire]);

  useEffect(() => {
    console.log('TurnstileWidget mounted');
    isUnmountedRef.current = false;
    renderWidget();
    
    return () => {
      console.log('TurnstileWidget unmounting');
      isUnmountedRef.current = true;
      cleanupWidget();
    };
  }, [renderWidget, cleanupWidget]);

  return (
    <div className={`flex justify-center ${className}`}>
      <div 
        ref={widgetRef} 
        style={{ minHeight: '65px', minWidth: '300px' }}
        data-testid="turnstile-widget"
      />
    </div>
  );
};


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

  const cleanupWidget = useCallback(() => {
    if (widgetIdRef.current && window.turnstile?.remove) {
      try {
        console.log('Cleaning up Turnstile widget:', widgetIdRef.current);
        window.turnstile.remove(widgetIdRef.current);
      } catch (error) {
        console.warn('Error during widget cleanup:', error);
      } finally {
        widgetIdRef.current = null;
        isInitializedRef.current = false;
      }
    }
  }, []);

  const renderWidget = useCallback(async () => {
    if (!widgetRef.current || isInitializedRef.current || isUnmountedRef.current) {
      return;
    }

    try {
      await waitForTurnstile();
      
      if (isUnmountedRef.current) {
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
        'retry': 'auto',
      });
      
      if (widgetIdRef.current) {
        console.log('Visible Turnstile widget rendered successfully');
        isInitializedRef.current = true;
      }
    } catch (error) {
      console.error('Failed to render visible Turnstile widget:', error);
      if (!isUnmountedRef.current) {
        onError?.();
      }
    }
  }, [onVerify, onError, onExpire]);

  useEffect(() => {
    isUnmountedRef.current = false;
    renderWidget();
    
    return () => {
      isUnmountedRef.current = true;
      cleanupWidget();
    };
  }, [renderWidget, cleanupWidget]);

  return (
    <div className={`flex justify-center ${className}`}>
      <div 
        ref={widgetRef} 
        style={{ minHeight: '65px', minWidth: '300px' }}
      />
    </div>
  );
};

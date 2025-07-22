
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
  const isInitializedRef = useRef(false);
  const errorCountRef = useRef(0);
  const lastRenderTimeRef = useRef(0);

  // Prevent rapid re-renders
  const MIN_RENDER_INTERVAL = 2000; // 2 seconds between renders
  const MAX_ERROR_COUNT = 3; // Maximum errors before giving up

  const cleanupWidget = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
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

  const resetWidget = useCallback(() => {
    if (widgetIdRef.current && window.turnstile && isInitializedRef.current) {
      try {
        console.log('Resetting Turnstile widget:', widgetIdRef.current);
        window.turnstile.reset(widgetIdRef.current);
        return true;
      } catch (error) {
        console.error('Failed to reset Turnstile widget:', error);
        return false;
      }
    }
    return false;
  }, []);

  const handleError = useCallback(() => {
    errorCountRef.current += 1;
    console.error(`Turnstile error ${errorCountRef.current}/${MAX_ERROR_COUNT}`);
    
    if (errorCountRef.current >= MAX_ERROR_COUNT) {
      console.error('Maximum Turnstile errors reached, stopping retries');
      onError?.();
      return;
    }

    // Try to reset instead of re-render on error
    setTimeout(() => {
      const resetSuccess = resetWidget();
      if (!resetSuccess) {
        console.warn('Reset failed, will attempt full re-render after delay');
        cleanupWidget();
        setTimeout(() => renderWidget(), 3000);
      }
    }, 1000);
  }, [onError, resetWidget, cleanupWidget]);

  const renderWidget = useCallback(() => {
    const now = Date.now();
    
    // Prevent rapid re-renders
    if (now - lastRenderTimeRef.current < MIN_RENDER_INTERVAL) {
      console.log('Render throttled, too soon since last render');
      return;
    }

    if (!widgetRef.current || !window.turnstile || isRenderingRef.current) {
      console.log('Cannot render: missing requirements or already rendering');
      return;
    }

    if (isInitializedRef.current && widgetIdRef.current) {
      console.log('Widget already initialized, skipping render');
      return;
    }

    try {
      isRenderingRef.current = true;
      lastRenderTimeRef.current = now;
      
      // Clean up any existing widget
      cleanupWidget();

      console.log('Rendering new Turnstile widget...');
      
      widgetIdRef.current = window.turnstile.render(widgetRef.current, {
        sitekey: '0x4AAAAAABmAJXX1tHQtUYp_',
        callback: (token: string) => {
          console.log('Turnstile verification successful');
          errorCountRef.current = 0; // Reset error count on success
          onVerify(token);
        },
        'error-callback': handleError,
        'expired-callback': () => {
          console.log('Turnstile token expired');
          onExpire?.();
        },
        'timeout-callback': () => {
          console.log('Turnstile timeout');
          handleError();
        },
        theme: 'light',
        size: 'normal',
        'refresh-expired': 'auto',
        'retry': 'auto',
      });
      
      if (widgetIdRef.current) {
        console.log('Turnstile widget rendered successfully with ID:', widgetIdRef.current);
        isInitializedRef.current = true;
      } else {
        throw new Error('Widget ID not returned from render');
      }
    } catch (error) {
      console.error('Failed to render Turnstile widget:', error);
      handleError();
    } finally {
      isRenderingRef.current = false;
    }
  }, [onVerify, onExpire, handleError, cleanupWidget]);

  // Initialize widget when Turnstile loads
  useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    const initializeTurnstile = () => {
      if (window.turnstile) {
        console.log('Turnstile API ready, initializing widget');
        renderWidget();
      } else {
        console.log('Waiting for Turnstile API to load...');
        checkInterval = setInterval(() => {
          if (window.turnstile) {
            clearInterval(checkInterval);
            renderWidget();
          }
        }, 500); // Check every 500ms instead of 100ms

        // Timeout after 15 seconds instead of 10
        timeoutId = setTimeout(() => {
          clearInterval(checkInterval);
          if (!window.turnstile) {
            console.error('Turnstile failed to load within 15 seconds');
            onError?.();
          }
        }, 15000);
      }
    };

    // Small delay to ensure DOM is ready
    const initTimeout = setTimeout(initializeTurnstile, 100);

    return () => {
      clearTimeout(initTimeout);
      clearInterval(checkInterval);
      clearTimeout(timeoutId);
      cleanupWidget();
    };
  }, []); // Empty dependency array to run only once

  // Expose reset function for parent components
  useEffect(() => {
    const widget = widgetRef.current;
    if (widget) {
      (widget as any).resetTurnstile = resetWidget;
    }
  }, [resetWidget]);

  return (
    <div className="flex justify-center my-4">
      <div 
        ref={widgetRef} 
        style={{ minHeight: '65px' }} // Reserve space to prevent layout shift
      />
      {errorCountRef.current >= MAX_ERROR_COUNT && (
        <div className="text-sm text-destructive text-center mt-2">
          Verification temporarily unavailable. Please try again later.
        </div>
      )}
    </div>
  );
};

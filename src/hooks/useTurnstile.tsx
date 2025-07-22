
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseTurnstileReturn {
  turnstileToken: string | null;
  turnstileError: boolean;
  isVerified: boolean;
  handleTurnstileVerify: (token: string) => void;
  handleTurnstileError: () => void;
  handleTurnstileExpire: () => void;
  resetTurnstile: () => void;
}

export const useTurnstile = (): UseTurnstileReturn => {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState(false);
  const { toast } = useToast();
  const errorToastShownRef = useRef(false);

  const handleTurnstileVerify = useCallback((token: string) => {
    console.log('Turnstile token received via hook:', token);
    setTurnstileToken(token);
    setTurnstileError(false);
    errorToastShownRef.current = false;
  }, []);

  const handleTurnstileError = useCallback(() => {
    console.error('Turnstile verification error via hook');
    setTurnstileToken(null);
    setTurnstileError(true);
    
    // Only show error toast once to prevent spam
    if (!errorToastShownRef.current) {
      errorToastShownRef.current = true;
      toast({
        title: "Verification failed",
        description: "Please try the verification challenge again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleTurnstileExpire = useCallback(() => {
    console.log('Turnstile token expired via hook');
    setTurnstileToken(null);
    setTurnstileError(false);
    errorToastShownRef.current = false;
    
    toast({
      title: "Verification expired",
      description: "Please complete the verification challenge again.",
      variant: "destructive",
    });
  }, [toast]);

  const resetTurnstile = useCallback(() => {
    setTurnstileToken(null);
    setTurnstileError(false);
    errorToastShownRef.current = false;
  }, []);

  return {
    turnstileToken,
    turnstileError,
    isVerified: Boolean(turnstileToken && !turnstileError),
    handleTurnstileVerify,
    handleTurnstileError,
    handleTurnstileExpire,
    resetTurnstile,
  };
};

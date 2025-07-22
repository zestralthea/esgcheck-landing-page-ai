
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { executeInvisibleTurnstile } from '@/utils/turnstileUtils';

interface UseTurnstileReturn {
  turnstileToken: string | null;
  turnstileError: boolean;
  isVerified: boolean;
  isVerifying: boolean;
  showWidget: boolean;
  handleTurnstileVerify: (token: string) => void;
  handleTurnstileError: () => void;
  handleTurnstileExpire: () => void;
  resetTurnstile: () => void;
  executeBackgroundVerification: () => Promise<string>;
}

export const useTurnstile = (): UseTurnstileReturn => {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const { toast } = useToast();
  const errorToastShownRef = useRef(false);
  const backgroundAttemptedRef = useRef(false);

  const handleTurnstileVerify = useCallback((token: string) => {
    console.log('Turnstile token received via hook:', token);
    setTurnstileToken(token);
    setTurnstileError(false);
    setShowWidget(false);
    setIsVerifying(false);
    errorToastShownRef.current = false;
    backgroundAttemptedRef.current = false;
  }, []);

  const handleTurnstileError = useCallback(() => {
    console.error('Turnstile verification error via hook');
    setTurnstileToken(null);
    setTurnstileError(true);
    setIsVerifying(false);
    
    // Show visible widget after background failure
    if (backgroundAttemptedRef.current && !showWidget) {
      setShowWidget(true);
      toast({
        title: "Verification required",
        description: "Please complete the verification challenge below.",
        variant: "destructive",
      });
    } else if (!errorToastShownRef.current) {
      errorToastShownRef.current = true;
      toast({
        title: "Verification failed",
        description: "Please try the verification challenge again.",
        variant: "destructive",
      });
    }
  }, [toast, showWidget]);

  const handleTurnstileExpire = useCallback(() => {
    console.log('Turnstile token expired via hook');
    setTurnstileToken(null);
    setTurnstileError(false);
    setIsVerifying(false);
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
    setIsVerifying(false);
    setShowWidget(false);
    errorToastShownRef.current = false;
    backgroundAttemptedRef.current = false;
  }, []);

  const executeBackgroundVerification = useCallback(async (): Promise<string> => {
    if (turnstileToken && !turnstileError) {
      return turnstileToken;
    }

    setIsVerifying(true);
    setTurnstileError(false);
    backgroundAttemptedRef.current = true;

    try {
      console.log('Attempting background Turnstile verification...');
      const token = await executeInvisibleTurnstile();
      console.log('Background verification successful:', token);
      handleTurnstileVerify(token);
      return token;
    } catch (error) {
      console.error('Background verification failed:', error);
      setIsVerifying(false);
      setShowWidget(true);
      throw error;
    }
  }, [turnstileToken, turnstileError, handleTurnstileVerify]);

  return {
    turnstileToken,
    turnstileError,
    isVerified: Boolean(turnstileToken && !turnstileError),
    isVerifying,
    showWidget,
    handleTurnstileVerify,
    handleTurnstileError,
    handleTurnstileExpire,
    resetTurnstile,
    executeBackgroundVerification,
  };
};


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
  const backgroundAttemptedRef = useRef(false);
  const backgroundAttemptsRef = useRef(0);

  const handleTurnstileVerify = useCallback((token: string) => {
    console.log('Turnstile token received:', token.substring(0, 20) + '...');
    setTurnstileToken(token);
    setTurnstileError(false);
    setShowWidget(false);
    setIsVerifying(false);
    backgroundAttemptedRef.current = false;
    backgroundAttemptsRef.current = 0;
  }, []);

  const handleTurnstileError = useCallback(() => {
    console.error('Turnstile verification error');
    setTurnstileToken(null);
    setTurnstileError(true);
    setIsVerifying(false);
    
    // Show visible widget after background failure
    if (backgroundAttemptedRef.current && !showWidget) {
      console.log('Showing visible widget after background failure');
      setShowWidget(true);
      toast({
        title: "Verification required",
        description: "Please complete the verification challenge below.",
        variant: "destructive",
      });
    }
  }, [toast, showWidget]);

  const handleTurnstileExpire = useCallback(() => {
    console.log('Turnstile token expired');
    setTurnstileToken(null);
    setTurnstileError(false);
    setIsVerifying(false);
    
    toast({
      title: "Verification expired",
      description: "Please complete the verification challenge again.",
      variant: "destructive",
    });
  }, [toast]);

  const resetTurnstile = useCallback(() => {
    console.log('Resetting Turnstile state');
    setTurnstileToken(null);
    setTurnstileError(false);
    setIsVerifying(false);
    setShowWidget(false);
    backgroundAttemptedRef.current = false;
    backgroundAttemptsRef.current = 0;
  }, []);

  const executeBackgroundVerification = useCallback(async (): Promise<string> => {
    if (turnstileToken && !turnstileError) {
      console.log('Using existing valid token');
      return turnstileToken;
    }

    backgroundAttemptsRef.current++;
    console.log(`Starting background verification attempt ${backgroundAttemptsRef.current}`);

    setIsVerifying(true);
    setTurnstileError(false);
    backgroundAttemptedRef.current = true;

    try {
      const token = await executeInvisibleTurnstile();
      console.log('Background verification successful');
      handleTurnstileVerify(token);
      return token;
    } catch (error) {
      console.error('Background verification failed:', error);
      setIsVerifying(false);
      
      // After multiple background failures, show visible widget
      if (backgroundAttemptsRef.current >= 2) {
        console.log('Multiple background failures, showing visible widget');
        setShowWidget(true);
        toast({
          title: "Verification required",
          description: "Please complete the verification challenge to continue.",
          variant: "destructive",
        });
      }
      
      throw error;
    }
  }, [turnstileToken, turnstileError, handleTurnstileVerify, toast]);

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

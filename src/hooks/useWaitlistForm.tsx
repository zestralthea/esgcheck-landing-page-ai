import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTurnstile } from "@/hooks/useTurnstile";
import { WaitlistFormValues } from "@/lib/validationSchemas";

export function useWaitlistForm() {
  const [formData, setFormData] = useState<WaitlistFormValues>({
    name: "",
    email: "",
    company: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const {
    turnstileToken,
    isVerified,
    isVerifying,
    showWidget,
    handleTurnstileVerify,
    handleTurnstileError,
    handleTurnstileExpire,
    resetTurnstile,
    executeBackgroundVerification,
  } = useTurnstile();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let token = turnstileToken;
      
      // Try background verification if not already verified
      if (!isVerified) {
        try {
          token = await executeBackgroundVerification();
        } catch (error) {
          // Background verification failed, widget should now be visible
          setIsLoading(false);
          return;
        }
      }
      
      const response = await fetch('https://equtqvlukqloqphhmblj.functions.supabase.co/verify-waitlist-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          turnstileToken: token
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        if (result.code === '23505') {
          toast({
            title: "Already on the waitlist!",
            description: "This email is already registered. We'll be in touch soon!",
          });
        } else if (result.error === 'Human verification failed') {
          toast({
            title: "Verification failed",
            description: "Please complete the human verification challenge again.",
            variant: "destructive",
          });
          resetTurnstile();
          return;
        } else {
          throw new Error(result.error || 'Failed to join waitlist');
        }
      } else {
        toast({
          title: "Welcome to the waitlist!",
          description: "Check your email for confirmation. We'll notify you when ESGCheck is ready for early access.",
        });
      }
      
      setIsSubmitted(true);
      
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: "", email: "", company: "" });
        resetTurnstile();
      }, 3000);
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isSubmitted,
    isLoading,
    isVerified,
    isVerifying,
    showWidget,
    handleChange,
    handleSubmit,
    handleTurnstileVerify,
    handleTurnstileError,
    handleTurnstileExpire
  };
}
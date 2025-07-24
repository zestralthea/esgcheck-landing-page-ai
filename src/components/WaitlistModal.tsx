
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useTurnstile } from "@/hooks/useTurnstile";
import { waitlistSchema, type WaitlistFormData, sanitizeInput } from "@/lib/validationSchemas";
import { checkFormSubmissionLimit, getRemainingCooldown } from "@/lib/rateLimiting";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [formData, setFormData] = useState<WaitlistFormData>({
    name: "",
    email: "",
    company: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof WaitlistFormData, string>>>({});
  const { toast } = useToast();
  const { t } = useLanguage();
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous validation errors
    setValidationErrors({});
    
    // Check rate limiting
    if (!checkFormSubmissionLimit('waitlist', formData.email)) {
      const remainingTime = getRemainingCooldown('waitlist', formData.email);
      const minutes = Math.ceil(remainingTime / 60000);
      toast({
        title: "Too Many Attempts",
        description: `Please wait ${minutes} minute(s) before trying again.`,
        variant: "destructive",
      });
      return;
    }

    // Validate form data
    const validation = waitlistSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Partial<Record<keyof WaitlistFormData, string>> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as keyof WaitlistFormData] = issue.message;
        }
      });
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: "Please check your input and try again.",
        variant: "destructive",
      });
      return;
    }
    
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
      
      console.log('Submitting waitlist modal with token:', token);
      
      // Sanitize inputs before sending
      const sanitizedData = {
        name: sanitizeInput(formData.name),
        email: sanitizeInput(formData.email),
        company: formData.company ? sanitizeInput(formData.company) : ""
      };
      
      const response = await fetch('https://equtqvlukqloqphhmblj.functions.supabase.co/verify-waitlist-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...sanitizedData,
          turnstileToken: token
        })
      });

      const result = await response.json();
      console.log('Server response:', result);
      
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
        onClose();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof WaitlistFormData]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", company: "" });
      setValidationErrors({});
      resetTurnstile();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-card border border-border/20 backdrop-blur">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold text-center">
            {t('waitlist.modal.title')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t('waitlist.modal.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Input
                    name="name"
                    placeholder={t('waitlist.modal.namePlaceholder')}
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`h-11 ${validationErrors.name ? 'border-destructive' : ''}`}
                  />
                  {validationErrors.name && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.name}</p>
                  )}
                </div>
                <div>
                  <Input
                    name="company"
                    placeholder={t('waitlist.modal.companyPlaceholder')}
                    value={formData.company}
                    onChange={handleChange}
                    className={`h-11 ${validationErrors.company ? 'border-destructive' : ''}`}
                  />
                  {validationErrors.company && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.company}</p>
                  )}
                </div>
                <div>
                  <Input
                    name="email"
                    type="email"
                    placeholder={t('waitlist.modal.emailPlaceholder')}
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`h-11 ${validationErrors.email ? 'border-destructive' : ''}`}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.email}</p>
                  )}
                </div>
               </div>
               
               {showWidget && (
                 <div className="space-y-2">
                   <p className="text-sm text-muted-foreground text-center">
                     Please complete the verification challenge:
                   </p>
                   <TurnstileWidget
                     onVerify={handleTurnstileVerify}
                     onError={handleTurnstileError}
                     onExpire={handleTurnstileExpire}
                   />
                 </div>
               )}
               
               <Button 
                 type="submit" 
                 variant="hero" 
                 size="lg" 
                 className="w-full group" 
                 disabled={isLoading || isVerifying || (showWidget && !isVerified)}
               >
                {isLoading || isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isVerifying ? "Verifying..." : t('waitlist.modal.submittingButton')}
                  </>
                ) : (
                  <>
                    {t('waitlist.modal.submitButton')}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                {t('waitlist.modal.disclaimer')}
              </p>
              <p className="text-xs text-success font-medium text-center mt-2">
                {t('waitlist.modal.betaNote')}
              </p>
            </form>
          ) : (
            <div className="py-6 text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-success mx-auto" />
              <h3 className="text-lg font-semibold text-foreground">
                {t('waitlist.modal.successTitle')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('waitlist.modal.successMessage')}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

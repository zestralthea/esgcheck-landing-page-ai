
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useTurnstile } from "@/hooks/useTurnstile";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const {
    turnstileToken,
    turnstileError,
    isVerified,
    handleTurnstileVerify,
    handleTurnstileError,
    handleTurnstileExpire,
    resetTurnstile,
  } = useTurnstile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isVerified) {
      toast({
        title: "Verification required",
        description: "Please complete the human verification challenge.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Submitting waitlist modal with token:', turnstileToken);
      
      // Send to verification endpoint
      const response = await fetch('https://equtqvlukqloqphhmblj.functions.supabase.co/verify-waitlist-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          turnstileToken: turnstileToken
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
      
      // Reset form after 3 seconds and close modal
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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", company: "" });
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
                <Input
                  name="name"
                  placeholder={t('waitlist.modal.namePlaceholder')}
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
                <Input
                  name="company"
                  placeholder={t('waitlist.modal.companyPlaceholder')}
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
                <Input
                  name="email"
                  type="email"
                  placeholder={t('waitlist.modal.emailPlaceholder')}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
               </div>
               
               <TurnstileWidget
                 onVerify={handleTurnstileVerify}
                 onError={handleTurnstileError}
                 onExpire={handleTurnstileExpire}
               />
               
               {turnstileError && (
                 <p className="text-sm text-destructive text-center">
                   Verification failed. Please try again.
                 </p>
               )}
               
               <Button type="submit" variant="hero" size="lg" className="w-full group" disabled={isLoading || !isVerified}>
                {isLoading ? t('waitlist.modal.submittingButton') : t('waitlist.modal.submitButton')}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
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

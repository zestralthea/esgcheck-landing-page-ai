import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useWaitlistForm } from "@/hooks/useWaitlistForm";
import { type WaitlistFormValues } from "@/lib/validationSchemas";
import { useState } from "react";
import { FormField } from "@/components/common/FormField";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/lib/variants";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof WaitlistFormValues, string>>>({});
  const { t } = useLanguage();
  
  const {
    formData,
    isSubmitted,
    isLoading,
    isVerified,
    isVerifying,
    showWidget,
    handleChange,
    handleSubmit: submitWaitlistForm,
    handleTurnstileVerify,
    handleTurnstileError,
    handleTurnstileExpire,
  } = useWaitlistForm();

  // Reset form and close modal after successful submission
  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, onClose]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[e.target.name as keyof WaitlistFormValues]) {
      setValidationErrors(prev => ({
        ...prev,
        [e.target.name]: undefined
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    submitWaitlistForm(e);
  };

  const handleClose = () => {
    if (!isLoading) {
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
                <FormField
                  name="name"
                  placeholder={t('waitlist.modal.namePlaceholder')}
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  error={validationErrors.name}
                />
                
                <FormField
                  name="company"
                  placeholder={t('waitlist.modal.companyPlaceholder')}
                  value={formData.company}
                  onChange={handleFormChange}
                  error={validationErrors.company}
                />
                
                <FormField
                  name="email"
                  type="email"
                  placeholder={t('waitlist.modal.emailPlaceholder')}
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  error={validationErrors.email}
                />
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
                className={cn(
                  "w-full group",
                  buttonVariants({ variant: "hero", size: "lg" })
                )}
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
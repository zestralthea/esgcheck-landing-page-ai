import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { SectionHeading } from "@/components/common/SectionHeading";
import { GradientCard } from "@/components/common/GradientCard";
import { useWaitlistForm } from "@/hooks/useWaitlistForm";

export default function WaitlistForm() {
  const { t } = useLanguage();
  const {
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
  } = useWaitlistForm();

  return (
    <section id="waitlist" className="py-20 bg-gradient-accent relative">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <SectionHeading
            title={t('waitlist.title')}
            description={t('waitlist.description')}
          />
          
          <GradientCard variant="gradient" hover="none">
            <CardHeader>
              <CardTitle className="text-2xl">{t('waitlist.cardTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      name="name"
                      placeholder={t('waitlist.modal.namePlaceholder')}
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="h-12"
                    />
                    <Input
                      name="company"
                      placeholder={t('waitlist.modal.companyPlaceholder')}
                      value={formData.company}
                      onChange={handleChange}
                      required
                      className="h-12"
                    />
                  </div>
                  <Input
                    name="email"
                    type="email"
                    placeholder={t('waitlist.modal.emailPlaceholder')}
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-12"
                  />
                   
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
                  <p className="text-sm text-muted-foreground">
                    {t('waitlist.modal.disclaimer')}
                  </p>
                  <p className="text-xs text-success font-medium">
                    {t('waitlist.modal.betaNote')}
                  </p>
                </form>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <CheckCircle className="h-16 w-16 text-success mx-auto" />
                  <h3 className="text-xl font-semibold text-foreground">
                    {t('waitlist.modal.successTitle')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('waitlist.modal.successMessage')}
                  </p>
                </div>
              )}
            </CardContent>
          </GradientCard>
        </div>
      </div>
    </section>
  );
}
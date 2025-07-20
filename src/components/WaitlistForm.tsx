
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

export default function WaitlistForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // First, insert into waitlist table
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            company: formData.company
          }
        ]);

      if (insertError) {
        // Handle duplicate email error specifically
        if (insertError.code === '23505') {
          toast({
            title: "Already on the waitlist!",
            description: "This email is already registered. We'll be in touch soon!",
          });
        } else {
          throw insertError;
        }
      } else {
        // If insertion successful, send confirmation email
        try {
          const { error: emailError } = await supabase.functions.invoke('send-waitlist-confirmation', {
            body: {
              name: formData.name,
              email: formData.email,
              company: formData.company
            }
          });

          if (emailError) {
            console.error('Error sending confirmation email:', emailError);
            // Don't fail the whole process if email fails
            toast({
              title: "Added to waitlist!",
              description: "You're on the waitlist! We'll notify you when ESGCheck is ready for early access.",
            });
          } else {
            toast({
              title: "Welcome to the waitlist!",
              description: "Check your email for confirmation. We'll notify you when ESGCheck is ready for early access.",
            });
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail the whole process if email fails
          toast({
            title: "Added to waitlist!",
            description: "You're on the waitlist! We'll notify you when ESGCheck is ready for early access.",
          });
        }
      }
      
      setIsSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: "", email: "", company: "" });
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

  return (
    <section id="waitlist" className="py-20 bg-gradient-accent relative">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {t('waitlist.title')}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('waitlist.description')}
            </p>
          </div>
          
          <Card className="border border-border/20 shadow-premium bg-gradient-card backdrop-blur">
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
                  <Button type="submit" variant="hero" size="lg" className="w-full group" disabled={isLoading}>
                    {isLoading ? t('waitlist.modal.submittingButton') : t('waitlist.modal.submitButton')}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
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
          </Card>
        </div>
      </div>
    </section>
  );
}

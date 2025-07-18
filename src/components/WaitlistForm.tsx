import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function WaitlistForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            company: formData.company
          }
        ]);

      if (error) {
        // Handle duplicate email error specifically
        if (error.code === '23505') {
          toast({
            title: "Already on the waitlist!",
            description: "This email is already registered. We'll be in touch soon!",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Welcome to the waitlist!",
          description: "We'll notify you when ESGCheck is ready for early access.",
        });
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
              Ready to Take the First Step Toward Real ESG Progress?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join the ESGCheck beta to get early access to our AI-powered ESG health check.
              It's free to try — and designed to help you understand where you stand, what's missing, and what comes next.
            </p>
          </div>
          
          <Card className="border border-border/20 shadow-premium bg-gradient-card backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">Get Early Access — and Help Shape the Future of ESG Insight</CardTitle>
              <CardDescription>
                Join the ESGCheck beta to get early access to our AI-powered ESG health check.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="h-12"
                    />
                    <Input
                      name="company"
                      placeholder="Company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      className="h-12"
                    />
                  </div>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Work Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-12"
                  />
                  <Button type="submit" variant="hero" size="lg" className="w-full group" disabled={isLoading}>
                    {isLoading ? "Joining..." : "Join Waitlist"}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Free during beta · No credit card · Privacy respected
                  </p>
                  <p className="text-xs text-success font-medium">
                    Early testers get free access and help us build ESGCheck into the tool you need.
                  </p>
                </form>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <CheckCircle className="h-16 w-16 text-success mx-auto" />
                  <h3 className="text-xl font-semibold text-foreground">Thank you!</h3>
                  <p className="text-muted-foreground">
                    You've been added to our waitlist. We'll be in touch soon with early access details.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12 text-center">
            <div>
              <div className="text-2xl font-bold text-success">Quick</div>
              <div className="text-muted-foreground">Setup process</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">Free</div>
              <div className="text-muted-foreground">Initial consultation</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">Multiple</div>
              <div className="text-muted-foreground">ESG frameworks</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
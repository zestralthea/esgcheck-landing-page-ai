import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function WaitlistForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    toast({
      title: "Welcome to the waitlist!",
      description: "We'll notify you when ESGCheck is ready for early access.",
    });
    
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", company: "" });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="waitlist" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Join the ESGCheck Waitlist
            </h2>
            <p className="text-xl text-muted-foreground">
              Be among the first to experience AI-powered ESG compliance. 
              Get early access and special launch pricing.
            </p>
          </div>
          
          <Card className="border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl">Request Early Access</CardTitle>
              <CardDescription>
                Join thousands of sustainability professionals already on our waitlist
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
                  <Button type="submit" variant="hero" size="lg" className="w-full group">
                    Join Waitlist
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    By joining, you agree to receive updates about ESGCheck. 
                    We respect your privacy and won't spam you.
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
              <div className="text-2xl font-bold text-foreground">2000+</div>
              <div className="text-muted-foreground">Companies on waitlist</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">50+</div>
              <div className="text-muted-foreground">Countries represented</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">90%</div>
              <div className="text-muted-foreground">Time savings vs. manual</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
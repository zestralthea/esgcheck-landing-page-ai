import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, FileText, BarChart3, Shield } from "lucide-react";
import { useWaitlistModal } from "@/hooks/useWaitlistModal";

export default function Hero() {
  const { openModal } = useWaitlistModal();
  
  return (
    <section className="py-20 bg-gradient-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Streamline Your{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  ESG Compliance
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Stop struggling with manual ESG reporting. Our AI helps you analyze your 
                sustainability data and improve your compliance process.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="premium" size="lg" className="group" onClick={openModal}>
                Join the Waitlist
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>No setup required</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Free compliance audit</span>
              </div>
            </div>
          </div>
          
          <div className="lg:pl-8 animate-slide-up">
            <Card className="p-8 shadow-premium bg-gradient-card border border-border/20 backdrop-blur">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">What You Get</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-4 rounded-lg bg-card/50">
                      <div className="flex items-center justify-center mb-2">
                        <FileText className="h-5 w-5 text-primary mr-2" />
                      </div>
                      <div className="text-sm font-medium text-foreground">Automated Data Collection</div>
                      <div className="text-xs text-muted-foreground mt-1">Import from multiple sources</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-card/50">
                      <div className="flex items-center justify-center mb-2">
                        <Shield className="h-5 w-5 text-primary mr-2" />
                      </div>
                      <div className="text-sm font-medium text-foreground">Compliance Guidance</div>
                      <div className="text-xs text-muted-foreground mt-1">Stay aligned with standards</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-card/50">
                      <div className="flex items-center justify-center mb-2">
                        <BarChart3 className="h-5 w-5 text-primary mr-2" />
                      </div>
                      <div className="text-sm font-medium text-foreground">Smart Analytics</div>
                      <div className="text-xs text-muted-foreground mt-1">AI-powered insights</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
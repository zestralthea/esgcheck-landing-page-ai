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
                Cut ESG Compliance Time{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  From Weeks to Hours
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Stop struggling with manual ESG reporting. Our AI instantly analyzes your 
                sustainability data and ensures 100% compliance with global standards.
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
                  <h3 className="text-lg font-semibold">Real Results</h3>
                </div>
                
                <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-success mb-1">6 weeks</div>
                  <div className="text-lg text-muted-foreground line-through">Manual Process</div>
                  <div className="text-xl font-semibold text-primary mt-2">2 hours with AI</div>
                </div>
                  
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="bg-gradient-primary h-3 rounded-full w-[97%] relative">
                    <div className="absolute right-2 top-0 text-xs text-primary-foreground font-bold leading-3">97% faster</div>
                  </div>
                </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 rounded-lg bg-card/50">
                      <div className="text-lg font-bold text-success">500+</div>
                      <div className="text-xs text-muted-foreground">Hours Saved</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-card/50">
                      <div className="text-lg font-bold text-success">50+</div>
                      <div className="text-xs text-muted-foreground">Frameworks</div>
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
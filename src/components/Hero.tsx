import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, FileText, BarChart3, Shield } from "lucide-react";
import { useWaitlistModal } from "@/hooks/useWaitlistModal";
import heroVideoBg from "@/assets/hero-video-bg.jpg";

export default function Hero() {
  const { openModal } = useWaitlistModal();
  
  return (
    <section className="py-20 bg-gradient-dark relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <img 
          src={heroVideoBg}
          alt="Forest and workplace environment"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/40 to-background/80"></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Automate Your{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  ESG Compliance
                </span>{" "}
                in Minutes
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                AI-powered ESG analysis that instantly checks your sustainability reports 
                against global standards like CSRD, GRI, and SFDR.
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
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Free trial included</span>
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
                  <h3 className="text-lg font-semibold">ESG Compliance Score</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall Score</span>
                    <span className="text-2xl font-bold text-success">87%</span>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-primary h-2 rounded-full w-[87%]"></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <FileText className="h-5 w-5 text-primary mx-auto mb-1" />
                      <div className="text-xs text-muted-foreground">Reports</div>
                      <div className="text-sm font-semibold">12</div>
                    </div>
                    <div className="text-center">
                      <Shield className="h-5 w-5 text-primary mx-auto mb-1" />
                      <div className="text-xs text-muted-foreground">Compliant</div>
                      <div className="text-sm font-semibold">94%</div>
                    </div>
                    <div className="text-center">
                      <BarChart3 className="h-5 w-5 text-primary mx-auto mb-1" />
                      <div className="text-xs text-muted-foreground">Risks</div>
                      <div className="text-sm font-semibold">3</div>
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
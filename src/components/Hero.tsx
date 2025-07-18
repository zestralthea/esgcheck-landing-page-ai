
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Play } from "lucide-react";
import { useWaitlistModal } from "@/hooks/useWaitlistModal";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  document.getElementById('hero-video')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Watch Demo
                <Play className="ml-2 h-4 w-4" />
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
            <Card className="overflow-hidden shadow-premium bg-gradient-card border border-border/20 backdrop-blur">
              <div className="relative" id="hero-video">
                <AspectRatio ratio={16 / 9}>
                  <div className="relative w-full h-full">
                    <video
                      src="/ESGCheck_hero.mp4"
                      title="ESGCheck Demo"
                      className="w-full h-full object-cover rounded-t-lg"
                      controls
                      preload="metadata"
                    />
                  </div>
                </AspectRatio>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-foreground">Automated</div>
                    <div className="text-xs text-muted-foreground">Data Collection</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-foreground">AI-Powered</div>
                    <div className="text-xs text-muted-foreground">Insights</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-foreground">Compliance</div>
                    <div className="text-xs text-muted-foreground">Guidance</div>
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

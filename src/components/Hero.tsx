
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
            <Card className="overflow-hidden shadow-premium bg-gradient-card border border-border/20 backdrop-blur">
              <div className="relative">
                <AspectRatio ratio={16 / 9}>
                  <div className="relative w-full h-full bg-gradient-to-br from-primary/10 to-success/10 flex items-center justify-center group cursor-pointer rounded-t-lg overflow-hidden">
                    {/* Video Thumbnail/Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-success/20"></div>
                    
                    {/* Play Button Overlay */}
                    <div className="relative z-10 flex flex-col items-center space-y-4 text-center p-8">
                      <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center group-hover:bg-primary transition-colors shadow-lg">
                        <Play className="h-6 w-6 text-primary-foreground ml-1" fill="currentColor" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">Watch ESGCheck in Action</h3>
                        <p className="text-sm text-muted-foreground">See how we simplify ESG compliance</p>
                      </div>
                    </div>
                    
                    {/* Optional: Replace with actual video embed */}
                    {/* Uncomment and replace with your video URL when ready */}
                    {/*
                    <iframe
                      src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                      title="ESGCheck Demo"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    */}
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

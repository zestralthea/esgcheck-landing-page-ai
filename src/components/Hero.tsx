
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useWaitlistModal } from "@/hooks/useWaitlistModal";

export default function Hero() {
  const { openModal } = useWaitlistModal();
  
  return (
    <section className="py-20 bg-gradient-dark relative overflow-hidden min-h-screen flex items-center">
      {/* Video Background */}
      <video
        src="/ESGCheck_hero.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/70 z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-success/10 z-20"></div>
      
      <div className="container mx-auto px-4 relative z-30">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground leading-tight">
              Stop Worrying About{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                ESG Deadlines
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Upload any ESG document and get instant compliance insights. Our AI identifies gaps, 
              suggests improvements, and keeps you ahead of regulatory changes.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="premium" size="lg" className="group" onClick={openModal}>
              Join the Waitlist
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-background/20 backdrop-blur border-border/50 hover:bg-background/30"
            >
              Watch Demo
              <Play className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Upload. Analyze. Improve.</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Results in under 2 minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Free trial • No credit card</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

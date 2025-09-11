import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useWaitlistModal } from "@/hooks/useWaitlistModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { GradientOverlay } from "@/components/common/GradientOverlay";
import { FeatureIndicator, FeatureIndicatorGroup } from "@/components/common/FeatureIndicator";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/lib/variants";

export default function Hero() {
  const { openModal } = useWaitlistModal();
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Safety timeout: don't block forever if video is slow
    const timeout = setTimeout(() => setReady(true), 1200);
    const v = videoRef.current;
    if (v) {
      const onReady = () => {
        setReady(true);
      };
      v.addEventListener('loadeddata', onReady, { once: true });
      v.addEventListener('canplaythrough', onReady, { once: true });
      return () => {
        clearTimeout(timeout);
        v.removeEventListener('loadeddata', onReady as any);
        v.removeEventListener('canplaythrough', onReady as any);
      };
    }
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="py-20 bg-gradient-dark relative overflow-hidden min-h-screen flex items-center">
      {/* Video Background */}
      <video
        ref={videoRef}
        src="/ESGCheck_hero_compressed.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      
      {/* Overlays for text readability using our reusable component */}
      <GradientOverlay 
        type="gradient" 
        opacity="heavy" 
        zIndex={10} 
        mediaOverlay={true}
      />
      {/* Multiply blend to uniformly reduce glare at ~20% overall */}
      <GradientOverlay 
        className="bg-black/20 mix-blend-multiply" 
        zIndex={18} 
      />
      
      <div className="container mx-auto px-4 relative z-30">
        <div
          className={cn(
            "max-w-4xl mx-auto text-center space-y-8 transition-opacity duration-500 will-change-[opacity]",
            ready ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight text-shadow-lg">
              {t('hero.title')}<br />
              <span className="bg-gradient-primary bg-clip-text text-transparent uppercase">
                {t('hero.titleHighlight')}
              </span>
            </h1>
            <p className="text-lg md:text-xl leading-8 text-foreground/95 max-w-[65ch] mx-auto text-shadow">
              {t('hero.description')}
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-2">
            <Button 
              variant="premium" 
              size="lg" 
              className="group"
              onClick={openModal}
            >
              {t('hero.joinWaitlist')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="text-sm text-foreground/80">{t('waitlist.modal.disclaimer')}</p>
          </div>
          
          <FeatureIndicatorGroup>
            <FeatureIndicator text={t('hero.uploadAnalyze')} />
            <FeatureIndicator text={t('hero.resultsTime')} />
            <FeatureIndicator text={t('hero.frameworks')} />
          </FeatureIndicatorGroup>
        </div>
      </div>
      {/* Stronger feather into the next section to mask rough boundary */}
      <div className="edge-fade-strong-bottom z-20" />
    </section>
  );
}

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
  
  return (
    <section className="py-20 bg-gradient-dark relative overflow-hidden min-h-screen flex items-center">
      {/* Video Background */}
      <video
        src="/ESGCheck_hero_compressed.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      
      {/* Overlays for text readability using our reusable component */}
      <GradientOverlay 
        type="gradient" 
        opacity="medium" 
        zIndex={10} 
        mediaOverlay={true}
      />
      <GradientOverlay 
        className="bg-gradient-to-br from-primary/10 via-transparent to-success/10" 
        zIndex={20} 
      />
      
      <div className="container mx-auto px-4 relative z-30">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground leading-tight">
              {t('hero.title')}<br />
              <span className="bg-gradient-primary bg-clip-text text-transparent uppercase">
                {t('hero.titleHighlight')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
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
            <p className="text-sm text-muted-foreground">{t('waitlist.modal.disclaimer')}</p>
          </div>
          
          <FeatureIndicatorGroup>
            <FeatureIndicator text={t('hero.uploadAnalyze')} />
            <FeatureIndicator text={t('hero.resultsTime')} />
            <FeatureIndicator text={t('hero.frameworks')} />
          </FeatureIndicatorGroup>
        </div>
      </div>
    </section>
  );
}
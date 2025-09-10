import { BarChart3, AlertTriangle, Lightbulb, FileText, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SectionHeading } from "@/components/common/SectionHeading";
import { FeatureItem } from "@/components/common/FeatureItem";
import { GradientOverlay } from "@/components/common/GradientOverlay";
import { GradientCard } from "@/components/common/GradientCard";

export default function Features() {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: BarChart3,
      title: t('features.score.title'),
      description: t('features.score.description')
    },
    {
      icon: AlertTriangle,
      title: t('features.risks.title'),
      description: t('features.risks.description')
    },
    {
      icon: Lightbulb,
      title: t('features.suggestions.title'),
      description: t('features.suggestions.description')
    },
    {
      icon: FileText,
      title: t('features.summary.title'),
      description: t('features.summary.description')
    },
    {
      icon: Clock,
      title: t('features.upload.title'),
      description: t('features.upload.description')
    }
  ];

  return (
    <section id="features" className="py-20 relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/Social.jpg)' }}>
      <GradientOverlay type="blur" opacity="heavy" mediaOverlay={true} />
      
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading 
          title={t('features.title')}
          description={t('features.subtitle')}
          secondaryDescription={t('features.subtitleTwo')}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 justify-items-center max-w-5xl mx-auto">
          {benefits.slice(0, 3).map((benefit, index) => (
            <FeatureItem
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 justify-items-center max-w-3xl mx-auto">
          {benefits.slice(3).map((benefit, index) => (
            <FeatureItem
              key={index + 3}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>

        {/* Trust Block */}
        <GradientCard variant="gradient" hover="none" className="p-8 text-center shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col justify-center">
              <div className="text-base font-medium text-foreground mb-2">{t('features.trust.frameworks')}</div>
              <div className="text-sm text-muted-foreground">{t('features.trust.frameworksDesc')}</div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-base font-medium text-foreground mb-2">{t('features.trust.audit')}</div>
              <div className="text-sm text-muted-foreground">{t('features.trust.auditDesc')}</div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-base font-medium text-foreground mb-2">{t('features.trust.security')}</div>
              <div className="text-sm text-muted-foreground">{t('features.trust.securityDesc')}</div>
            </div>
          </div>
        </GradientCard>
      </div>
    </section>
  );
}
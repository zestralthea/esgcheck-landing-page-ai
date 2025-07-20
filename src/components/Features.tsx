
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, AlertTriangle, Lightbulb, FileText, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t('features.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('features.subtitle')}<br />
            {t('features.subtitleTwo')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 justify-items-center max-w-5xl mx-auto">
          {benefits.slice(0, 3).map((benefit, index) => (
            <Card key={index} className="border border-border/20 shadow-premium hover:shadow-glow bg-gradient-card backdrop-blur transition-all duration-500 hover:scale-105 group max-w-sm">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300 mx-auto">
                  <benefit.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl text-center">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base text-center">
                  {benefit.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 justify-items-center max-w-3xl mx-auto">
          {benefits.slice(3).map((benefit, index) => (
            <Card key={index + 3} className="border border-border/20 shadow-premium hover:shadow-glow bg-gradient-card backdrop-blur transition-all duration-500 hover:scale-105 group max-w-sm">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300 mx-auto">
                  <benefit.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl text-center">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base text-center">
                  {benefit.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Block */}
        <div className="bg-gradient-card border border-border/20 rounded-lg p-8 text-center shadow-card">
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
        </div>
      </div>
    </section>
  );
}

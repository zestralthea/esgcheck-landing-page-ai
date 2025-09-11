
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Settings, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutSection() {
  const { t } = useLanguage();

  const valueCards = [
    {
      icon: Lightbulb,
      title: t('about.clarity.title'),
      description: t('about.clarity.description')
    },
    {
      icon: Settings,
      title: t('about.improving.title'),
      description: t('about.improving.description')
    },
    {
      icon: Shield,
      title: t('about.secure.title'),
      description: t('about.secure.description')
    }
  ];

  return (
    <section id="about" className="py-20 bg-muted/30 relative bg-cover bg-center bg-no-repeat hairline-sep-t hairline-sep-b" style={{ backgroundImage: 'url(/Governance.jpg)' }}>
      {/* Overlays tuned for static image background */}
      <div className="absolute inset-0 bg-black/25 mix-blend-multiply"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.12)_40%,rgba(0,0,0,0.32)_80%)]"></div>
      <div className="absolute inset-0 backdrop-blur-[2px]"></div>
      {/* Feather from previous media section */}
      <div className="edge-fade-top z-20 absolute inset-x-0 top-0" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-shadow-lg">
            {t('about.title')}
          </h2>
          <div className="max-w-4xl mx-auto space-y-4">
            <p className="text-lg text-foreground/95 text-shadow">
              {t('about.description')}
            </p>
            <p className="text-lg text-foreground/95 text-shadow">
              {t('about.team')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {valueCards.map((card, index) => (
            <Card key={index} className="border border-border/20 shadow-premium hover:shadow-glow bg-gradient-card backdrop-blur transition-all duration-500 hover:scale-105 group text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300 mx-auto">
                  <card.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

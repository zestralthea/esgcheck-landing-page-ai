import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Briefcase, Users, Factory } from "lucide-react";

const targetSegments = [
  {
    icon: Building2,
    title: "Mid-Market Companies",
    description: "500-5000 employees preparing for mandatory ESG disclosure requirements",
    details: ["First-time CSRD compliance", "Limited sustainability teams", "Need cost-effective solutions"],
    badge: "Primary Focus"
  },
  {
    icon: Briefcase,
    title: "Sustainability Consultants", 
    description: "Advisors helping multiple clients improve their ESG compliance and reporting",
    details: ["Scale expertise across clients", "Deliver faster results", "Reduce research time"],
    badge: "Key Partner"
  },
  {
    icon: Users,
    title: "In-House ESG Teams",
    description: "Sustainability professionals at companies managing ESG programs internally",
    details: ["Overwhelmed by manual processes", "Need to prove ROI", "Want data-driven insights"],
    badge: "Core User"
  },
  {
    icon: Factory,
    title: "ESG Software Companies",
    description: "Platform providers looking to enhance their compliance capabilities with AI",
    details: ["White-label integration", "API access", "Enhanced client value"],
    badge: "B2B Partner"
  }
];

export default function TargetMarket() {
  return (
    <section id="target-market" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Built for ESG Professionals
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're just starting your ESG journey or managing complex compliance programs, 
            we've designed solutions for every stage of ESG maturity
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {targetSegments.map((segment, index) => (
            <Card key={index} className="border border-border/20 shadow-premium hover:shadow-glow bg-gradient-card backdrop-blur transition-all duration-500 hover:scale-105 group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                    <segment.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {segment.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{segment.title}</CardTitle>
                <CardDescription className="text-base">
                  {segment.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Key Needs:
                  </h4>
                  <ul className="space-y-1">
                    {segment.details.map((detail, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="bg-gradient-card border border-border/20 rounded-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Perfect for Teams Who:</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-lg font-semibold text-primary">Struggle with Manual Processes</div>
                <p className="text-sm text-muted-foreground">Spending weeks analyzing documents and creating reports</p>
              </div>
              <div className="space-y-2">
                <div className="text-lg font-semibold text-primary">Need to Scale Expertise</div>
                <p className="text-sm text-muted-foreground">Limited team resources but growing compliance demands</p>
              </div>
              <div className="space-y-2">
                <div className="text-lg font-semibold text-primary">Want Data-Driven Insights</div>
                <p className="text-sm text-muted-foreground">Move beyond gut feelings to evidence-based improvements</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
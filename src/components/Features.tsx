
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Clock, TrendingUp, DollarSign, Users } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Slash Compliance Risks",
    description: "Identify gaps before they become costly regulatory violations. Our AI scans against 50+ frameworks including CSRD, GRI, SASB, and TCFD."
  },
  {
    icon: Clock,
    title: "Save 200+ Hours Per Report",
    description: "Automate the tedious work of gap analysis and compliance checking. Get from document upload to actionable insights in under 5 minutes."
  },
  {
    icon: TrendingUp,
    title: "Boost Your ESG Ratings",
    description: "Get specific, prioritized recommendations that directly improve your sustainability scores and investor confidence."
  },
  {
    icon: DollarSign,
    title: "Cut Consulting Costs by 70%",
    description: "Replace expensive consultants with AI-powered analysis that's faster, more comprehensive, and available 24/7."
  },
  {
    icon: Users,
    title: "Trusted by Sustainability Leaders",
    description: "Join forward-thinking companies who've already streamlined their ESG compliance and improved their market positioning."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gradient-accent">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Why Sustainability Teams Choose ESGCheck
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stop spending weeks on manual compliance checks. Get instant analysis, clear action plans, and regulatory confidence.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border border-border/20 shadow-premium hover:shadow-glow bg-gradient-card backdrop-blur transition-all duration-500 hover:scale-105 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                  <benefit.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {benefit.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Block */}
        <div className="bg-gradient-card border border-border/20 rounded-lg p-8 text-center shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Frameworks Supported</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">&lt;5min</div>
              <div className="text-sm text-muted-foreground">Analysis Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </div>
          </div>
          <p className="text-muted-foreground mt-6 text-sm">
            Trusted by sustainability professionals at companies worldwide
          </p>
        </div>
      </div>
    </section>
  );
}

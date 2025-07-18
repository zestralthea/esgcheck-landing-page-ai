
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Settings, Shield } from "lucide-react";

const valueCards = [
  {
    icon: Lightbulb,
    title: "Clarity over Complexity",
    description: "We turn dense ESG data into simple, actionable insights."
  },
  {
    icon: Settings,
    title: "Always Improving",
    description: "Use ESGCheck before, between, or even without formal audits to keep progress on track."
  },
  {
    icon: Shield,
    title: "Secure & Trustworthy",
    description: "Built on global frameworks (GRI, CSRD). Your data is always private."
  }
];

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Why we're building ESGCheck
          </h2>
          <div className="max-w-4xl mx-auto space-y-4">
            <p className="text-lg text-muted-foreground">
              We believe ESG transparency should be fast, accessible, and practical, not just reserved for large corporations with audit budgets. ESGCheck gives companies an easy starting point to track their environmental, social, and governance performance in real time, and improve over time.
            </p>
            <p className="text-lg text-muted-foreground">
              We're a small, Swiss-based team using AI to bring ESG clarity to those who need it most: growing businesses, consultants, and early-stage sustainability teams.
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

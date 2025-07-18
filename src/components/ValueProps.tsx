import { Clock, DollarSign, Shield, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Clock,
    metric: "90%",
    label: "Time Reduction",
    description: "From weeks to hours"
  },
  {
    icon: DollarSign,
    metric: "$50K+",
    label: "Annual Savings",
    description: "Reduce consulting costs"
  },
  {
    icon: Shield,
    metric: "100%",
    label: "Compliance Rate",
    description: "Never miss deadlines"
  },
  {
    icon: TrendingUp,
    metric: "2000+",
    label: "Companies Trust Us",
    description: "Join industry leaders"
  }
];

export default function ValueProps() {
  return (
    <section className="py-16 bg-background relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            The Results Speak for Themselves
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real metrics from real customers who've transformed their ESG compliance with our platform
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border border-border/20 bg-gradient-card hover:shadow-card transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto flex items-center justify-center">
                  <benefit.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-3xl font-bold text-success">{benefit.metric}</div>
                <div className="space-y-1">
                  <div className="text-lg font-semibold text-foreground">{benefit.label}</div>
                  <div className="text-sm text-muted-foreground">{benefit.description}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
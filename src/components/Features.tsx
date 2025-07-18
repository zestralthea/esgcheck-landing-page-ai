
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Brain, FileBarChart, Download, Target, DollarSign } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Instant Compliance Check",
    description: "Upload any ESG document and get a comprehensive compliance report in under 2 minutes."
  },
  {
    icon: Brain,
    title: "Never Miss Deadlines",
    description: "Built-in alerts for CSRD, GRI, SASB deadlines plus automatic regulatory updates."
  },
  {
    icon: Target,
    title: "Improve ESG Scores",
    description: "AI-powered recommendations show exactly how to boost your ratings and reduce risks."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gradient-accent">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Everything You Need for ESG Success
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three core capabilities that solve your biggest ESG compliance challenges
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border border-border/20 shadow-premium hover:shadow-glow bg-gradient-card backdrop-blur transition-all duration-500 hover:scale-105 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

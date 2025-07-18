
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, AlertTriangle, Lightbulb, FileText, Clock } from "lucide-react";

const benefits = [
  {
    icon: BarChart3,
    title: "A simple score that shows where you stand",
    description: "Get an instant ESG performance score that's easy to understand and benchmark against industry standards."
  },
  {
    icon: AlertTriangle,
    title: "Spot risks before investors or regulators do",
    description: "Identify compliance gaps and potential issues before they become costly problems or regulatory violations."
  },
  {
    icon: Lightbulb,
    title: "AI-generated suggestions tailored to your report",
    description: "Receive specific, actionable recommendations based on your actual data and industry best practices."
  },
  {
    icon: FileText,
    title: "A clean summary PDF you can share with your team",
    description: "Export professional reports that communicate your ESG progress clearly to stakeholders and leadership."
  },
  {
    icon: Clock,
    title: "Upload once, get insights in minutes",
    description: "Transform weeks of analysis into minutes. Just upload your report and get comprehensive insights instantly."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/Social.jpg)' }}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Get ESG clarity — without the complexity
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            ESGCheck gives you instant, actionable insights from your sustainability reports.
          </p>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            No consultants, No spreadsheets, No waiting weeks for feedback.
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
              <div className="text-base font-medium text-foreground mb-2">Built on global ESG frameworks like GRI & CSRD</div>
              <div className="text-sm text-muted-foreground">Industry-standard compliance foundation</div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-base font-medium text-foreground mb-2">Not a certified audit, but your smartest first step toward one</div>
              <div className="text-sm text-muted-foreground">Prepare confidently for formal assessments</div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-base font-medium text-foreground mb-2">Your data is never used to train models and stays secure</div>
              <div className="text-sm text-muted-foreground">Complete privacy and data protection</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

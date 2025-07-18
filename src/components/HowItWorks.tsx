import { Card, CardContent } from "@/components/ui/card";
import { Upload, Cpu, FileText, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload in Seconds",
    description: "Drop any ESG document - sustainability reports, policies, or raw data. Works with PDFs, Word docs, Excel files."
  },
  {
    icon: Cpu,
    title: "AI Does the Work",
    description: "Our AI instantly scans against 50+ frameworks (CSRD, GRI, SASB, TCFD) and flags every compliance gap."
  },
  {
    icon: FileText,
    title: "Get Actionable Results",
    description: "Receive detailed compliance scores, specific improvement recommendations, and board-ready reports in minutes."
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-dark relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            From Upload to Compliance in Under 5 Minutes
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stop spending weeks on manual compliance checks. See how easy ESG reporting becomes.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 md:gap-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="text-center p-8 border border-border/20 shadow-premium bg-gradient-card backdrop-blur hover:shadow-glow transition-all duration-500">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                      <step.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center shadow-sm">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
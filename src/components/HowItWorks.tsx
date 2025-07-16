import { Card, CardContent } from "@/components/ui/card";
import { Upload, Cpu, FileText, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Reports",
    description: "Simply drag and drop your ESG reports (PDF, Excel, CSV) into our secure platform."
  },
  {
    icon: Cpu,
    title: "AI Analysis",
    description: "Our AI engine analyzes your data against CSRD, GRI, SFDR and other global standards."
  },
  {
    icon: FileText,
    title: "Get Results",
    description: "Receive instant compliance scores, risk assessments, and actionable next steps."
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-accent">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            How ESGCheck Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get from ESG reports to compliance insights in three simple steps.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 md:gap-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="text-center p-8 border-0 shadow-card">
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
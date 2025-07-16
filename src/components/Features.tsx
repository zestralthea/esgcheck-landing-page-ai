import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Brain, FileBarChart, Download, Target, DollarSign } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Easy Upload",
    description: "Upload ESG reports in PDF, Excel, or CSV format with simple drag-and-drop interface."
  },
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced AI instantly analyzes your reports against CSRD, GRI, and SFDR standards."
  },
  {
    icon: FileBarChart,
    title: "Instant Scoring",
    description: "Get comprehensive compliance scores and risk assessments in minutes, not weeks."
  },
  {
    icon: Target,
    title: "Gap Analysis",
    description: "Identify specific compliance gaps with actionable recommendations for improvement."
  },
  {
    icon: Download,
    title: "PDF Summary",
    description: "Download professional reports ready for stakeholders, auditors, and regulators."
  },
  {
    icon: DollarSign,
    title: "Cost Effective",
    description: "Save thousands compared to manual consultants while getting faster, more accurate results."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Everything You Need for ESG Compliance
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your sustainability reporting with AI-powered analysis 
            that ensures compliance across all major ESG frameworks.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-card hover:shadow-elegant transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
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
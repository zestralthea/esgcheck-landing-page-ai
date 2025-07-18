
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Brain, FileBarChart, Download, Target, DollarSign, Clock, AlertTriangle, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Document Analysis",
    description: "Upload any sustainability report, policy document, or disclosure and get instant compliance analysis."
  },
  {
    icon: Brain,
    title: "AI Gap Identification",
    description: "Our AI scans your documents against 50+ frameworks (CSRD, GRI, SASB, TCFD) to find missing elements."
  },
  {
    icon: Target,
    title: "Improvement Roadmaps",
    description: "Get specific, actionable recommendations ranked by impact and effort to boost your ESG ratings."
  },
  {
    icon: Clock,
    title: "Deadline Management",
    description: "Never miss regulatory deadlines with built-in calendar alerts and automatic updates on new requirements."
  },
  {
    icon: FileBarChart,
    title: "Benchmark Scoring",
    description: "See how your ESG performance compares to industry peers and top performers in your sector."
  },
  {
    icon: AlertTriangle,
    title: "Risk Assessment",
    description: "Identify regulatory risks, materiality gaps, and compliance vulnerabilities before they become issues."
  },
  {
    icon: Download,
    title: "Report Generation",
    description: "Export ready-to-use compliance reports, gap analyses, and improvement plans in multiple formats."
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Monitor your ESG improvements over time with detailed analytics and progress dashboards."
  },
  {
    icon: DollarSign,
    title: "Cost Optimization",
    description: "Reduce consulting costs by 70% while improving compliance accuracy and reducing time-to-market."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gradient-accent">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Complete ESG Compliance Platform
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From document analysis to improvement tracking, we've built everything sustainability professionals need to excel
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

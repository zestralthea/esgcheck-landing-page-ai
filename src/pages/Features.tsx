
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, BarChart3, FileSearch, Globe, Zap } from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "Automated ESG Report Analysis",
    description: "Upload your ESG reports and get instant compliance analysis across multiple frameworks including GRI, SASB, and TCFD.",
    benefits: ["95% accuracy rate", "Sub-5 minute processing", "Multi-format support"]
  },
  {
    icon: Shield,
    title: "Regulatory Compliance Monitoring",
    description: "Stay ahead of changing regulations with real-time monitoring and alerts for new ESG requirements.",
    benefits: ["Global coverage", "Real-time alerts", "Regulatory mapping"]
  },
  {
    icon: BarChart3,
    title: "Performance Benchmarking",
    description: "Compare your ESG performance against industry peers and identify areas for improvement.",
    benefits: ["Industry comparisons", "Trend analysis", "Performance metrics"]
  },
  {
    icon: Globe,
    title: "Multi-Framework Support",
    description: "Support for all major ESG frameworks including GRI, SASB, TCFD, EU Taxonomy, and custom frameworks.",
    benefits: ["20+ frameworks", "Custom mapping", "Framework updates"]
  },
  {
    icon: Zap,
    title: "API Integration",
    description: "Seamlessly integrate ESG compliance checking into your existing workflows and systems.",
    benefits: ["REST API", "Webhook support", "Real-time processing"]
  },
  {
    icon: CheckCircle,
    title: "Compliance Dashboard",
    description: "Visual dashboard showing compliance status, gaps, and recommendations for improvement.",
    benefits: ["Visual reporting", "Gap analysis", "Action recommendations"]
  }
];

const featuresStructuredData = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "ESGCheck Features",
  "description": "Comprehensive ESG compliance features including automated report analysis, regulatory monitoring, and performance benchmarking",
  "provider": {
    "@type": "Organization",
    "name": "ESGCheck"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "hasFeature": features.map(feature => ({
    "@type": "SoftwareFeature",
    "name": feature.title,
    "description": feature.description
  }))
};

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="ESG Compliance Features | Automated Analysis & Monitoring | ESGCheck"
        description="Discover ESGCheck's powerful features: automated ESG report analysis, regulatory compliance monitoring, performance benchmarking, and multi-framework support for startups and SMEs."
        keywords="ESG features, automated analysis, compliance monitoring, performance benchmarking, GRI SASB TCFD support, ESG dashboard"
        canonicalUrl="https://esgcheck.lovable.app/features"
        structuredData={featuresStructuredData}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <BreadcrumbNav />
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Powerful Features for ESG Compliance
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive tools to streamline your sustainability reporting and ensure compliance across all major ESG frameworks.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Process Flow */}
        <div className="bg-muted/50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Upload Report", desc: "Upload your ESG report in any format" },
              { step: "2", title: "AI Analysis", desc: "Our AI analyzes against compliance frameworks" },
              { step: "3", title: "Gap Identification", desc: "Identify compliance gaps and risks" },
              { step: "4", title: "Get Recommendations", desc: "Receive actionable improvement recommendations" }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">{step.step}</span>
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          {[
            { number: "95%", label: "Accuracy Rate" },
            { number: "50+", label: "Frameworks Supported" },
            { number: "<5min", label: "Processing Time" },
            { number: "24/7", label: "Monitoring" }
          ].map((stat, index) => (
            <div key={index}>
              <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

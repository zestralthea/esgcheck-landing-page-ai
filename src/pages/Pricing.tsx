import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X } from "lucide-react";

const plans = [
  {
    name: "Pay Per Report",
    price: "$99",
    period: "per report",
    description: "Perfect for occasional compliance checks",
    features: [
      "Single report analysis",
      "Basic compliance check",
      "PDF report output",
      "Email support",
      "48-hour turnaround"
    ],
    limitations: [
      "No API access",
      "No bulk processing",
      "No custom frameworks"
    ],
    popular: false,
    cta: "Start Analysis"
  },
  {
    name: "Professional",
    price: "$299",
    period: "per month",
    description: "Continuous compliance monitoring for growing businesses",
    features: [
      "Up to 20 reports/month",
      "Real-time compliance monitoring",
      "Custom dashboard",
      "API access (limited)",
      "Priority support",
      "Advanced analytics",
      "Benchmark comparisons",
      "Automated alerts"
    ],
    limitations: [
      "Limited API calls",
      "No white-labeling"
    ],
    popular: true,
    cta: "Start Free Trial"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "Complete ESG compliance solution for large organizations",
    features: [
      "Unlimited reports",
      "Full API access",
      "Custom frameworks",
      "White-label solution",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantees",
      "Training & onboarding",
      "Multi-tenant support",
      "Advanced security"
    ],
    limitations: [],
    popular: false,
    cta: "Contact Sales"
  }
];

const annualDiscount = 20;

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose the plan that fits your ESG compliance needs. All plans include our core compliance checking features.
          </p>
          
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className="text-muted-foreground">Monthly</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" />
              <div className="w-14 h-8 bg-muted rounded-full p-1 duration-300 ease-in-out">
                <div className="bg-primary w-6 h-6 rounded-full shadow-md transform duration-300 ease-in-out"></div>
              </div>
            </div>
            <span className="text-foreground">Annual</span>
            <Badge variant="secondary" className="ml-2">Save {annualDiscount}%</Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative h-full ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground ml-2">{plan.period}</span>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                <div className="space-y-4 mb-8">
                  <div>
                    <h4 className="font-semibold mb-3 text-green-600">Included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 text-muted-foreground">Not included:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-muted/50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, bank transfers, and can accommodate invoice-based billing for Enterprise customers."
              },
              {
                q: "Can I change my plan anytime?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
              },
              {
                q: "Is there a free trial?",
                a: "Yes, we offer a 14-day free trial for the Professional plan with no commitment required."
              },
              {
                q: "What happens if I exceed my report limit?",
                a: "You can purchase additional reports at $99 each, or upgrade to a higher plan for better value."
              }
            ].map((faq, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
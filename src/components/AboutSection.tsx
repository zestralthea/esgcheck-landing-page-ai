
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Target, Users, Globe, Award, TrendingUp } from "lucide-react";

const teamMembers = [
  {
    name: "Sarah Chen",
    role: "CEO & Co-founder",
    bio: "Former sustainability director at Fortune 500 companies with 15+ years in ESG compliance.",
    image: "/placeholder.svg"
  },
  {
    name: "Marcus Johnson",
    role: "CTO & Co-founder", 
    bio: "AI researcher with expertise in natural language processing and regulatory compliance automation.",
    image: "/placeholder.svg"
  },
  {
    name: "Dr. Elena Rodriguez",
    role: "Head of Compliance",
    bio: "Former regulatory advisor with deep expertise in global ESG frameworks and standards.",
    image: "/placeholder.svg"
  }
];

const values = [
  {
    icon: Target,
    title: "Accuracy First",
    description: "We prioritize precision in compliance analysis to help organizations avoid costly regulatory missteps."
  },
  {
    icon: Globe,
    title: "Global Impact",
    description: "Supporting organizations worldwide in their journey toward sustainable and responsible business practices."
  },
  {
    icon: Users,
    title: "Transparency",
    description: "Clear, understandable insights that demystify complex ESG compliance requirements."
  }
];

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-lg">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Built by ESG Experts, for ESG Experts
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We've been in your shoes. Our team combines decades of sustainability expertise with cutting-edge AI 
            to solve the problems we faced every day in corporate ESG roles.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-3xl font-bold mb-6">Why We Built This</h3>
            <p className="text-muted-foreground mb-4">
              After years working in corporate sustainability roles, we were frustrated by the same problems everywhere: 
              manual document analysis taking weeks, missed regulatory deadlines, and expensive consultants who couldn't 
              scale to meet demand.
            </p>
            <p className="text-muted-foreground mb-4">
              The ESG compliance landscape is exploding. CSRD alone will impact 50,000+ companies by 2025. Meanwhile, 
              there are 150+ different frameworks to navigate, and regulations change every few months. Traditional 
              approaches simply can't keep up.
            </p>
            <p className="text-muted-foreground">
              ESGCheck automates the tedious work so you can focus on strategy and improvement. We built the tool 
              we wished we had when we were drowning in compliance requirements.
            </p>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>The ESG Challenge</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• CSRD compliance costs: €500K-2M per company</li>
                  <li>• Manual analysis: 40-80 hours per report</li>
                  <li>• 67% of companies feel unprepared for new regulations</li>
                  <li>• Average consultant cost: €200-500 per hour</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>Our Solution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Upload documents, get results in 2 minutes</li>
                  <li>• 90% reduction in analysis time</li>
                  <li>• 70% cost savings vs. traditional consulting</li>
                  <li>• Continuous monitoring of 50+ frameworks</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-8">Our Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-lg mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-8">Our Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4"></div>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary">{member.role}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Why It Matters Section */}
        <div className="bg-muted/50 rounded-lg p-8">
          <h3 className="text-3xl font-bold text-center mb-8">Why ESG Compliance Matters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold mb-4">Business Impact</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Access to sustainable financing and investment</li>
                <li>• Reduced regulatory and operational risks</li>
                <li>• Enhanced brand reputation and customer trust</li>
                <li>• Improved operational efficiency and cost savings</li>
                <li>• Better talent attraction and retention</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Global Impact</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Contributing to UN Sustainable Development Goals</li>
                <li>• Addressing climate change and environmental challenges</li>
                <li>• Promoting social equity and responsible governance</li>
                <li>• Building resilient and sustainable economies</li>
                <li>• Creating positive impact for future generations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

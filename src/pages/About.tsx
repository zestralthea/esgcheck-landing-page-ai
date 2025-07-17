import Header from "@/components/Header";
import Footer from "@/components/Footer";
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

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-lg">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            About ESGCheck
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to make ESG compliance accessible, accurate, and automated for organizations of all sizes.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-muted-foreground mb-4">
              Environmental, Social, and Governance (ESG) compliance has become critical for businesses worldwide. 
              However, navigating the complex landscape of regulations, frameworks, and reporting requirements 
              remains a significant challenge for many organizations.
            </p>
            <p className="text-muted-foreground mb-4">
              ESGCheck was born from the frustration of seeing companies struggle with manual compliance processes, 
              regulatory uncertainty, and the resource-intensive nature of traditional ESG reporting.
            </p>
            <p className="text-muted-foreground">
              We believe that technology can democratize access to accurate ESG compliance, enabling organizations 
              to focus on what matters most: building sustainable, responsible businesses that create positive impact.
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
                  <li>• 60% of companies struggle with ESG data collection</li>
                  <li>• Average compliance cost: $2.3M annually for large enterprises</li>
                  <li>• 150+ different ESG frameworks globally</li>
                  <li>• Regulatory changes happening every 6 months</li>
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
                  <li>• AI-powered compliance analysis</li>
                  <li>• 95% accuracy rate</li>
                  <li>• Sub-5 minute processing time</li>
                  <li>• Real-time regulatory monitoring</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
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
          <h2 className="text-3xl font-bold text-center mb-8">Our Team</h2>
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
          <h2 className="text-3xl font-bold text-center mb-8">Why ESG Compliance Matters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Business Impact</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Access to sustainable financing and investment</li>
                <li>• Reduced regulatory and operational risks</li>
                <li>• Enhanced brand reputation and customer trust</li>
                <li>• Improved operational efficiency and cost savings</li>
                <li>• Better talent attraction and retention</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Global Impact</h3>
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
      </main>

      <Footer />
    </div>
  );
}
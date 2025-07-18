import { Quote, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote: "ESGCheck cut our compliance reporting time from 6 weeks to 2 hours. It's literally a game-changer.",
    author: "Sarah Chen",
    title: "Sustainability Director",
    company: "TechCorp Global",
    rating: 5
  },
  {
    quote: "We caught 12 compliance gaps we missed in manual reviews. This tool pays for itself immediately.",
    author: "Marcus Rodriguez",
    title: "ESG Manager", 
    company: "Manufacturing Inc",
    rating: 5
  },
  {
    quote: "Finally, ESG reporting that doesn't require a PhD in sustainability. Simple, fast, accurate.",
    author: "Lisa Thompson",
    title: "CFO",
    company: "GreenTech Solutions",
    rating: 5
  }
];

const logos = [
  "Microsoft", "Deloitte", "Unilever", "BP", "IKEA", "Salesforce"
];

export default function SocialProof() {
  return (
    <section className="py-20 bg-gradient-accent relative">
      <div className="container mx-auto px-4">
        {/* Trusted by */}
        <div className="text-center mb-16">
          <p className="text-lg text-muted-foreground mb-8">Trusted by sustainability teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {logos.map((logo, index) => (
              <div key={index} className="text-lg font-semibold text-foreground">
                {logo}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Loved by ESG Professionals
          </h2>
          <div className="flex justify-center items-center space-x-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-primary text-primary" />
            ))}
            <span className="ml-2 text-muted-foreground">4.9/5 from 500+ reviews</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border border-border/20 bg-gradient-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-primary mb-4" />
                <p className="text-foreground mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.title}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
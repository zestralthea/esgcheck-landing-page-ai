
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import WaitlistCTA from "@/components/WaitlistCTA";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import SEOHead from "@/components/SEOHead";
import { Helmet } from "react-helmet-async";

const homeStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ESGCheck",
  "description": "AI-powered ESG report insights for startups and SMEs",
  "url": "https://esgcheck.lovable.app/",
  "logo": "https://esgcheck.lovable.app/esgcheck_logo.svg",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "provider": {
    "@type": "Organization",
    "name": "ESGCheck",
    "url": "https://esgcheck.lovable.app/"
  },
  "featureList": [
    "Automated ESG Report Analysis",
    "Multi-Framework Support",
    "Report Gap Detection",
    "AI-Generated Improvement Suggestions",
    "Shareable ESG Summary"
  ],
  "keywords": "ESG compliance, sustainability reporting, AI analysis, GRI, SASB, TCFD"
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <link rel="preload" as="video" href="/ESGCheck_hero_compressed.mp4" type="video/mp4" />
      </Helmet>
      <SEOHead 
        structuredData={homeStructuredData}
      />
      
      <Header />
      <Hero />
      <Features />
      <AboutSection />
      <WaitlistCTA />
      <Footer />
    </div>
  );
};

export default Index;

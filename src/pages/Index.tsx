
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import WaitlistForm from "@/components/WaitlistForm";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import WaitlistModal from "@/components/WaitlistModal";
import SEOHead from "@/components/SEOHead";
import { useWaitlistModal } from "@/hooks/useWaitlistModal";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

const homeStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ESGCheck",
  "description": "AI-powered ESG compliance reporting and analysis platform for startups and SMEs",
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
    "Regulatory Compliance Monitoring", 
    "Performance Benchmarking",
    "Multi-Framework Support",
    "API Integration",
    "Compliance Dashboard"
  ],
  "keywords": "ESG compliance, sustainability reporting, AI analysis, GRI, SASB, TCFD"
};

const Index = () => {
  const { isOpen, closeModal } = useWaitlistModal();
  useSmoothScroll(); // Enable smooth scrolling and hash navigation
  
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        structuredData={homeStructuredData}
      />
      
      <Header />
      <Hero />
      <Features />
      <AboutSection />
      <WaitlistForm />
      <Footer />
      <WaitlistModal isOpen={isOpen} onClose={closeModal} />
    </div>
  );
};

export default Index;

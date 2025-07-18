
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import TargetMarket from "@/components/TargetMarket";
import ValueProps from "@/components/ValueProps";
import HowItWorks from "@/components/HowItWorks";
import WaitlistForm from "@/components/WaitlistForm";
import Footer from "@/components/Footer";
import WaitlistModal from "@/components/WaitlistModal";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import { useWaitlistModal } from "@/hooks/useWaitlistModal";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

const Index = () => {
  const { isOpen, closeModal } = useWaitlistModal();
  useSmoothScroll(); // Enable smooth scrolling and hash navigation
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <TargetMarket />
      <ValueProps />
      <HowItWorks />
      <AboutSection />
      <ContactSection />
      <WaitlistForm />
      <Footer />
      <WaitlistModal isOpen={isOpen} onClose={closeModal} />
    </div>
  );
};

export default Index;

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ValueProps from "@/components/ValueProps";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import SocialProof from "@/components/SocialProof";
import WaitlistForm from "@/components/WaitlistForm";
import Footer from "@/components/Footer";
import WaitlistModal from "@/components/WaitlistModal";
import { useWaitlistModal } from "@/hooks/useWaitlistModal";

const Index = () => {
  const { isOpen, closeModal } = useWaitlistModal();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <ValueProps />
      <Features />
      <HowItWorks />
      <SocialProof />
      <WaitlistForm />
      <Footer />
      <WaitlistModal isOpen={isOpen} onClose={closeModal} />
    </div>
  );
};

export default Index;

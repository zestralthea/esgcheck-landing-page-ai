import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import WaitlistForm from "@/components/WaitlistForm";
import Footer from "@/components/Footer";
import WaitlistModal from "@/components/WaitlistModal";
import { WaitlistModalProvider, useWaitlistModal } from "@/hooks/useWaitlistModal";

function IndexContent() {
  const { isOpen, closeModal } = useWaitlistModal();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <WaitlistForm />
      <Footer />
      <WaitlistModal isOpen={isOpen} onClose={closeModal} />
    </div>
  );
}

const Index = () => {
  return (
    <WaitlistModalProvider>
      <IndexContent />
    </WaitlistModalProvider>
  );
};

export default Index;

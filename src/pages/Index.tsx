
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import WaitlistForm from "@/components/WaitlistForm";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import WaitlistModal from "@/components/WaitlistModal";
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
      <AboutSection />
      <WaitlistForm />
      <Footer />
      <WaitlistModal isOpen={isOpen} onClose={closeModal} />
    </div>
  );
};

export default Index;

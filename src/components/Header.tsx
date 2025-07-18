import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";
import { useWaitlistModal } from "@/hooks/useWaitlistModal";
import { Link, useLocation } from "react-router-dom";
const smoothScrollTo = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};
export default function Header() {
  const {
    openModal
  } = useWaitlistModal();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const handleNavClick = (sectionId: string) => {
    if (isHomePage) {
      smoothScrollTo(sectionId);
    } else {
      // Navigate to home page with hash
      window.location.href = `/#${sectionId}`;
    }
  };
  return <header className="border-b border-border bg-gradient-dark backdrop-blur supports-[backdrop-filter]:bg-gradient-dark/90 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-primary rounded-lg">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">ESGCheck</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <button onClick={() => handleNavClick('features')} className="transition-colors text-muted-foreground hover:text-foreground">
            Features
          </button>
          <button onClick={() => handleNavClick('about')} className="transition-colors text-muted-foreground hover:text-foreground">
            About
          </button>
          
        </nav>
        
        <Button variant="hero" size="sm" onClick={openModal}>
          Join Waitlist
        </Button>
      </div>
    </header>;
}
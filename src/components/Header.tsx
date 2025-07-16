import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-primary rounded-lg">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">ESGCheck</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#waitlist" className="text-muted-foreground hover:text-foreground transition-colors">
            Early Access
          </a>
        </nav>
        
        <Button variant="hero" size="sm">
          Join Waitlist
        </Button>
      </div>
    </header>
  );
}
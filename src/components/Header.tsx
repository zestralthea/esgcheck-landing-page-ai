import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";

const earlyAccessHref = "#waitlist";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 2);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { t } = useLanguage();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full">
        <div className="container mx-auto px-2 md:px-4">
          <div
            className={
              `hairline-sep-b backdrop-blur transition-colors duration-300 rounded-xl md:rounded-2xl ring-1 ring-border/10 ` +
              (scrolled
                ? "bg-background/55 supports-[backdrop-filter]:bg-background/45"
                : "bg-background/90 supports-[backdrop-filter]:bg-background/70")
            }
          >
            <div className="h-14 md:h-16 relative flex items-center px-2 md:px-4">
              <a href="#" className="flex items-center space-x-2">
                <img
                  src="/esgcheck_logo.svg"
                  alt="ESGCheck Logo"
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold text-foreground">ESGCheck</span>
              </a>

              <nav className="hidden md:flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2">
                <a
                  href="#features"
                  className="transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {t('header.features')}
                </a>
                <a
                  href="#about"
                  className="transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {t('header.about')}
                </a>
              </nav>

              <div className="flex items-center space-x-2 ml-auto">
                <Button asChild variant="hero" size="sm">
                  <a href={earlyAccessHref}>
                    {t('header.joinWaitlist')}
                  </a>
                </Button>
                <LanguageToggle />
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Spacer to offset fixed header height */}
      <div className="h-14 md:h-16" />
    </>
  );
}

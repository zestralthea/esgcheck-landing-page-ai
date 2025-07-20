
import { Leaf } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";

const smoothScrollTo = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};

export default function Footer() {
  const location = useLocation();
  const { t } = useLanguage();
  const isHomePage = location.pathname === '/';
  
  const handleNavClick = (sectionId: string) => {
    if (isHomePage) {
      smoothScrollTo(sectionId);
    } else {
      // Navigate to home page with hash
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <footer className="border-t border-border bg-gradient-dark">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-primary rounded-lg">
                  <Leaf className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">ESGCheck</span>
              </div>
              <LanguageToggle showOnMobile />
            </div>
            <p className="text-muted-foreground max-w-xs">{t('footer.description')}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.product')}</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><button onClick={() => handleNavClick('features')} className="hover:text-foreground transition-colors">{t('header.features')}</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><button onClick={() => handleNavClick('about')} className="hover:text-foreground transition-colors">{t('header.about')}</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.terms')}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            {t('footer.copyright')}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              LinkedIn
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Twitter
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

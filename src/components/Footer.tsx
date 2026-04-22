import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";

const earlyAccessHref = "#waitlist";
const contactHref = "mailto:hello@esgcheck.com?subject=ESGCheck%20early%20access";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="hairline-sep-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[2fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img 
                  src="/esgcheck_logo.svg" 
                  alt="ESGCheck Logo" 
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold text-foreground">ESGCheck</span>
              </div>
              <LanguageToggle showOnMobile />
            </div>
            <p className="text-muted-foreground max-w-xs">{t('footer.description')}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.product')}</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">
                  {t('header.features')}
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-foreground transition-colors">
                  {t('header.about')}
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#waitlist" className="hover:text-foreground transition-colors">
                  {t('header.joinWaitlist')}
                </a>
              </li>
              <li>
                <a href={contactHref} className="hover:text-foreground transition-colors">
                  hello@esgcheck.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            {t('footer.copyright')}
          </p>
          <a href={earlyAccessHref} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t('waitlist.ctaButton')}
          </a>
        </div>
      </div>
    </footer>
  );
}

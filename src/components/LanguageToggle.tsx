
import { Button } from "@/components/ui/button";
import { useLanguage, Language } from "@/contexts/LanguageContext";

export default function LanguageToggle({ showOnMobile = false }: { showOnMobile?: boolean }) {
  const { language, setLanguage } = useLanguage();
  
  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
    { code: 'fr', label: 'FR' }
  ];

  return (
    <div className={`inline-flex h-11 shrink-0 items-center justify-center gap-1 self-center rounded-full border border-border bg-background/90 p-1 shadow-sm ${showOnMobile ? '' : 'hidden md:flex'}`}>
      {languages.map(({ code, label }) => (
        <Button
          key={code}
          variant={language === code ? "default" : "ghost"}
          size="sm"
          onClick={() => setLanguage(code)}
          className={`
            h-full rounded-full px-3 py-1 text-xs font-medium leading-none transition-all duration-200
            ${language === code 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }
          `}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

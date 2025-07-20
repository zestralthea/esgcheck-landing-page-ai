
import { Button } from "@/components/ui/button";
import { useLanguage, Language } from "@/contexts/LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  
  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
    { code: 'fr', label: 'FR' }
  ];

  return (
    <div className="hidden md:flex items-center space-x-1 bg-muted/50 rounded-md p-1">
      {languages.map(({ code, label }) => (
        <Button
          key={code}
          variant={language === code ? "default" : "ghost"}
          size="sm"
          onClick={() => setLanguage(code)}
          className={`
            px-3 py-1 text-xs font-medium transition-all duration-200
            ${language === code 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }
          `}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

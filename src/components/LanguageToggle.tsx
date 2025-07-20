
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'de' : 'en');
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleLanguage}
      className="flex items-center space-x-2 hover:bg-accent"
    >
      <Languages className="h-4 w-4" />
      <span className="text-sm font-medium">
        {language === 'en' ? 'DE' : 'EN'}
      </span>
    </Button>
  );
}

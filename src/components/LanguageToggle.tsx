import { m, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { microSpring } from "@/lib/motion";

export default function LanguageToggle({ showOnMobile = false }: { showOnMobile?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const languages: { code: Language; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "de", label: "DE" },
    { code: "fr", label: "FR" }
  ];

  return (
    <div className={`inline-flex h-11 shrink-0 items-center justify-center gap-1 self-center rounded-full border border-border bg-background/90 p-1 shadow-sm ${showOnMobile ? "" : "hidden md:flex"}`}>
      {languages.map(({ code, label }) => (
        <m.div
          key={code}
          whileHover={shouldReduceMotion ? undefined : { y: -1, transition: { duration: 0.18 } }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98, transition: microSpring }}
        >
          <Button
            variant={language === code ? "default" : "ghost"}
            size="sm"
            onClick={() => setLanguage(code)}
            className={`
              h-full rounded-full px-3 py-1 text-xs font-medium leading-none transition-all duration-200
              ${language === code
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }
            `}
          >
            {label}
          </Button>
        </m.div>
      ))}
    </div>
  );
}

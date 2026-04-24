import { LayoutGroup, m, useReducedMotion } from "framer-motion";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
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
    <LayoutGroup id="language-toggle">
      <div className={`inline-flex h-11 shrink-0 items-center justify-center gap-1 self-center rounded-full border border-border bg-background/90 p-1 shadow-sm ${showOnMobile ? "" : "hidden md:flex"}`}>
        {languages.map(({ code, label }) => {
          const isActive = language === code;

          return (
            <m.div
              key={code}
              className="flex h-full"
              whileHover={shouldReduceMotion ? undefined : { y: -1, transition: { duration: 0.18 } }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98, transition: microSpring }}
            >
              <button
                type="button"
                onClick={() => setLanguage(code)}
                className={cn(
                  "relative isolate flex h-full min-w-[3.1rem] items-center justify-center overflow-hidden rounded-full px-3 text-xs font-medium leading-none ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {isActive ? (
                  <m.span
                    layoutId="language-toggle-active"
                    className="absolute inset-[2px] rounded-full bg-primary shadow-sm"
                    transition={shouldReduceMotion ? { duration: 0.01 } : microSpring}
                  />
                ) : null}
                <span className="relative z-10">{label}</span>
              </button>
            </m.div>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

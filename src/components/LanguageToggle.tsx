import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Languages } from "lucide-react";
import { LayoutGroup, m, useReducedMotion } from "framer-motion";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { microSpring } from "@/lib/motion";

export type LanguageToggleMode = "full" | "compact" | "icon";

const languages: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "de", label: "DE" },
  { code: "fr", label: "FR" }
];

function LanguageMenuItems({
  language,
  setLanguage,
}: {
  language: Language;
  setLanguage: (lang: Language) => void;
}) {
  return (
    <DropdownMenu.RadioGroup
      value={language}
      onValueChange={(value) => setLanguage(value as Language)}
    >
      {languages.map(({ code, label }) => (
        <DropdownMenu.RadioItem
          key={code}
          value={code}
          className={cn(
            "relative flex cursor-default select-none items-center rounded-xl px-3 py-2 pr-9 text-sm font-medium outline-none transition-colors",
            "focus:bg-secondary focus:text-foreground data-[state=checked]:bg-secondary/90 data-[state=checked]:text-foreground",
            language === code ? "text-foreground" : "text-foreground/75"
          )}
        >
          {label}
          <DropdownMenu.ItemIndicator className="absolute right-3">
            <Check className="h-4 w-4 text-primary" />
          </DropdownMenu.ItemIndicator>
        </DropdownMenu.RadioItem>
      ))}
    </DropdownMenu.RadioGroup>
  );
}

export default function LanguageToggle({ mode }: { mode: LanguageToggleMode }) {
  const { language, setLanguage } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const activeLanguage = languages.find(({ code }) => code === language) ?? languages[0];

  if (mode === "full") {
    return (
      <LayoutGroup id="language-toggle">
        <div className="inline-flex h-11 shrink-0 items-center justify-center gap-1 self-center rounded-full border border-border bg-background/90 p-1 shadow-sm">
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

  const iconTriggerClasses =
    "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm ring-offset-background transition-colors duration-200 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  if (mode === "compact") {
    return (
      <DropdownMenu.Root modal={false}>
        <div className="inline-flex h-11 shrink-0 items-center justify-center gap-1 rounded-full border border-border bg-background/90 p-1 shadow-sm">
          <div className="inline-flex h-full min-w-[3.1rem] items-center justify-center rounded-full bg-primary px-3 text-xs font-medium leading-none text-primary-foreground shadow-sm">
            {activeLanguage.label}
          </div>
          <m.div
            className="flex h-full"
            whileHover={shouldReduceMotion ? undefined : { y: -1, transition: { duration: 0.18 } }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98, transition: microSpring }}
          >
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                aria-label={`Open language menu. Current language ${activeLanguage.label}`}
                className="inline-flex h-full min-w-[2.75rem] items-center justify-center rounded-full px-2.5 text-foreground/75 ring-offset-background transition-colors duration-200 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenu.Trigger>
          </m.div>
        </div>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="z-50 min-w-[7rem] rounded-2xl border border-border/80 bg-popover p-1.5 text-popover-foreground shadow-card outline-none"
          >
            <LanguageMenuItems language={language} setLanguage={setLanguage} />
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    );
  }

  return (
    <DropdownMenu.Root modal={false}>
      <m.div
        whileHover={shouldReduceMotion ? undefined : { y: -1, transition: { duration: 0.18 } }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98, transition: microSpring }}
      >
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label={
              `Open language menu. Current language ${activeLanguage.label}`
            }
            className={iconTriggerClasses}
          >
            <Languages className="h-[18px] w-[18px]" />
          </button>
        </DropdownMenu.Trigger>
      </m.div>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[7rem] rounded-2xl border border-border/80 bg-popover p-1.5 text-popover-foreground shadow-card outline-none"
        >
          <LanguageMenuItems language={language} setLanguage={setLanguage} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

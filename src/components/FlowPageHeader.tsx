import LanguageToggle from "@/components/LanguageToggle";
import { getLocalePath, useLanguage } from "@/contexts/LanguageContext";

export default function FlowPageHeader() {
  const { language } = useLanguage();

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border/60 bg-card px-5 py-5 text-left sm:px-8">
      <a href={getLocalePath(language)} className="flex min-w-0 items-center gap-3 text-foreground">
        <img
          src="/email-logo-mark.png"
          width="42"
          height="42"
          alt="ESGCheck"
          className="h-10 w-10 shrink-0"
        />
        <span className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
          <span className="text-primary">ESG</span>Check
        </span>
      </a>
      <div className="shrink-0">
        <LanguageToggle mode="compact" />
      </div>
    </header>
  );
}

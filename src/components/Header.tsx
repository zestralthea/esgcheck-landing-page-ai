import { CheckCircle2 } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { microSpring } from "@/lib/motion";
import LanguageToggle from "./LanguageToggle";

const earlyAccessHref = "#waitlist";

export default function Header() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const trustItems = [
    t("header.trustStrip.swissBuilt"),
    t("header.trustStrip.privacy"),
    t("header.trustStrip.growingSmes"),
  ];

  const links = [
    { href: "#product", label: t("header.product") },
    { href: "#how-it-works", label: t("header.howItWorks") },
    { href: "#why-esgcheck", label: t("header.whyEsgCheck") },
    { href: "#team", label: t("header.team") },
    { href: "#faq", label: t("header.faq") },
  ];

  return (
    <>
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto flex min-h-9 flex-nowrap items-center justify-center gap-x-[clamp(0.4rem,1.2vw,1.25rem)] overflow-x-auto px-4 py-2 text-[clamp(0.5rem,0.8vw,0.75rem)] font-medium whitespace-nowrap">
          {trustItems.map((item) => (
            <div key={item} className="flex items-center gap-[clamp(0.25rem,0.55vw,0.375rem)] whitespace-nowrap">
              <CheckCircle2 className="h-[clamp(0.625rem,1vw,0.875rem)] w-[clamp(0.625rem,1vw,0.875rem)] shrink-0" />
              <span className="leading-none">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 shadow-card backdrop-blur-md">
        <div className="container mx-auto grid h-[72px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4">
          <a href="#product" className="flex h-full items-center gap-3 self-center">
            <img
              src="/esgcheck_logo.svg"
              alt="ESGCheck Logo"
              className="h-8 w-8"
            />
            <span className="text-2xl font-semibold leading-none tracking-tight text-foreground">ESGCheck</span>
          </a>

          <nav className="hidden h-full items-center justify-center gap-6 self-center lg:flex">
            {links.map((link) => (
              <m.a
                key={link.href}
                href={link.href}
                className="inline-flex h-9 items-center leading-none text-sm font-medium text-foreground/75 transition-colors hover:text-foreground"
                whileHover={shouldReduceMotion ? undefined : { y: -1, transition: { duration: 0.18 } }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98, transition: microSpring }}
              >
                {link.label}
              </m.a>
            ))}
          </nav>

          <div className="flex h-full items-center justify-self-end gap-2 self-center leading-none">
            <m.div
              whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.2 } }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98, transition: microSpring }}
            >
              <Button asChild variant="hero" size="sm" className="hidden self-center rounded-xl px-4 leading-none transition-[box-shadow,opacity] hover:shadow-glow md:inline-flex">
                <a href={earlyAccessHref}>{t("header.joinWaitlist")}</a>
              </Button>
            </m.div>
            <div className="shrink-0">
              <LanguageToggle showOnMobile />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

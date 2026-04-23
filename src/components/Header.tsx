import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";

const earlyAccessHref = "#waitlist";

export default function Header() {
  const { t } = useLanguage();

  const trustItems = [
    t("header.trustStrip.swissBuilt"),
    t("header.trustStrip.privacy"),
    t("header.trustStrip.growingSmes"),
  ];

  const links = [
    { href: "#product", label: t("header.product") },
    { href: "#how-it-works", label: t("header.howItWorks") },
    { href: "#why-esgcheck", label: t("header.whyEsgCheck") },
    { href: "#roadmap", label: t("header.roadmap") },
    { href: "#team", label: t("header.team") },
    { href: "#faq", label: t("header.faq") },
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="bg-primary text-primary-foreground">
          <div className="container mx-auto flex min-h-9 flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 py-2 text-[11px] font-medium sm:text-xs">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-b border-border/80 bg-background/95 shadow-card backdrop-blur-md">
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
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex h-9 items-center leading-none text-sm font-medium text-foreground/75 transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex h-full items-center gap-2 self-center leading-none">
              <LanguageToggle showOnMobile />
              <Button asChild variant="hero" size="sm" className="self-center rounded-xl px-4 leading-none">
                <a href={earlyAccessHref}>{t("header.joinWaitlist")}</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="h-[108px] sm:h-[104px] lg:h-[98px]" />
    </>
  );
}

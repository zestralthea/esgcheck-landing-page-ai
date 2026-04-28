import {
  ArrowRight,
  Info,
  Leaf,
  Megaphone,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { m, useReducedMotion } from "framer-motion";
import FlowPageHeader from "@/components/FlowPageHeader";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import {
  defaultLanguage,
  getLocalePath,
  getLocaleUrl,
  languageMetadata,
  supportedLanguages,
  useLanguage,
} from "@/contexts/LanguageContext";
import { microSpring, revealUp } from "@/lib/motion";

export default function ThankYou() {
  const { t, language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const canonicalUrl = getLocaleUrl(language, "thankYou");
  const alternateLinks = [
    ...supportedLanguages.map((lang) => ({
      hrefLang: languageMetadata[lang].hrefLang,
      href: getLocaleUrl(lang, "thankYou"),
    })),
    {
      hrefLang: "x-default",
      href: getLocaleUrl(defaultLanguage, "thankYou"),
    },
  ];
  const cards: Array<{ icon: LucideIcon; title: string; description: string }> = [
    {
      icon: Megaphone,
      title: t("thankYou.cards.product.title"),
      description: t("thankYou.cards.product.description"),
    },
    {
      icon: Leaf,
      title: t("thankYou.cards.insights.title"),
      description: t("thankYou.cards.insights.description"),
    },
    {
      icon: ShieldCheck,
      title: t("thankYou.cards.access.title"),
      description: t("thankYou.cards.access.description"),
    },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--secondary))_100%)]">
      <SEOHead
        title={t("thankYou.seo.title")}
        description={t("thankYou.seo.description")}
        keywords={t("seo.keywords")}
        canonicalUrl={canonicalUrl}
        ogImageAlt={t("seo.ogImageAlt")}
        alternateLinks={alternateLinks}
        noindex
      />

      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-8 md:py-12">
        <m.section
          className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border/80 bg-card text-center shadow-elegant"
          initial="hidden"
          animate="visible"
          variants={revealUp}
          custom={shouldReduceMotion}
        >
          <FlowPageHeader />

          <div className="bg-secondary/35">
            <img
              src="/email-confirmation-hero.png"
              alt=""
              className="mx-auto block w-full max-w-[56rem]"
            />
          </div>

          <div className="px-6 py-10 sm:px-10 md:px-14 md:py-12">
            <h1 className="mx-auto max-w-2xl text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              {t("thankYou.title")}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-foreground/76">
              {t("thankYou.description")}
            </p>

            <m.div
              className="mx-auto mt-8 max-w-md"
              whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.2 } }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98, transition: microSpring }}
            >
              <Button asChild variant="hero" size="lg" className="w-full rounded-lg px-7">
                <a href={`${getLocalePath(language)}#product`}>
                  {t("thankYou.primaryCta")}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </m.div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {cards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="rounded-lg border border-border/80 bg-secondary/35 px-5 py-7 shadow-sm"
                  >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-card text-primary shadow-sm">
                      <Icon className="h-8 w-8" strokeWidth={1.8} />
                    </div>
                    <h2 className="mt-6 text-lg font-semibold tracking-tight text-foreground">
                      {card.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-foreground/70">
                      {card.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-lg border border-border/80 bg-secondary/35 p-5 text-left">
              <div className="mx-auto flex max-w-xl flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Info className="h-5 w-5" />
                </div>
                <p className="text-sm leading-7 text-foreground/76">
                  {t("thankYou.unsubscribeNote")}
                </p>
              </div>
            </div>

            <footer className="mt-10 border-t border-border/70 pt-8">
              <div className="flex items-center justify-center gap-2">
                <img
                  src="/email-logo-mark.png"
                  width="28"
                  height="28"
                  alt=""
                  className="h-7 w-7"
                />
                <span className="text-2xl font-semibold tracking-tight text-foreground">
                  <span className="text-primary">ESG</span>Check
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-foreground/68">
                {t("thankYou.footerTagline")}
              </p>
              <a
                href={getLocalePath(language)}
                className="mt-3 inline-flex text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                esgcheck.ch
              </a>
            </footer>
          </div>
        </m.section>
      </main>
    </div>
  );
}

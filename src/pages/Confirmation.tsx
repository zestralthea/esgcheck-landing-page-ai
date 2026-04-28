import {
  ArrowRight,
  BarChart3,
  Check,
  Home,
  Leaf,
  MailCheck,
  Send,
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

export default function Confirmation() {
  const { t, language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const canonicalUrl = getLocaleUrl(language, "confirmation");
  const alternateLinks = [
    ...supportedLanguages.map((lang) => ({
      hrefLang: languageMetadata[lang].hrefLang,
      href: getLocaleUrl(lang, "confirmation"),
    })),
    {
      hrefLang: "x-default",
      href: getLocaleUrl(defaultLanguage, "confirmation"),
    },
  ];
  const benefits: Array<{ icon: LucideIcon; title: string; description: string }> = [
    {
      icon: Leaf,
      title: t("confirmation.steps.review.title"),
      description: t("confirmation.steps.review.description"),
    },
    {
      icon: ShieldCheck,
      title: t("confirmation.steps.update.title"),
      description: t("confirmation.steps.update.description"),
    },
    {
      icon: BarChart3,
      title: t("confirmation.steps.prepare.title"),
      description: t("confirmation.steps.prepare.description"),
    },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--secondary))_100%)]">
      <SEOHead
        title={t("confirmation.seo.title")}
        description={t("confirmation.seo.description")}
        keywords={t("seo.keywords")}
        canonicalUrl={canonicalUrl}
        ogImageAlt={t("seo.ogImageAlt")}
        alternateLinks={alternateLinks}
        noindex
      />

      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-8 md:py-12">
        <m.section
          className="w-full max-w-3xl overflow-hidden rounded-2xl border border-border/80 bg-card text-center shadow-elegant"
          initial="hidden"
          animate="visible"
          variants={revealUp}
          custom={shouldReduceMotion}
        >
          <FlowPageHeader />

          <div className="px-6 py-10 sm:px-10 md:px-14 md:py-12">
            <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MailCheck className="h-14 w-14" strokeWidth={1.8} />
              <span className="absolute bottom-6 right-5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-card">
                <Check className="h-4 w-4" strokeWidth={2.8} />
              </span>
              <span className="absolute -left-10 top-8 hidden text-xl font-semibold text-primary/40 sm:block">
                +
              </span>
              <span className="absolute -right-9 top-1 hidden text-xl font-semibold text-primary/40 sm:block">
                +
              </span>
              <span className="absolute -left-16 top-16 hidden h-1.5 w-1.5 rounded-full bg-primary/35 sm:block" />
              <span className="absolute -right-16 bottom-9 hidden h-1.5 w-1.5 rounded-full bg-primary/45 sm:block" />
            </div>

            <h1 className="mt-8 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              <span className="block">{t("confirmation.status")}</span>
              <span className="mt-2 block text-primary">{t("confirmation.title")}</span>
            </h1>
            <p className="mx-auto mt-7 max-w-xl text-base leading-8 text-foreground/78">
              {t("confirmation.description")}
            </p>

            <div className="my-8 h-px w-full bg-border/80" />

            <div className="mx-auto grid max-w-xl gap-5 text-left sm:grid-cols-[5.5rem_1fr] sm:items-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary sm:mx-0">
                <Send className="h-8 w-8" strokeWidth={1.8} />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {t("confirmation.nextTitle")}
                </h2>
                <p className="mt-2 text-base leading-7 text-foreground/76">
                  {t("confirmation.nextDescription")}
                </p>
              </div>
            </div>

            <div className="mx-auto mt-7 max-w-xl rounded-lg border border-border/80 bg-secondary/55 p-5 text-left">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-primary text-[1.35rem] font-semibold leading-none text-primary">
                  ?
                </div>
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-foreground">
                    {t("confirmation.helpTitle")}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-foreground/76">
                    {t("confirmation.helpDescription")}
                  </p>
                </div>
              </div>
            </div>

            <div className="my-8 h-px w-full bg-border/80" />

            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {t("confirmation.trustTitle")}
            </h2>
            <div className="mt-6 grid gap-0 overflow-hidden rounded-lg border border-border/70 md:grid-cols-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className="border-b border-border/70 px-5 py-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-7 w-7" strokeWidth={1.9} />
                    </div>
                    <h3 className="mt-5 text-sm font-semibold text-foreground">
                      {benefit.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-foreground/68">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mx-auto mt-8 flex max-w-sm flex-col items-stretch gap-4">
              <m.div
                whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.2 } }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98, transition: microSpring }}
              >
                <Button asChild variant="hero" size="lg" className="w-full rounded-lg px-7">
                  <a href={`${getLocalePath(language)}#product`}>
                    {t("confirmation.primaryCta")}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </m.div>
              <a
                href={getLocalePath(language)}
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                <Home className="h-4 w-4" />
                {t("confirmation.secondaryCta")}
              </a>
            </div>
          </div>
        </m.section>
      </main>
    </div>
  );
}

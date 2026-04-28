import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Home,
  Mail,
  MailCheck,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { m, useReducedMotion } from "framer-motion";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
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

const contactHref = "mailto:info@esgcheck.ch?subject=ESGCheck%20early%20access";

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
  const steps: Array<{ icon: LucideIcon; title: string; description: string }> = [
    {
      icon: ClipboardCheck,
      title: t("confirmation.steps.review.title"),
      description: t("confirmation.steps.review.description"),
    },
    {
      icon: MailCheck,
      title: t("confirmation.steps.update.title"),
      description: t("confirmation.steps.update.description"),
    },
    {
      icon: FileText,
      title: t("confirmation.steps.prepare.title"),
      description: t("confirmation.steps.prepare.description"),
    },
  ];
  const trustItems = [
    t("confirmation.trust.swissBuilt"),
    t("confirmation.trust.privacy"),
    t("confirmation.trust.growingSmes"),
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("confirmation.seo.title")}
        description={t("confirmation.seo.description")}
        keywords={t("seo.keywords")}
        canonicalUrl={canonicalUrl}
        ogImageAlt={t("seo.ogImageAlt")}
        alternateLinks={alternateLinks}
        noindex
      />

      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-border/70 bg-[linear-gradient(180deg,hsl(var(--secondary))_0%,hsl(var(--background))_100%)]">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <m.div
              className="mx-auto flex max-w-4xl flex-col items-center text-center"
              initial="hidden"
              animate="visible"
              variants={revealUp}
              custom={shouldReduceMotion}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-2 text-sm font-semibold text-primary shadow-sm">
                <CheckCircle2 className="h-4 w-4" />
                {t("confirmation.status")}
              </div>

              <h1 className="mt-7 max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                {t("confirmation.title")}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-foreground/72">
                {t("confirmation.description")}
              </p>

              <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
                <m.div
                  whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.2 } }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.98, transition: microSpring }}
                >
                  <Button asChild variant="hero" size="lg" className="w-full rounded-xl px-7 sm:w-auto">
                    <a href={getLocalePath(language)}>
                      <Home className="h-4 w-4" />
                      {t("confirmation.primaryCta")}
                    </a>
                  </Button>
                </m.div>
                <m.div
                  whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.2 } }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.98, transition: microSpring }}
                >
                  <Button asChild variant="outline" size="lg" className="w-full rounded-xl px-7 sm:w-auto">
                    <a href={contactHref}>
                      <Mail className="h-4 w-4" />
                      {t("confirmation.secondaryCta")}
                    </a>
                  </Button>
                </m.div>
              </div>
            </m.div>
          </div>
        </section>

        <section className="bg-background py-16 md:py-20">
          <div className="container mx-auto px-4">
            <m.div
              className="mx-auto max-w-5xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.18 }}
              variants={revealUp}
              custom={shouldReduceMotion}
            >
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  {t("confirmation.nextTitle")}
                </h2>
                <p className="mt-4 text-base leading-8 text-foreground/70">
                  {t("confirmation.nextDescription")}
                </p>
              </div>

              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {steps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.title}
                      className="relative rounded-[28px] border border-border/80 bg-card p-6 shadow-card"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-primary/80">
                        0{index + 1}
                      </div>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-foreground/68">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </m.div>
          </div>
        </section>

        <section className="border-t border-border/70 bg-secondary/60 py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto flex max-w-5xl flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {t("confirmation.trustTitle")}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground/68">
                  {t("confirmation.trustDescription")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {trustItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/76 shadow-sm"
                  >
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-5 rounded-[28px] border border-border/80 bg-card p-6 shadow-card md:flex-row md:items-center md:p-8">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {t("confirmation.finalTitle")}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground/68">
                  {t("confirmation.finalDescription")}
                </p>
              </div>
              <Button asChild variant="hero" size="lg" className="w-full rounded-xl px-7 md:w-auto">
                <a href={`${getLocalePath(language)}#waitlist`}>
                  {t("confirmation.finalCta")}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

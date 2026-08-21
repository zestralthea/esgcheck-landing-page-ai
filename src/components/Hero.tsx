import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleSlash2,
  FileSearch,
  FileText,
  Map,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { m, useReducedMotion } from "framer-motion";
import {
  cardHover,
  entranceEase,
  microSpring,
  revealRight,
  revealUp,
  staggerContainer,
} from "@/lib/motion";

const nonBreakingHyphen = "\u2011";
const protectedHyphenatedTerms = [
  "ESG-Ersteinschätzung",
  "ESG-Einschätzung",
  "B2B-KMU",
] as const;

const protectedTermPattern = new RegExp(
  `(${protectedHyphenatedTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
  "g"
);

const protectKeyTermBreaks = (value: string) =>
  protectedHyphenatedTerms.reduce(
    (text, term) => text.replaceAll(term, term.replaceAll("-", nonBreakingHyphen)),
    value
  );

const renderProtectedKeyTerms = (value: string, className: string) =>
  value.split(protectedTermPattern).map((part, index) =>
    protectedHyphenatedTerms.includes(part as (typeof protectedHyphenatedTerms)[number]) ? (
      <span key={`${part}-${index}`} className={className}>
        {part.replaceAll("-", nonBreakingHyphen)}
      </span>
    ) : (
      part
    )
  );

export default function Hero() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const heroTitle = t("hero.title");
  const heroDescription = protectKeyTermBreaks(t("hero.description"));
  const nextSteps = ["scope", "suppliers", "governance"] as const;
  const evidenceStatuses = [
    {
      id: "supported",
      label: t("hero.dashboard.strengthsTitle"),
      detail: t("hero.dashboard.strengths.policy"),
      count: "8",
      icon: CheckCircle2,
      iconClassName: "text-success",
      badgeClassName: "bg-success/10 text-success",
    },
    {
      id: "partial",
      label: t("hero.dashboard.gapsTitle"),
      detail: t("hero.dashboard.gaps.tracking"),
      count: "3",
      icon: AlertTriangle,
      iconClassName: "text-amber-500",
      badgeClassName: "bg-amber-500/10 text-amber-700",
    },
    {
      id: "missing",
      label: t("hero.dashboard.missingTitle"),
      detail: t("hero.dashboard.missing.inventory"),
      count: "2",
      icon: FileSearch,
      iconClassName: "text-muted-foreground",
      badgeClassName: "bg-secondary text-foreground/70",
    },
    {
      id: "not-applicable",
      label: t("hero.dashboard.notApplicableTitle"),
      detail: t("hero.dashboard.notApplicableDetail"),
      count: "1",
      icon: CircleSlash2,
      iconClassName: "text-primary",
      badgeClassName: "bg-primary/10 text-primary",
    },
  ] as const;
  const proofItems = [
    { label: t("hero.proof.documentFirst"), icon: FileText },
    { label: t("hero.proof.griFirst"), icon: BookOpen },
    { label: t("hero.proof.vsmeNext"), icon: Map },
    { label: t("hero.proof.swissPrivacy"), icon: ShieldCheck },
  ] as const;

  return (
    <section id="product" className="relative isolate overflow-hidden border-b border-border/70">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 z-0 h-full w-full object-cover opacity-20"
      >
        <source src="/ESGCheck_hero_compressed.webm" type="video/webm" />
        <source src="/ESGCheck_hero_compressed.mp4" type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(120deg,hsl(var(--background))/0.97_0%,hsl(var(--background))/0.94_45%,hsl(var(--background))/0.90_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 hidden bg-[radial-gradient(circle_at_84%_8%,hsl(var(--accent))/0.58_0%,hsl(var(--accent))/0.26_30%,transparent_62%)] lg:block" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-28 bg-[linear-gradient(180deg,transparent_0%,hsl(var(--background))_100%)]" />

      <div className="container relative z-10 mx-auto px-4 py-14 sm:py-20 lg:py-20">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] items-center gap-10 xl:grid-cols-[minmax(0,1fr)_540px]">
          <m.div
            className="min-w-0 max-w-2xl space-y-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            custom={shouldReduceMotion}
          >
            <div className="space-y-5">
              <m.h1
                className="max-w-[16ch] text-balance text-3xl font-semibold leading-[1.08] text-foreground min-[430px]:text-4xl sm:text-5xl lg:text-6xl"
                variants={revealUp}
                custom={shouldReduceMotion}
              >
                {renderProtectedKeyTerms(heroTitle, "whitespace-nowrap text-[0.92em] sm:text-[1em]")}
              </m.h1>
              <m.p
                className="min-w-0 max-w-[34rem] text-lg leading-[1.7] text-foreground/72 sm:text-xl"
                variants={revealUp}
                custom={shouldReduceMotion}
              >
                {heroDescription}
              </m.p>
            </div>

            <m.div
              className="flex flex-col gap-3 sm:flex-row"
              variants={revealUp}
              custom={shouldReduceMotion}
            >
              <m.div
                whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.2 } }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98, transition: microSpring }}
              >
                <Button asChild variant="hero" size="lg" className="rounded-xl px-7 transition-[box-shadow,opacity] hover:shadow-glow">
                  <a href="#waitlist">
                    {t("hero.primaryCta")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </m.div>
              <m.div
                whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.2 } }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98, transition: microSpring }}
              >
                <Button asChild variant="outline" size="lg" className="rounded-xl px-7 transition-shadow hover:shadow-card">
                  <a href="#how-it-works">{t("hero.secondaryCta")}</a>
                </Button>
              </m.div>
            </m.div>

            <m.div
              className="flex flex-wrap gap-3 pt-2"
              variants={staggerContainer}
              custom={shouldReduceMotion}
            >
              {proofItems.map(({ label, icon: Icon }) => (
                <m.div
                  key={label}
                  className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-background/85 px-4 py-2 text-sm font-medium text-foreground/85 shadow-sm"
                  variants={revealUp}
                  custom={shouldReduceMotion}
                  whileHover={shouldReduceMotion ? undefined : cardHover.whileHover}
                  whileTap={shouldReduceMotion ? undefined : cardHover.whileTap}
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span className="min-w-0">{label}</span>
                </m.div>
              ))}
            </m.div>
          </m.div>

          <m.div
            className="w-full min-w-0 max-w-[540px] justify-self-center rounded-[28px] border border-border/80 bg-card/95 p-5 shadow-elegant backdrop-blur-sm xl:justify-self-end"
            initial="hidden"
            animate="visible"
            variants={revealRight}
            custom={shouldReduceMotion}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{t("hero.dashboard.title")}</p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {t("hero.dashboard.previewLabel")}
                </p>
              </div>
              <div className="shrink-0 self-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium leading-none text-foreground/70">
                {t("hero.dashboard.filter")}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <m.div
                className="rounded-2xl border border-border/80 bg-background p-5"
                initial="hidden"
                animate="visible"
                variants={revealUp}
                custom={shouldReduceMotion}
                transition={shouldReduceMotion ? undefined : { delay: 0.18, duration: 0.5, ease: entranceEase }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground/65">{t("hero.dashboard.scoreTitle")}</p>
                    <div className="mt-3 flex items-end gap-1">
                      <span className="text-4xl font-semibold tracking-tight text-foreground tabular-nums">
                        {t("hero.dashboard.scoreValue")}
                      </span>
                      <span className="pb-1 text-base font-medium text-muted-foreground tabular-nums">
                        {t("hero.dashboard.scoreTotal")}
                      </span>
                    </div>
                  </div>
                  <FileSearch className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                  <m.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: shouldReduceMotion ? "68%" : 0 }}
                    animate={{ width: "68%" }}
                    transition={{ duration: shouldReduceMotion ? 0.01 : 0.9, ease: entranceEase, delay: 0.3 }}
                  />
                </div>
                <p className="mt-3 text-xs leading-5 text-foreground/65">{t("hero.dashboard.scoreLabel")}</p>
              </m.div>

              <m.div
                className="rounded-2xl border border-border/80 bg-background p-5"
                initial="hidden"
                animate="visible"
                variants={revealUp}
                custom={shouldReduceMotion}
                transition={shouldReduceMotion ? undefined : { delay: 0.26, duration: 0.5, ease: entranceEase }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground/65">{t("hero.dashboard.maturityTitle")}</p>
                    <p className="mt-3 text-xl font-semibold tracking-tight text-foreground">
                      {t("hero.dashboard.maturityValue")}
                    </p>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-3 text-xs leading-5 text-foreground/65">{t("hero.dashboard.maturityDetail")}</p>
              </m.div>

              <m.div
                className="rounded-2xl border border-border/80 bg-background p-5 md:col-span-2"
                initial="hidden"
                animate="visible"
                variants={revealUp}
                custom={shouldReduceMotion}
                transition={shouldReduceMotion ? undefined : { delay: 0.34, duration: 0.5, ease: entranceEase }}
              >
                <p className="text-sm font-semibold text-foreground/65">{t("hero.dashboard.statusTitle")}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {evidenceStatuses.map((status) => (
                    <div key={status.id} className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3">
                      <status.icon className={`mt-0.5 h-4 w-4 shrink-0 ${status.iconClassName}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-foreground">{status.label}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ${status.badgeClassName}`}>
                            {status.count}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-4 text-foreground/60">{status.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </m.div>

              <m.div
                className="rounded-2xl border border-border/80 bg-background p-5 md:col-span-2"
                initial="hidden"
                animate="visible"
                variants={revealUp}
                custom={shouldReduceMotion}
                transition={shouldReduceMotion ? undefined : { delay: 0.42, duration: 0.5, ease: entranceEase }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground/65">{t("hero.dashboard.nextStepsTitle")}</p>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                    <UserCheck className="h-3.5 w-3.5" />
                    {t("hero.dashboard.approvalStatus")}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {nextSteps.map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-foreground/75">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                      <span>{t(`hero.dashboard.nextSteps.${item}`)}</span>
                    </div>
                  ))}
                </div>
              </m.div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}

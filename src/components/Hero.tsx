import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileSearch,
  FileText,
  Map,
  ShieldCheck,
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

const scoreBreakdown = [
  { key: "environment", value: 64 },
  { key: "social", value: 70 },
  { key: "governance", value: 69 },
];

const ringDegrees = (Number("68") / 100) * 360;
const ringProgress = Number("68") / 100;
const ringRadius = 42;
const ringCircumference = 2 * Math.PI * ringRadius;
const ringOffset = ringCircumference * (1 - ringProgress);

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
  const strengths = ["policy", "opportunity", "conduct"] as const;
  const gaps = ["tracking", "suppliers", "oversight"] as const;
  const nextSteps = ["scope", "suppliers", "governance"] as const;
  const missing = ["inventory", "supplier", "board"] as const;
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

            <div className="mt-5 grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
              <m.div
                className="rounded-2xl border border-border/80 bg-background p-5"
                initial="hidden"
                animate="visible"
                variants={revealUp}
                custom={shouldReduceMotion}
                transition={shouldReduceMotion ? undefined : { delay: 0.18, duration: 0.5, ease: entranceEase }}
              >
                <p className="text-sm font-semibold text-foreground/65">{t("hero.dashboard.scoreTitle")}</p>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-end gap-1">
                      <span className="text-5xl font-semibold tracking-tight text-foreground tabular-nums">
                        {t("hero.dashboard.scoreValue")}
                      </span>
                      <span className="pb-1 text-xl font-medium text-muted-foreground tabular-nums">
                        {t("hero.dashboard.scoreTotal")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-success">{t("hero.dashboard.scoreLabel")}</p>
                  </div>
                  <div className="relative size-24 shrink-0">
                    <svg viewBox="0 0 96 96" className="-rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r={ringRadius}
                        fill="none"
                        stroke="hsl(var(--secondary))"
                        strokeWidth="12"
                      />
                      <m.circle
                        cx="48"
                        cy="48"
                        r={ringRadius}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={ringCircumference}
                        initial={{
                          strokeDashoffset: shouldReduceMotion ? ringOffset : ringCircumference,
                        }}
                        animate={{ strokeDashoffset: ringOffset }}
                        transition={{
                          duration: shouldReduceMotion ? 0.01 : 0.95,
                          ease: entranceEase,
                          delay: shouldReduceMotion ? 0 : 0.32,
                        }}
                      />
                    </svg>
                    <div className="absolute inset-[10px] rounded-full bg-card" />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {scoreBreakdown.map((item) => (
                    <div key={item.key} className="space-y-2">
                      <div>
                        <span className="block text-[10px] font-medium uppercase leading-4 tracking-[0.12em] text-muted-foreground sm:text-[11px]">
                          {t(`hero.dashboard.pillars.${item.key}`)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                      <span className="block text-xs font-semibold text-foreground tabular-nums">
                        {item.value}/100
                      </span>
                    </div>
                  ))}
                </div>
              </m.div>

              <m.div
                className="rounded-2xl border border-border/80 bg-background p-5"
                initial="hidden"
                animate="visible"
                variants={revealUp}
                custom={shouldReduceMotion}
                transition={shouldReduceMotion ? undefined : { delay: 0.26, duration: 0.5, ease: entranceEase }}
              >
                <p className="text-sm font-semibold text-foreground/65">{t("hero.dashboard.strengthsTitle")}</p>
                <div className="mt-4 space-y-3">
                  {strengths.map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-foreground/75">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                      <span>{t(`hero.dashboard.strengths.${item}`)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-border/70 pt-5">
                  <p className="text-sm font-semibold text-foreground/65">{t("hero.dashboard.gapsTitle")}</p>
                  <div className="mt-4 space-y-3">
                    {gaps.map((item) => (
                      <div key={item} className="flex items-center gap-2.5 text-sm text-foreground/75">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                        <span>{t(`hero.dashboard.gaps.${item}`)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </m.div>

              <m.div
                className="rounded-2xl border border-border/80 bg-background p-5"
                initial="hidden"
                animate="visible"
                variants={revealUp}
                custom={shouldReduceMotion}
                transition={shouldReduceMotion ? undefined : { delay: 0.34, duration: 0.5, ease: entranceEase }}
              >
                <p className="text-sm font-semibold text-foreground/65">{t("hero.dashboard.nextStepsTitle")}</p>
                <div className="mt-4 space-y-3">
                  {nextSteps.map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-foreground/75">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                      <span>{t(`hero.dashboard.nextSteps.${item}`)}</span>
                    </div>
                  ))}
                </div>
              </m.div>

              <m.div
                className="rounded-2xl border border-border/80 bg-background p-5"
                initial="hidden"
                animate="visible"
                variants={revealUp}
                custom={shouldReduceMotion}
                transition={shouldReduceMotion ? undefined : { delay: 0.42, duration: 0.5, ease: entranceEase }}
              >
                <p className="text-sm font-semibold text-foreground/65">{t("hero.dashboard.missingTitle")}</p>
                <div className="mt-4 space-y-3">
                  {missing.map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-foreground/75">
                      <FileSearch className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{t(`hero.dashboard.missing.${item}`)}</span>
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

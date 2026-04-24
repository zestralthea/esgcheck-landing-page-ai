import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, AlertTriangle, FileSearch } from "lucide-react";

const scoreBreakdown = [
  { key: "environment", value: 64 },
  { key: "social", value: 70 },
  { key: "governance", value: 69 },
];

const ringDegrees = (Number("68") / 100) * 360;

export default function Hero() {
  const { t } = useLanguage();

  const strengths = ["policy", "opportunity", "conduct"] as const;
  const gaps = ["tracking", "suppliers", "oversight"] as const;
  const nextSteps = ["scope", "suppliers", "governance"] as const;
  const missing = ["inventory", "supplier", "board"] as const;

  return (
    <section id="product" className="relative overflow-hidden border-b border-border/70">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover opacity-20"
      >
        <source src="/ESGCheck_hero_compressed.webm" type="video/webm" />
        <source src="/ESGCheck_hero_compressed.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[linear-gradient(120deg,hsl(var(--background))/0.97_0%,hsl(var(--background))/0.94_45%,hsl(var(--background))/0.90_100%)]" />
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,hsl(var(--accent))/0.65_0%,transparent_60%)] lg:block" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent_0%,hsl(var(--background))_100%)]" />

      <div className="container relative mx-auto px-4 py-14 sm:py-20 lg:py-24">
        <div className="grid items-center gap-10 xl:grid-cols-[minmax(0,1fr)_540px]">
          <div className="max-w-2xl space-y-8">
            <div className="space-y-5">
              <h1 className="max-w-[12ch] text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {t("hero.title")}
              </h1>
              <p className="max-w-[34rem] text-lg leading-8 text-foreground/72 sm:text-xl">
                {t("hero.description")}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="hero" size="lg" className="rounded-xl px-7">
                <a href="#waitlist">
                  {t("hero.primaryCta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl px-7">
                <a href="#how-it-works">{t("hero.secondaryCta")}</a>
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/85 px-4 py-2 text-sm font-medium text-foreground/75 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-success" />
                {t("hero.proof.documentFirst")}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/85 px-4 py-2 text-sm font-medium text-foreground/75 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-success" />
                {t("hero.proof.griFirst")}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/85 px-4 py-2 text-sm font-medium text-foreground/75 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-success" />
                {t("hero.proof.swissPrivacy")}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-border/80 bg-card/95 p-5 shadow-elegant backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{t("hero.dashboard.title")}</p>
              </div>
              <div className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground/70">
                {t("hero.dashboard.filter")}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-2xl border border-border/80 bg-background p-5">
                <p className="text-sm font-semibold text-foreground/65">{t("hero.dashboard.scoreTitle")}</p>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-end gap-1">
                      <span className="text-5xl font-semibold tracking-tight text-foreground">
                        {t("hero.dashboard.scoreValue")}
                      </span>
                      <span className="pb-1 text-xl font-medium text-muted-foreground">
                        {t("hero.dashboard.scoreTotal")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-success">{t("hero.dashboard.scoreLabel")}</p>
                  </div>
                  <div
                    className="relative size-24 shrink-0 rounded-full"
                    style={{
                      background: `conic-gradient(hsl(var(--primary)) 0deg ${ringDegrees}deg, hsl(var(--secondary)) ${ringDegrees}deg 360deg)`,
                    }}
                  >
                    <div className="absolute inset-[10px] rounded-full bg-card" />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {scoreBreakdown.map((item) => (
                    <div key={item.key} className="space-y-2">
                      <div>
                        <span className="block text-[10px] font-medium uppercase leading-4 tracking-[0.08em] text-muted-foreground sm:text-[11px]">
                          {t(`hero.dashboard.pillars.${item.key}`)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                      <span className="block text-xs font-semibold text-foreground">
                        {item.value}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/80 bg-background p-5">
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
              </div>

              <div className="rounded-2xl border border-border/80 bg-background p-5">
                <p className="text-sm font-semibold text-foreground/65">{t("hero.dashboard.nextStepsTitle")}</p>
                <div className="mt-4 space-y-3">
                  {nextSteps.map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-foreground/75">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                      <span>{t(`hero.dashboard.nextSteps.${item}`)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/80 bg-background p-5">
                <p className="text-sm font-semibold text-foreground/65">{t("hero.dashboard.missingTitle")}</p>
                <div className="mt-4 space-y-3">
                  {missing.map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-foreground/75">
                      <FileSearch className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{t(`hero.dashboard.missing.${item}`)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

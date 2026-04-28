import {
  BadgeCheck,
  BarChart3,
  ClipboardList,
  CheckCircle2,
  Clock3,
  Map,
  ScanSearch,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { m, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { SectionHeading } from "@/components/common/SectionHeading";
import {
  cardHover,
  entranceEase,
  revealRight,
  revealUp,
  timelineLineX,
  timelineLineY,
  viewportOnce,
} from "@/lib/motion";

const pillars = [
  { id: "outputs" },
  { id: "methodology" },
  { id: "positioning" },
] as const;

const statusItems = [
  { id: "mvp", icon: CheckCircle2 },
  { id: "testing", icon: Clock3 },
  { id: "expert", icon: ScanSearch },
  { id: "readiness", icon: Map },
] as const;

const roadmapSteps = [
  { id: "testing", icon: ClipboardList },
  { id: "validation", icon: BadgeCheck },
  { id: "pilot", icon: Users },
  { id: "commercial", icon: BarChart3 },
  { id: "expansion", icon: TrendingUp },
  { id: "certification", icon: ShieldCheck },
] as const;

function MountainMark() {
  return (
    <svg viewBox="0 0 200 90" className="h-20 w-full text-primary/22">
      <path
        d="M5 85 L45 35 L70 60 L98 20 L130 55 L150 40 L188 85"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M45 35 L55 48 L70 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M98 20 L108 33 L122 44"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CredibilitySection() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="roadmap" className="overflow-x-hidden border-b border-border/70 bg-background py-20">
      <div className="container mx-auto space-y-14 px-4">
        <div className="grid gap-5 lg:grid-cols-3">
          <m.div
            className="relative overflow-hidden rounded-[28px] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--secondary))_100%)] p-7 shadow-card transition-shadow duration-200 hover:shadow-elegant"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={revealUp}
            custom={shouldReduceMotion}
            whileHover={shouldReduceMotion ? undefined : cardHover.whileHover}
            whileTap={shouldReduceMotion ? undefined : cardHover.whileTap}
          >
            <div className="max-w-sm space-y-4">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                {t("credibility.title")}
              </h2>
              <p className="text-base leading-[1.7] text-foreground/72">
                {t("credibility.intro")}
              </p>
            </div>
            <div className="absolute bottom-5 left-6 right-6">
              <MountainMark />
            </div>
          </m.div>

          <m.div
            className="rounded-[28px] border border-border/80 bg-card p-7 shadow-card transition-shadow duration-200 hover:shadow-elegant"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={revealUp}
            custom={shouldReduceMotion}
            transition={shouldReduceMotion ? undefined : { delay: 0.08, duration: 0.54, ease: entranceEase }}
            whileHover={shouldReduceMotion ? undefined : cardHover.whileHover}
            whileTap={shouldReduceMotion ? undefined : cardHover.whileTap}
          >
            <div className="space-y-5">
              {pillars.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {t(`credibility.pillars.${item.id}.title`)}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-foreground/68">
                      {t(`credibility.pillars.${item.id}.description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </m.div>

          <m.div
            className="relative overflow-hidden rounded-[28px] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--accent))_100%)] p-7 shadow-card transition-shadow duration-200 hover:shadow-elegant"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={revealUp}
            custom={shouldReduceMotion}
            transition={shouldReduceMotion ? undefined : { delay: 0.16, duration: 0.54, ease: entranceEase }}
            whileHover={shouldReduceMotion ? undefined : cardHover.whileHover}
            whileTap={shouldReduceMotion ? undefined : cardHover.whileTap}
          >
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
              {t("credibility.privacyTitle")}
            </h3>
            <p className="mt-3 text-sm leading-[1.7] text-foreground/72">
              {t("credibility.privacyDescription")}
            </p>
            <div className="mt-6 flex gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/15">
                {t("credibility.regionBadges.swiss")}
              </div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/15">
                {t("credibility.regionBadges.europe")}
              </div>
            </div>
          </m.div>
        </div>

        <div>
          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={revealUp}
            custom={shouldReduceMotion}
          >
            <SectionHeading
              title={t("status.title")}
              description={t("roadmap.description")}
              centered={false}
              className="mb-8"
              descriptionClassName="max-w-3xl text-base md:text-lg"
            />
          </m.div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statusItems.map((item, index) => (
              <m.div
                key={item.id}
                className="rounded-2xl border border-border/80 bg-card px-5 py-5 shadow-card transition-shadow duration-200 hover:shadow-elegant"
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={revealUp}
                custom={shouldReduceMotion}
                transition={shouldReduceMotion ? undefined : { delay: index * 0.08, duration: 0.5, ease: entranceEase }}
                whileHover={shouldReduceMotion ? undefined : cardHover.whileHover}
                whileTap={shouldReduceMotion ? undefined : cardHover.whileTap}
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {t(`status.items.${item.id}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-foreground/70">
                  {t(`status.items.${item.id}.description`)}
                </p>
              </m.div>
            ))}
          </div>

          <div className="mt-6">
            <div className="relative hidden gap-6 lg:grid lg:grid-cols-6">
              <m.div
                className="absolute left-[8.33%] right-[8.33%] top-6 h-px bg-border"
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={timelineLineX}
                custom={shouldReduceMotion}
              />
              {roadmapSteps.map((step, index) => (
                <m.div
                  key={step.id}
                  className="relative text-center"
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                  variants={revealUp}
                  custom={shouldReduceMotion}
                  transition={shouldReduceMotion ? undefined : { delay: 0.2 + index * 0.08, duration: 0.5, ease: entranceEase }}
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-card tabular-nums">
                    {index + 1}
                  </div>
                  <div className="mx-auto mt-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-primary shadow-sm">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <p className="mx-auto mt-4 max-w-[11rem] text-sm font-semibold leading-6 text-foreground">
                    {t(`roadmap.steps.${step.id}`)}
                  </p>
                </m.div>
              ))}
            </div>

            <div className="relative space-y-6 lg:hidden">
              <m.div
                className="absolute bottom-0 left-[1.75rem] top-0 w-px -translate-x-1/2 bg-border"
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={timelineLineY}
                custom={shouldReduceMotion}
              />
              {roadmapSteps.map((step, index) => (
                <m.div
                  key={step.id}
                  className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-4"
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                  variants={revealRight}
                  custom={shouldReduceMotion}
                  transition={shouldReduceMotion ? undefined : { delay: 0.2 + index * 0.08, duration: 0.54, ease: entranceEase }}
                >
                  <div className="relative z-10 flex h-full min-h-[8.5rem] justify-center self-stretch">
                    <div className="relative top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-card tabular-nums">
                      {index + 1}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/80 bg-card px-5 py-5 shadow-card">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-primary">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <p className="text-base font-semibold text-foreground">
                      {t(`roadmap.steps.${step.id}`)}
                    </p>
                  </div>
                </m.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

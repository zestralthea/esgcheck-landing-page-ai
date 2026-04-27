import {
  BarChart3,
  Building2,
  ClipboardList,
  Landmark,
  Target,
  TrendingUp,
  Truck,
  Upload,
  Users,
} from "lucide-react";
import { m, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/common/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  cardHover,
  entranceEase,
  revealRight,
  revealUp,
  timelineLineY,
  viewportOnce,
} from "@/lib/motion";

const pressureCards = [
  { id: "customerRequests", icon: Users },
  { id: "procurement", icon: ClipboardList },
  { id: "supplyChain", icon: Truck },
  { id: "investors", icon: Landmark },
  { id: "credibility", icon: TrendingUp },
] as const;

const steps = [
  { id: "upload", icon: Upload, number: "01" },
  { id: "assess", icon: ClipboardList, number: "02" },
  { id: "receive", icon: BarChart3, number: "03" },
  { id: "act", icon: Target, number: "04" },
] as const;

export default function Features() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="how-it-works" className="overflow-x-hidden border-b border-border/70 bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="grid gap-14 xl:grid-cols-[1.15fr_0.85fr] xl:gap-16">
          <div>
            <m.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={revealUp}
              custom={shouldReduceMotion}
            >
              <SectionHeading
                title={t("needNow.title")}
                description={t("needNow.description")}
                centered={false}
                className="mb-10"
                descriptionClassName="max-w-none text-base md:text-lg"
              />
            </m.div>

            <div className="grid justify-items-center gap-4 grid-cols-2 xl:grid-cols-6">
              {pressureCards.map((item, index) => (
                <m.div
                  key={item.id}
                  className={`mx-auto flex w-full max-w-[22rem] min-h-[10.5rem] flex-col justify-center rounded-2xl border border-border/80 bg-card px-4 py-5 text-center shadow-card xl:col-span-2 ${
                    index === pressureCards.length - 1
                      ? "col-span-2 w-[calc(50%-0.5rem)] xl:w-full"
                      : ""
                  } ${
                    index === pressureCards.length - 2
                      ? "xl:col-start-2"
                      : ""
                  } ${
                    index === pressureCards.length - 1
                      ? "xl:col-start-4"
                      : ""
                  } transition-shadow duration-200 hover:shadow-elegant`}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                  variants={revealUp}
                  custom={shouldReduceMotion}
                  transition={shouldReduceMotion ? undefined : { delay: index * 0.08, duration: 0.5, ease: entranceEase }}
                  whileHover={shouldReduceMotion ? undefined : cardHover.whileHover}
                  whileTap={shouldReduceMotion ? undefined : cardHover.whileTap}
                >
                  <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="hyphenate text-sm font-semibold leading-6 text-foreground">
                    {t(`needNow.items.${item.id}`)}
                  </p>
                </m.div>
              ))}
            </div>

            <m.div
              className="mt-6 flex items-center gap-4 rounded-2xl border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--secondary))_100%)] px-5 py-5 shadow-card"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={revealUp}
              custom={shouldReduceMotion}
              transition={shouldReduceMotion ? undefined : { delay: 0.18, duration: 0.54, ease: entranceEase }}
            >
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <p className="text-base leading-7 text-foreground/75">
                {t("needNow.conclusion")}
              </p>
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
                title={t("howItWorks.title")}
                centered={false}
                className="mb-10"
              />
            </m.div>

            <div className="relative space-y-6">
              <m.div
                className="absolute bottom-0 left-[1.75rem] top-0 w-px -translate-x-1/2 bg-border"
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={timelineLineY}
                custom={shouldReduceMotion}
              />
              {steps.map((step, index) => (
                <m.div
                  key={step.id}
                  className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-4"
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                  variants={revealRight}
                  custom={shouldReduceMotion}
                  transition={shouldReduceMotion ? undefined : { delay: 0.18 + index * 0.1, duration: 0.56, ease: entranceEase }}
                >
                  <div className="relative z-10 flex h-full min-h-[12rem] justify-center self-stretch">
                    <div className="relative top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {step.number}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/80 bg-card px-5 py-5 shadow-card">
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {t(`howItWorks.steps.${step.id}.title`)}
                    </h3>
                    <p className="mt-2 text-base leading-7 text-foreground/70">
                      {t(`howItWorks.steps.${step.id}.description`)}
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

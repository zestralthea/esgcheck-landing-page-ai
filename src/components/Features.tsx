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
import { SectionHeading } from "@/components/common/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";

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

  return (
    <section id="how-it-works" className="border-b border-border/70 bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="grid gap-14 xl:grid-cols-[1.15fr_0.85fr] xl:gap-16">
          <div>
            <SectionHeading
              title={t("needNow.title")}
              description={t("needNow.description")}
              centered={false}
              className="mb-10"
              descriptionClassName="max-w-none text-base md:text-lg"
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {pressureCards.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border/80 bg-card px-4 py-5 text-left shadow-card"
                >
                  <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="hyphenate text-sm font-semibold leading-6 text-foreground">
                    {t(`needNow.items.${item.id}`)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-4 rounded-2xl border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--secondary))_100%)] px-5 py-5 shadow-card">
              <div className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <p className="text-base leading-7 text-foreground/75">
                {t("needNow.conclusion")}
              </p>
            </div>
          </div>

          <div>
            <SectionHeading
              title={t("howItWorks.title")}
              centered={false}
              className="mb-10"
            />

            <div className="relative space-y-6">
              <div className="absolute bottom-0 left-[1.75rem] top-0 w-px -translate-x-1/2 bg-border" />
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-4"
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import {
  BadgeCheck,
  BarChart3,
  ClipboardList,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";

const roadmapSteps = [
  { id: "testing", icon: ClipboardList },
  { id: "validation", icon: BadgeCheck },
  { id: "pilot", icon: Users },
  { id: "commercial", icon: BarChart3 },
  { id: "expansion", icon: TrendingUp },
  { id: "certification", icon: ShieldCheck },
] as const;

export default function RoadmapSection() {
  const { t } = useLanguage();

  return (
    <section id="roadmap" className="border-b border-border/70 bg-secondary/20 py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          title={t("roadmap.title")}
          description={t("roadmap.description")}
          centered={false}
          className="mb-10"
          descriptionClassName="max-w-3xl text-base md:text-lg"
        />

        <div className="relative hidden gap-6 lg:grid lg:grid-cols-6">
          <div className="absolute left-[8.33%] right-[8.33%] top-6 h-px bg-border" />
          {roadmapSteps.map((step, index) => (
            <div key={step.id} className="relative text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-card">
                {index + 1}
              </div>
              <div className="mx-auto mt-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-primary shadow-sm">
                <step.icon className="h-5 w-5" />
              </div>
              <p className="mx-auto mt-4 max-w-[11rem] text-sm font-semibold leading-6 text-foreground">
                {t(`roadmap.steps.${step.id}`)}
              </p>
            </div>
          ))}
        </div>

        <div className="relative space-y-6 lg:hidden">
          <div className="absolute bottom-0 left-[1.75rem] top-0 w-px -translate-x-1/2 bg-border" />
          {roadmapSteps.map((step, index) => (
            <div
              key={step.id}
              className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-4"
            >
              <div className="relative z-10 flex h-full min-h-[8.5rem] justify-center self-stretch">
                <div className="relative top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-card">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

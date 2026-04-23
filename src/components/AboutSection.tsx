import {
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  FileCheck2,
  FileSearch,
  FolderOpen,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";

const deliverableCards = [
  { id: "score", icon: BarChart3 },
  { id: "rationale", icon: FileCheck2 },
  { id: "gaps", icon: AlertTriangle },
  { id: "nextSteps", icon: Lightbulb },
  { id: "strengths", icon: BadgeCheck },
  { id: "evidence", icon: FileSearch },
] as const;

const reasons = [
  { id: "practical", icon: BadgeCheck },
  { id: "smes", icon: TrendingUp },
  { id: "documentFirst", icon: FolderOpen },
  { id: "privacy", icon: ShieldCheck },
  { id: "progression", icon: BarChart3 },
] as const;

export default function AboutSection() {
  const { t } = useLanguage();
  const deliverableRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [deliverableHeight, setDeliverableHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const measureDeliverables = () => {
      const heights = deliverableRefs.current
        .map((element) => element?.offsetHeight ?? 0)
        .filter((height) => height > 0);

      if (heights.length === 0) {
        return;
      }

      setDeliverableHeight(Math.ceil(Math.max(...heights)));
    };

    measureDeliverables();

    const resizeObserver = new ResizeObserver(() => {
      measureDeliverables();
    });

    deliverableRefs.current.forEach((element) => {
      if (element) {
        resizeObserver.observe(element);
      }
    });

    window.addEventListener("resize", measureDeliverables);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureDeliverables);
    };
  }, [t]);

  return (
    <section id="why-esgcheck" className="border-b border-border/70 bg-secondary/25 py-20">
      <div className="container mx-auto px-4">
        <div className="grid gap-14 xl:grid-cols-[1.15fr_0.85fr] xl:gap-16">
          <div>
            <SectionHeading
              title={t("deliverables.title")}
              centered={false}
              className="mb-10"
            />

            <div className="grid justify-items-center gap-4 grid-cols-2 xl:grid-cols-3">
              {deliverableCards.map((item, index) => (
                <div
                  key={item.id}
                  ref={(element) => {
                    deliverableRefs.current[index] = element;
                  }}
                  style={deliverableHeight ? { minHeight: `${deliverableHeight}px` } : undefined}
                  className="flex h-full w-full max-w-[22rem] flex-col items-center justify-center rounded-2xl border border-border/80 bg-card px-5 py-5 text-center shadow-card"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t(`deliverables.items.${item.id}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-foreground/70">
                    {t(`deliverables.items.${item.id}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading
              title={t("reasons.title")}
              centered={false}
              className="mb-10"
            />

            <div className="space-y-4">
              {reasons.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border/80 bg-card px-5 py-5 shadow-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {t(`reasons.items.${item.id}.title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-foreground/70">
                        {t(`reasons.items.${item.id}.description`)}
                      </p>
                    </div>
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

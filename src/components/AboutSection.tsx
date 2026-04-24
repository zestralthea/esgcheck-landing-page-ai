import {
  BadgeCheck,
  FolderOpen,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";

const reasons = [
  { id: "practical", icon: BadgeCheck },
  { id: "smes", icon: TrendingUp },
  { id: "documentFirst", icon: FolderOpen },
  { id: "privacy", icon: ShieldCheck },
] as const;

export default function AboutSection() {
  const { t } = useLanguage();

  return (
    <section id="why-esgcheck" className="border-b border-border/70 bg-secondary/25 py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          title={t("reasons.title")}
          centered={false}
          className="mb-10"
        />

        <div className="grid gap-4 md:grid-cols-2">
          {reasons.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border/80 bg-card px-5 py-5 shadow-card"
            >
              <div className="flex items-start gap-4">
                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
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
    </section>
  );
}

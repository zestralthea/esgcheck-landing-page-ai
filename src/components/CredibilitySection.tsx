import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Map,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SectionHeading } from "@/components/common/SectionHeading";

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

function MountainMark() {
  return (
    <svg viewBox="0 0 200 90" className="h-20 w-full text-primary/15">
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

  return (
    <section className="border-b border-border/70 bg-background py-20">
      <div className="container mx-auto space-y-14 px-4">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-[28px] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--secondary))_100%)] p-7 shadow-card">
            <div className="max-w-sm space-y-4">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                {t("credibility.title")}
              </h2>
              <p className="text-base leading-7 text-foreground/72">
                {t("credibility.intro")}
              </p>
            </div>
            <div className="absolute bottom-5 left-6 right-6">
              <MountainMark />
            </div>
          </div>

          <div className="rounded-[28px] border border-border/80 bg-card p-7 shadow-card">
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
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--accent))_100%)] p-7 shadow-card">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
              {t("credibility.privacyTitle")}
            </h3>
            <p className="mt-3 text-sm leading-7 text-foreground/72">
              {t("credibility.privacyDescription")}
            </p>
            <div className="mt-6 flex gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card text-sm font-semibold text-primary shadow-sm">
                {t("credibility.regionBadges.swiss")}
              </div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card text-sm font-semibold text-primary shadow-sm">
                {t("credibility.regionBadges.europe")}
              </div>
            </div>
          </div>
        </div>

        <div>
          <SectionHeading
            title={t("status.title")}
            centered={false}
            className="mb-8"
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statusItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border/80 bg-card px-5 py-5 shadow-card"
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

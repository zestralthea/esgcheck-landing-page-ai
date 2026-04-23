import { Calculator, Map, UserRound } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AudienceSection() {
  const { t } = useLanguage();

  return (
    <section className="border-b border-border/70 bg-background py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          title={t("audience.title")}
          centered={false}
          className="mb-8"
        />

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_0.86fr]">
          <div className="relative overflow-hidden rounded-[28px] border border-border/80 bg-card p-6 shadow-card">
            <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-primary/6 blur-2xl" />
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
              <UserRound className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
              {t("audience.founders.title")}
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-7 text-foreground/72">
              {t("audience.founders.description")}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-border/80 bg-card p-6 shadow-card">
            <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-primary/6 blur-2xl" />
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Calculator className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
              {t("audience.finance.title")}
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-7 text-foreground/72">
              {t("audience.finance.description")}
            </p>
          </div>

          <div className="rounded-[28px] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--accent))_100%)] p-6 shadow-card">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-card text-primary shadow-sm">
              <Map className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-xl font-semibold leading-8 text-foreground">
              {t("audience.region.title")}
            </h3>
            <div className="mt-6 flex gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-card text-sm font-semibold text-primary shadow-sm">
                {t("audience.region.badges.swiss")}
              </div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-card text-sm font-semibold text-primary shadow-sm">
                {t("audience.region.badges.germany")}
              </div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-card text-sm font-semibold text-primary shadow-sm">
                {t("audience.region.badges.austria")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

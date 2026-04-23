import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const contactHref = "mailto:info@esgcheck.ch?subject=ESGCheck%20more%20information";

export default function FinalCTA() {
  const { t } = useLanguage();

  return (
    <section className="border-b border-border/70 bg-secondary/20 py-20">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-[32px] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--secondary))_100%)] px-6 py-12 text-center shadow-card md:px-10">
          <div className="absolute left-0 top-0 h-32 w-32 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-36 w-36 rounded-full bg-primary/8 blur-3xl" />

          <div className="relative mx-auto max-w-3xl">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {t("finalCta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-foreground/72 md:text-lg">
              {t("finalCta.description")}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="hero" size="lg" className="rounded-xl px-7">
                <a href="#waitlist">
                  {t("finalCta.primary")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl px-7">
                <a href={contactHref}>{t("finalCta.secondary")}</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

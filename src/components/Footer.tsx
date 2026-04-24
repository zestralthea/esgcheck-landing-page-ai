import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const contactHref = "mailto:info@esgcheck.ch?subject=ESGCheck%20contact";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/esgcheck_logo.svg"
                alt="ESGCheck Logo"
                className="h-10 w-10 drop-shadow-[0_12px_18px_hsl(140_18%_10%/0.28)]"
              />
              <span className="text-2xl font-semibold tracking-tight">ESGCheck</span>
            </div>
            <p className="max-w-xs text-sm leading-7 text-primary-foreground/72">
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary-foreground/80">
              {t("footer.product")}
            </h4>
            <ul className="space-y-3 text-sm text-primary-foreground/72">
              <li><a href="#product" className="hover:text-primary-foreground">{t("header.product")}</a></li>
              <li><a href="#how-it-works" className="hover:text-primary-foreground">{t("header.howItWorks")}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary-foreground/80">
              {t("footer.company")}
            </h4>
            <ul className="space-y-3 text-sm text-primary-foreground/72">
              <li><a href="#why-esgcheck" className="hover:text-primary-foreground">{t("header.whyEsgCheck")}</a></li>
              <li><a href="#team" className="hover:text-primary-foreground">{t("header.team")}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary-foreground/80">
              {t("footer.privacy")}
            </h4>
            <ul className="space-y-3 text-sm text-primary-foreground/72">
              <li><a href="#faq" className="hover:text-primary-foreground">{t("header.faq")}</a></li>
              <li><a href={contactHref} className="hover:text-primary-foreground">{t("footer.contact")}</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-foreground/80">
              {t("footer.earlyAccess")}
            </h4>
            <a
              href="#waitlist"
              className="inline-flex items-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-primary shadow-sm transition hover:bg-white/95"
            >
              {t("header.joinWaitlist")}
            </a>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-primary-foreground/80">
              <ShieldCheck className="h-4 w-4" />
              {t("footer.swissBuilt")}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/12 pt-6 text-sm text-primary-foreground/65">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}

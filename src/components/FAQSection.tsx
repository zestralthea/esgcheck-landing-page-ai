import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";

const items = ["certification", "documents", "audience", "pricing"] as const;

export default function FAQSection() {
  const { t } = useLanguage();

  return (
    <section id="faq" className="border-b border-border/70 bg-background py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          title={t("faq.title")}
          centered={false}
          className="mb-8"
        />

        <div className="space-y-4">
          {items.map((item) => (
            <details key={item} className="faq-item">
              <summary className="faq-summary">
                <span>{t(`faq.items.${item}.question`)}</span>
                <ChevronDown className="faq-chevron" />
              </summary>
              <div className="px-6 pb-6 text-sm leading-7 text-foreground/72">
                {t(`faq.items.${item}.answer`)}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

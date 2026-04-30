import { useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  entranceEase,
  faqExpand,
  microSpring,
  revealUp,
  viewportOnce,
} from "@/lib/motion";

const items = ["certification", "vsme", "documents", "audience", "pricing"] as const;

export default function FAQSection() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (item: string) => {
    setOpenItems((current) =>
      current.includes(item)
        ? current.filter((entry) => entry !== item)
        : [...current, item],
    );
  };

  return (
    <section id="faq" className="border-b border-border/70 bg-background py-20">
      <div className="container mx-auto px-4">
        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={revealUp}
          custom={shouldReduceMotion}
        >
          <SectionHeading
            title={t("faq.title")}
            centered={false}
            className="mb-8"
          />
        </m.div>

        <div className="space-y-4">
          {items.map((item, index) => {
            const isOpen = openItems.includes(item);
            const contentId = `faq-${item}`;

            return (
              <m.div
                key={item}
                className={`faq-item ${isOpen ? "border-primary/30" : ""}`}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={revealUp}
                custom={shouldReduceMotion}
                transition={shouldReduceMotion ? undefined : { delay: index * 0.08, duration: 0.46, ease: entranceEase }}
              >
                <button
                  type="button"
                  className="faq-summary w-full bg-transparent text-left"
                  onClick={() => toggleItem(item)}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                >
                  <span>{t(`faq.items.${item}.question`)}</span>
                  <m.span
                    className="flex"
                    animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
                    transition={shouldReduceMotion ? { duration: 0.01 } : microSpring}
                  >
                    <ChevronDown className="faq-chevron" />
                  </m.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <m.div
                      id={contentId}
                      key="content"
                      className="overflow-hidden"
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={faqExpand}
                      custom={shouldReduceMotion}
                    >
                      <div className="max-w-[65ch] px-6 pb-6 text-sm leading-7 text-foreground/72">
                        {t(`faq.items.${item}.answer`)}
                      </div>
                    </m.div>
                  ) : null}
                </AnimatePresence>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

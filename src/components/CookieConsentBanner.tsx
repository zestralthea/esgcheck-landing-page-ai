import { useEffect, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConsent } from "@/contexts/ConsentContext";
import { getLocalePath, useLanguage } from "@/contexts/LanguageContext";
import {
  defaultOptionalConsentPreferences,
  type OptionalConsentPreferences,
} from "@/lib/consent";
import { entranceEase, faqExpand } from "@/lib/motion";

const optionalCategories: Array<keyof OptionalConsentPreferences> = [
  "analytics",
  "marketing",
  "chat",
];

const consentBannerVariants = {
  hidden: (reduced: boolean | undefined) => (reduced ? { opacity: 0 } : { opacity: 0, y: 24 }),
  visible: (reduced: boolean | undefined) =>
    reduced
      ? { opacity: 1, y: 0, transition: { duration: 0.01 } }
      : {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.28,
            ease: entranceEase,
          },
        },
  exit: (reduced: boolean | undefined) =>
    reduced
      ? { opacity: 0, transition: { duration: 0.01 } }
      : {
          opacity: 0,
          y: 24,
          transition: {
            duration: 0.2,
            ease: entranceEase,
          },
        },
};

export default function CookieConsentBanner() {
  const {
    preferences,
    isPreferencesOpen,
    acceptAll,
    closePreferences,
    rejectNonEssential,
    saveOptionalPreferences,
  } = useConsent();
  const { t, language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const isInitialChoice = preferences === null;
  const isVisible = isInitialChoice || isPreferencesOpen;
  const [showDetails, setShowDetails] = useState(false);
  const [draft, setDraft] = useState<OptionalConsentPreferences>(
    defaultOptionalConsentPreferences
  );

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    setShowDetails(isPreferencesOpen);
    setDraft({
      analytics: preferences?.analytics ?? false,
      marketing: preferences?.marketing ?? false,
      chat: preferences?.chat ?? false,
    });
  }, [isPreferencesOpen, isVisible, preferences]);

  const updateDraft = (category: keyof OptionalConsentPreferences, value: boolean) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [category]: value,
    }));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4 sm:px-6"
          custom={shouldReduceMotion}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={consentBannerVariants}
        >
          <div
            aria-labelledby="cookie-consent-title"
            className="mx-auto max-w-5xl rounded-2xl border border-border bg-card p-4 shadow-premium sm:p-5"
            role="dialog"
          >
            <div className="flex gap-4">
              <div className="hidden h-10 w-10 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 id="cookie-consent-title" className="text-base font-semibold text-foreground">
                      {t("consent.title")}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                      {t("consent.description")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      <a
                        className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                        href={getLocalePath(language, "privacy")}
                      >
                        {t("consent.privacyLink")}
                      </a>
                      <span aria-hidden="true"> / </span>
                      <a
                        className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                        href={getLocalePath(language, "cookies")}
                      >
                        {t("consent.cookieLink")}
                      </a>
                    </p>
                  </div>
                  {!isInitialChoice && (
                    <button
                      aria-label={t("consent.close")}
                      className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      type="button"
                      onClick={closePreferences}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {showDetails && (
                    <m.div
                      className="overflow-hidden"
                      custom={shouldReduceMotion}
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={faqExpand}
                    >
                      <div className="mt-4 grid gap-3">
                        <div className="rounded-xl border border-border bg-background/60 p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="text-sm font-semibold text-foreground">
                                {t("consent.categories.essential.title")}
                              </h3>
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {t("consent.categories.essential.description")}
                              </p>
                            </div>
                            <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                              {t("consent.alwaysActive")}
                            </span>
                          </div>
                        </div>

                        {optionalCategories.map((category) => (
                          <label
                            className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border bg-background/60 p-4"
                            key={category}
                          >
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-foreground">
                                {t(`consent.categories.${category}.title`)}
                              </span>
                              <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                                {t(`consent.categories.${category}.description`)}
                              </span>
                            </span>
                            <span className="relative mt-1 inline-flex h-6 w-11 flex-none items-center rounded-full border border-border bg-muted transition">
                              <input
                                checked={draft[category]}
                                className="peer sr-only"
                                type="checkbox"
                                onChange={(event) => updateDraft(category, event.target.checked)}
                              />
                              <span className="absolute left-1 h-4 w-4 rounded-full bg-muted-foreground/80 transition peer-checked:translate-x-5 peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2" />
                            </span>
                          </label>
                        ))}
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>

                <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap sm:justify-end">
                  <Button
                    className="rounded-xl border-primary/70 px-5 font-semibold text-primary hover:bg-primary/5"
                    type="button"
                    variant="outline"
                    onClick={rejectNonEssential}
                  >
                    {t("consent.reject")}
                  </Button>
                  {showDetails ? (
                    <Button
                      className="rounded-xl px-5 font-semibold"
                      type="button"
                      onClick={() => saveOptionalPreferences(draft)}
                    >
                      {t("consent.save")}
                    </Button>
                  ) : (
                    <Button
                      className="rounded-xl px-5 font-semibold"
                      type="button"
                      variant="outline"
                      onClick={() => setShowDetails(true)}
                    >
                      {t("consent.manage")}
                    </Button>
                  )}
                  <Button className="rounded-xl px-5 font-semibold" type="button" onClick={acceptAll}>
                    {t("consent.accept")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

import { useEffect } from "react";
import { m, useReducedMotion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GradientCard } from "@/components/common/GradientCard";
import { SectionHeading } from "@/components/common/SectionHeading";
import { getLocalePath, useLanguage } from "@/contexts/LanguageContext";
import { entranceEase, microSpring, revealLeft, revealRight, revealUp, viewportOnce } from "@/lib/motion";

const brevoFormAction =
  "https://f3345453.sibforms.com/serve/MUIFAG23m2tWDesGY_yFxoeJFq9SqBJbGkfm7K1Y2WgbezBpQPZHZ5jkKXnQeKVLTBQt-HGSPePgxZw7qzdOcTB10_BFteEH7OLjKq6wxN2HovLA-PBdBcGuidKDvh9HB6Om7Mn83v2je_l8qohOEbwakFPNIHIRPmEHbwjqxEg50p3vDJl1jdZ1_wkvu4jCp6CxVqdIJpprXyeeIw==";
const brevoScriptId = "brevo-form-main";
const brevoScriptSrc = "https://sibforms.com/forms/end-form/build/main.js";
const brevoSuccessClassName = "sib-form-message-panel--active";
const brevoSuccessRedirectDelay = 650;
const turnstileSiteKey = "0x4AAAAAABmAJXX1tHQtUYp_";
const contactHref = "mailto:info@esgcheck.ch?subject=ESGCheck%20more%20information";

type TurnstileRenderOptions = {
  sitekey: string;
  callback?: (token: string) => void;
  "error-callback"?: (errorCode: string) => void;
  language?: string;
  size?: "normal" | "compact" | "flexible";
  theme?: "auto" | "light" | "dark";
};

type TurnstileApi = {
  render: (container: HTMLElement | string, options: TurnstileRenderOptions) => string | undefined;
  remove?: (widgetId: string) => void;
  getResponse?: (widgetId?: string) => string;
};

declare global {
  interface Window {
    grecaptcha?: TurnstileApi;
    handleCaptchaResponse?: () => void;
    renderBrevoTurnstile?: () => boolean;
    turnstile?: TurnstileApi;
  }
}

export default function WaitlistCTA() {
  const { t, language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const existingScript = document.getElementById(brevoScriptId);

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = brevoScriptId;
      script.defer = true;
      script.src = brevoScriptSrc;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    let retryId: number | undefined;
    let attempts = 0;

    const renderBrevoTurnstile = () => {
      const captcha = document.getElementById("sib-captcha");

      if (!captcha) {
        return false;
      }

      if (captcha.dataset.turnstileWidgetId || captcha.querySelector("iframe")) {
        return true;
      }

      if (!window.turnstile?.render) {
        return false;
      }

      window.grecaptcha = window.turnstile;

      try {
        const widgetId = window.turnstile.render(captcha, {
          sitekey: turnstileSiteKey,
          callback: () => window.handleCaptchaResponse?.(),
          "error-callback": () => {
            captcha.removeAttribute("data-turnstile-widget-id");
          },
          language,
          size: "flexible",
          theme: "auto",
        });

        if (widgetId) {
          captcha.dataset.turnstileWidgetId = widgetId;
        }

        return true;
      } catch {
        return Boolean(captcha.querySelector("iframe"));
      }
    };

    window.renderBrevoTurnstile = renderBrevoTurnstile;

    if (!renderBrevoTurnstile()) {
      retryId = window.setInterval(() => {
        attempts += 1;

        if (renderBrevoTurnstile() || attempts >= 40) {
          window.clearInterval(retryId);
        }
      }, 250);
    }

    return () => {
      if (retryId) {
        window.clearInterval(retryId);
      }

      if (window.renderBrevoTurnstile === renderBrevoTurnstile) {
        delete window.renderBrevoTurnstile;
      }

      const captcha = document.getElementById("sib-captcha");
      const widgetId = captcha?.dataset.turnstileWidgetId;

      if (widgetId) {
        window.turnstile?.remove?.(widgetId);
      }
    };
  }, [language]);

  useEffect(() => {
    const successMessage = document.getElementById("success-message");

    if (!successMessage) {
      return;
    }

    let redirectId: number | undefined;
    const redirectPath = getLocalePath(language, "confirmation");

    const redirectAfterBrevoSuccess = () => {
      if (!successMessage.classList.contains(brevoSuccessClassName) || redirectId) {
        return;
      }

      redirectId = window.setTimeout(() => {
        window.location.assign(redirectPath);
      }, brevoSuccessRedirectDelay);
    };

    redirectAfterBrevoSuccess();

    const observer = new MutationObserver(redirectAfterBrevoSuccess);
    observer.observe(successMessage, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();

      if (redirectId) {
        window.clearTimeout(redirectId);
      }
    };
  }, [language]);

  return (
    <section id="waitlist" className="bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={revealUp}
            custom={shouldReduceMotion}
          >
            <SectionHeading
              title={t("waitlist.title")}
              description={t("waitlist.description")}
              centered
              className="mb-8"
              descriptionClassName="text-base md:text-lg"
            />
          </m.div>

          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={revealUp}
            custom={shouldReduceMotion}
            transition={shouldReduceMotion ? undefined : { duration: 0.6, ease: entranceEase }}
          >
            <GradientCard
              variant="premium"
              hover="none"
              className="overflow-hidden rounded-[32px] border border-border/80"
              containerClassName="grid gap-0 lg:grid-cols-[1fr_3fr]"
            >
            <m.div
              className="relative bg-[linear-gradient(180deg,hsl(var(--secondary))_0%,hsl(var(--accent))_100%)] p-8 md:p-10"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={revealLeft}
              custom={shouldReduceMotion}
              transition={shouldReduceMotion ? undefined : { delay: 0.1, duration: 0.56, ease: entranceEase }}
            >
              <div className="absolute left-0 top-0 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative flex flex-col items-start text-left lg:items-end lg:text-right">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-card text-primary shadow-sm">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="mt-6 max-w-sm text-3xl font-semibold tracking-tight text-foreground">
                  {t("waitlist.cardTitle")}
                </h3>
                <p className="mt-4 max-w-sm text-base leading-8 text-foreground/72">
                  {t("waitlist.emailNote")}
                </p>
                <div className="mt-8 inline-flex max-w-full items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/75 shadow-sm sm:px-5 lg:self-end">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span className="whitespace-nowrap sm:hidden">{t("waitlist.modal.disclaimerShort")}</span>
                  <span className="hidden whitespace-nowrap sm:inline">{t("waitlist.modal.disclaimer")}</span>
                </div>
                <p className="mt-4 max-w-sm text-sm leading-7 text-foreground/68">
                  {t("waitlist.modal.betaNote")}
                </p>
                <m.div
                  className="mt-8 self-start lg:self-end"
                  whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.2 } }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.98, transition: microSpring }}
                >
                  <Button asChild variant="outline" size="lg" className="rounded-xl px-7">
                    <a href={contactHref}>{t("finalCta.secondary")}</a>
                  </Button>
                </m.div>
              </div>
            </m.div>

            <m.div
              className="min-w-0 overflow-hidden bg-card p-6 md:p-8"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={revealRight}
              custom={shouldReduceMotion}
              transition={shouldReduceMotion ? undefined : { delay: 0.18, duration: 0.56, ease: entranceEase }}
            >
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl text-foreground">
                  {t("waitlist.ctaButton")}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="sib-form brevo-form-shell">
                  <div id="sib-form-container" className="sib-form-container">
                    <div id="error-message" className="sib-form-message-panel brevo-message brevo-message-error">
                      <div className="sib-form-message-panel__text sib-form-message-panel__text--center">
                        <span className="sib-form-message-panel__inner-text">
                          {t("waitlist.form.error")}
                        </span>
                      </div>
                    </div>
                    <div id="success-message" className="sib-form-message-panel brevo-message brevo-message-success">
                      <div className="sib-form-message-panel__text sib-form-message-panel__text--center">
                        <span className="sib-form-message-panel__inner-text">
                          {t("waitlist.form.success")}
                        </span>
                      </div>
                    </div>

                    <div
                      id="sib-container"
                      className="sib-container--large sib-container--vertical brevo-container"
                    >
                      <form id="sib-form" method="POST" action={brevoFormAction} data-type="subscription">
                        <div className="sib-input sib-form-block">
                          <div className="form__entry entry_block">
                            <div className="form__label-row">
                              <label className="entry__label" htmlFor="EMAIL" data-required="*">
                                {t("waitlist.form.emailLabel")}
                              </label>
                              <div className="entry__field">
                                <input
                                  className="input"
                                  type="text"
                                  id="EMAIL"
                                  name="EMAIL"
                                  autoComplete="off"
                                  placeholder={t("waitlist.form.emailPlaceholder")}
                                  data-required="true"
                                  required
                                />
                              </div>
                            </div>

                            <label className="entry__error entry__error--primary" />
                            <label className="entry__specification">
                              {t("waitlist.form.emailHelp")}
                            </label>
                          </div>
                        </div>

                        <div className="sib-optin sib-form-block" data-required="true">
                          <div className="form__entry entry_mcq">
                            <div className="form__label-row">
                              <label className="entry__label" htmlFor="GDPR_FIELD" data-required="*">
                                {t("waitlist.form.optInLabel")}
                              </label>
                              <div className="entry__choice">
                                <label className="brevo-checkbox-row">
                                  <input
                                    type="checkbox"
                                    className="input_replaced"
                                    value="1"
                                    id="GDPR_FIELD"
                                    name="GDPR_FIELD"
                                    required
                                  />
                                  <span className="checkbox checkbox_tick_positive" />
                                  <span>{t("waitlist.form.optInText")}</span>
                                </label>
                              </div>
                            </div>

                            <label className="entry__error entry__error--primary" />
                            <label className="entry__specification">
                              {t("waitlist.form.optInHelp")}
                            </label>
                          </div>
                        </div>

                        <div className="sib-form__declaration">
                          <div className="brevo-declaration-icon" aria-hidden="true">
                            <Mail className="h-5 w-5" />
                          </div>
                          <p>
                            {t("waitlist.form.brevoDisclaimer")}{" "}
                            <a
                              href="https://www.brevo.com/en/legal/privacypolicy/"
                              target="_blank"
                              rel="noreferrer"
                            >
                              {t("waitlist.form.brevoLinkLabel")}
                            </a>
                          </p>
                        </div>

                        <div className="sib-captcha sib-form-block">
                          <div className="form__entry entry_block">
                            <div className="form__label-row">
                              <div
                                className="g-recaptcha"
                                data-sitekey={turnstileSiteKey}
                                id="sib-captcha"
                                data-callback="handleCaptchaResponse"
                                data-language={language}
                                data-size="flexible"
                              />
                            </div>
                            <label className="entry__error entry__error--primary" />
                          </div>
                        </div>

                        <div className="sib-form-block brevo-submit-row">
                          <button
                            className="sib-form-block__button sib-form-block__button-with-loader"
                            form="sib-form"
                            type="submit"
                          >
                            <svg
                              className="icon clickable__icon progress-indicator__icon sib-hide-loader-icon"
                              viewBox="0 0 512 512"
                              aria-hidden="true"
                            >
                              <path d="M460.116 373.846l-20.823-12.022c-5.541-3.199-7.54-10.159-4.663-15.874 30.137-59.886 28.343-131.652-5.386-189.946-33.641-58.394-94.896-95.833-161.827-99.676C261.028 55.961 256 50.751 256 44.352V20.309c0-6.904 5.808-12.337 12.703-11.982 83.556 4.306 160.163 50.864 202.11 123.677 42.063 72.696 44.079 162.316 6.031 236.832-3.14 6.148-10.75 8.461-16.728 5.01z" />
                            </svg>
                            {t("waitlist.ctaButton")}
                          </button>
                        </div>

                        <input type="text" name="email_address_check" value="" className="input--hidden" readOnly />
                        <input type="hidden" name="LANGUAGE" value={language} />
                        <input type="hidden" name="locale" value={language} />
                      </form>
                    </div>
                  </div>
                </div>
              </CardContent>
            </m.div>
          </GradientCard>
          </m.div>
        </div>
      </div>
    </section>
  );
}

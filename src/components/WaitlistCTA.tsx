import { useEffect } from "react";
import { Mail } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientCard } from "@/components/common/GradientCard";
import { SectionHeading } from "@/components/common/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";

const brevoFormAction =
  "https://f3345453.sibforms.com/serve/MUIFAG23m2tWDesGY_yFxoeJFq9SqBJbGkfm7K1Y2WgbezBpQPZHZ5jkKXnQeKVLTBQt-HGSPePgxZw7qzdOcTB10_BFteEH7OLjKq6wxN2HovLA-PBdBcGuidKDvh9HB6Om7Mn83v2je_l8qohOEbwakFPNIHIRPmEHbwjqxEg50p3vDJl1jdZ1_wkvu4jCp6CxVqdIJpprXyeeIw==";
const brevoScriptId = "brevo-form-main";
const brevoScriptSrc = "https://sibforms.com/forms/end-form/build/main.js";
const turnstileSiteKey = "0x4AAAAAABmAJXX1tHQtUYp_";

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
  const { t } = useLanguage();

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
          language: "en",
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
  }, []);

  return (
    <section id="waitlist" className="scroll-mt-16 py-20 bg-gradient-accent relative">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <SectionHeading
            title={t('waitlist.title')}
            description={t('waitlist.description')}
            centered
            titleClassName="text-center"
            descriptionClassName="text-center mx-auto"
          />

          <GradientCard
            variant="default"
            hover="none"
            className="relative overflow-hidden bg-[hsl(var(--card)/0.35)] backdrop-blur-xl border border-border/30 ring-1 ring-white/5"
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary">
                <Mail className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl text-center">{t('waitlist.cardTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="sib-form brevo-form-shell">
                <div id="sib-form-container" className="sib-form-container">
                  <div id="error-message" className="sib-form-message-panel brevo-message brevo-message-error">
                    <div className="sib-form-message-panel__text sib-form-message-panel__text--center">
                      <span className="sib-form-message-panel__inner-text">
                        Your subscription could not be saved. Please try again.
                      </span>
                    </div>
                  </div>
                  <div id="success-message" className="sib-form-message-panel brevo-message brevo-message-success">
                    <div className="sib-form-message-panel__text sib-form-message-panel__text--center">
                      <span className="sib-form-message-panel__inner-text">
                        Your subscription has been successful.
                      </span>
                    </div>
                  </div>

                  <div
                    id="sib-container"
                    className="sib-container--large sib-container--vertical brevo-container"
                  >
                    <form id="sib-form" method="POST" action={brevoFormAction} data-type="subscription">
                      <div className="sib-form-block brevo-intro">
                        <p className="brevo-helper">{t('waitlist.emailNote')}</p>
                      </div>

                      <div className="sib-input sib-form-block">
                        <div className="form__entry entry_block">
                          <div className="form__label-row">
                            <label className="entry__label" htmlFor="EMAIL" data-required="*">
                              Work email
                            </label>
                            <div className="entry__field">
                              <input
                                className="input"
                                type="text"
                                id="EMAIL"
                                name="EMAIL"
                                autoComplete="off"
                                placeholder="you@company.com"
                                data-required="true"
                                required
                              />
                            </div>
                          </div>

                          <label className="entry__error entry__error--primary" />
                          <label className="entry__specification">
                            Provide your email address to request early access.
                          </label>
                        </div>
                      </div>

                      <div className="sib-optin sib-form-block" data-required="true">
                        <div className="form__entry entry_mcq">
                          <div className="form__label-row">
                            <label className="entry__label" htmlFor="GDPR_FIELD" data-required="*">
                              Opt-in
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
                                <span>
                                  I agree to receive your newsletters and accept the data privacy statement.
                                </span>
                              </label>
                            </div>
                          </div>

                          <label className="entry__error entry__error--primary" />
                          <label className="entry__specification">
                            You may unsubscribe at any time using the link in our newsletter.
                          </label>
                        </div>
                      </div>

                      <div className="sib-form__declaration">
                        <div className="brevo-declaration-icon" aria-hidden="true">
                          <Mail className="h-5 w-5" />
                        </div>
                        <p>
                          We use Brevo as our marketing platform. By submitting this form you agree that
                          the personal data you provided will be transferred to Brevo for processing in
                          accordance with{" "}
                          <a
                            href="https://www.brevo.com/en/legal/privacypolicy/"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Brevo&apos;s Privacy Policy.
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
                              data-language="en"
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
                          {t('waitlist.ctaButton')}
                        </button>
                      </div>

                      <input type="text" name="email_address_check" value="" className="input--hidden" readOnly />
                      <input type="hidden" name="locale" value="en" />
                    </form>
                  </div>
                </div>
              </div>
            </CardContent>
          </GradientCard>
        </div>
      </div>
    </section>
  );
}

import type { ConsentPreferences } from "./consent";

const GOOGLE_ANALYTICS_ID = "G-LLSCC9JSD3";
const BREVO_CLIENT_KEY = "x4a0oxdt4i597z5bv67mthex";
const BREVO_CONVERSATIONS_ID = "69e87c6ac35ec0395d031d0b";

type BrevoConversationsQueue = ((...args: unknown[]) => void) & {
  q?: unknown[][];
};

declare global {
  interface Window {
    Brevo?: unknown[];
    BrevoConversations?: BrevoConversationsQueue;
    BrevoConversationsID?: string;
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    __esgcheckBrevoConversationsLoaded?: boolean;
    __esgcheckBrevoTrackerInitialized?: boolean;
    __esgcheckGoogleAnalyticsLoaded?: boolean;
  }
}

const loadScriptOnce = (id: string, src: string) => {
  if (typeof document === "undefined") {
    return;
  }

  if (document.getElementById(id)) {
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
};

const loadGoogleAnalytics = () => {
  if (typeof window === "undefined" || window.__esgcheckGoogleAnalyticsLoaded) {
    return;
  }

  window.__esgcheckGoogleAnalyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  window.gtag("consent", "default", {
    ad_personalization: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    analytics_storage: "granted",
  });
  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_ANALYTICS_ID);

  loadScriptOnce(
    "esgcheck-google-analytics",
    `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`
  );
};

const loadBrevoTracker = () => {
  if (typeof window === "undefined" || window.__esgcheckBrevoTrackerInitialized) {
    return;
  }

  window.__esgcheckBrevoTrackerInitialized = true;
  window.Brevo = window.Brevo || [];
  window.Brevo.push([
    "init",
    {
      client_key: BREVO_CLIENT_KEY,
    },
  ]);

  loadScriptOnce("esgcheck-brevo-tracker", "https://cdn.brevo.com/js/sdk-loader.js");
};

const loadBrevoConversations = () => {
  if (typeof window === "undefined" || window.__esgcheckBrevoConversationsLoaded) {
    return;
  }

  window.__esgcheckBrevoConversationsLoaded = true;
  window.BrevoConversationsID = BREVO_CONVERSATIONS_ID;

  if (!window.BrevoConversations) {
    const queue = function BrevoConversations(...args: unknown[]) {
      (queue.q = queue.q || []).push(args);
    } as BrevoConversationsQueue;

    window.BrevoConversations = queue;
  }

  loadScriptOnce(
    "esgcheck-brevo-conversations",
    "https://conversations-widget.brevo.com/brevo-conversations.js"
  );
};

export const applyConsentPreferences = (preferences: ConsentPreferences | null) => {
  if (!preferences) {
    return;
  }

  if (preferences.analytics) {
    loadGoogleAnalytics();
  }

  if (preferences.marketing) {
    loadBrevoTracker();
  }

  if (preferences.chat) {
    loadBrevoConversations();
  }
};

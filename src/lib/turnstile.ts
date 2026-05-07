export type TurnstileRenderOptions = {
  sitekey: string;
  callback?: (token: string) => void;
  "error-callback"?: (errorCode: string) => void;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
  language?: string;
  size?: "normal" | "compact" | "flexible";
  theme?: "auto" | "light" | "dark";
};

export type TurnstileApi = {
  render: (container: HTMLElement | string, options: TurnstileRenderOptions) => string | undefined;
  remove?: (widgetId: string) => void;
  getResponse?: (widgetId?: string) => string;
  reset?: (widgetId?: string) => void;
};

declare global {
  interface Window {
    grecaptcha?: TurnstileApi;
    onBrevoTurnstileLoad?: () => void;
    renderBrevoTurnstile?: () => boolean;
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SCRIPT_ID = "esgcheck-turnstile-script";
const TURNSTILE_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onBrevoTurnstileLoad";

let turnstileLoadPromise: Promise<void> | null = null;

export const loadTurnstile = () => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.turnstile?.render) {
    window.grecaptcha = window.turnstile;
    return Promise.resolve();
  }

  if (turnstileLoadPromise) {
    return turnstileLoadPromise;
  }

  turnstileLoadPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    const previousOnLoad = window.onBrevoTurnstileLoad;

    const handleLoad = () => {
      window.grecaptcha = window.turnstile;
      previousOnLoad?.();
      resolve();
    };

    window.onBrevoTurnstileLoad = handleLoad;

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener(
        "error",
        () => {
          turnstileLoadPromise = null;
          reject(new Error("Cloudflare Turnstile failed to load."));
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      turnstileLoadPromise = null;
      reject(new Error("Cloudflare Turnstile failed to load."));
    };

    document.head.appendChild(script);
  });

  return turnstileLoadPromise;
};

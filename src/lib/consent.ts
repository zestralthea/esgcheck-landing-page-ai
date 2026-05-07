export const CONSENT_STORAGE_KEY = "esgcheck_cookie_consent_v1";
export const CONSENT_VERSION = 1;

export type ConsentPreferences = {
  version: typeof CONSENT_VERSION;
  essential: true;
  analytics: boolean;
  marketing: boolean;
  chat: boolean;
  updatedAt: string;
};

export type OptionalConsentPreferences = Pick<
  ConsentPreferences,
  "analytics" | "marketing" | "chat"
>;

export const defaultOptionalConsentPreferences: OptionalConsentPreferences = {
  analytics: false,
  marketing: false,
  chat: false,
};

export const createConsentPreferences = (
  preferences: OptionalConsentPreferences
): ConsentPreferences => ({
  version: CONSENT_VERSION,
  essential: true,
  analytics: preferences.analytics,
  marketing: preferences.marketing,
  chat: preferences.chat,
  updatedAt: new Date().toISOString(),
});

export const createAllAcceptedConsentPreferences = () =>
  createConsentPreferences({
    analytics: true,
    marketing: true,
    chat: true,
  });

export const createAllRejectedConsentPreferences = () =>
  createConsentPreferences(defaultOptionalConsentPreferences);

export const loadConsentPreferences = (): ConsentPreferences | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(CONSENT_STORAGE_KEY);

    if (!storedValue) {
      return null;
    }

    const parsed = JSON.parse(storedValue) as Partial<ConsentPreferences>;

    if (parsed.version !== CONSENT_VERSION || parsed.essential !== true) {
      return null;
    }

    return createConsentPreferences({
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
      chat: parsed.chat === true,
    });
  } catch {
    return null;
  }
};

export const saveConsentPreferences = (preferences: ConsentPreferences) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // If storage is unavailable, keep the in-memory React state for this session.
  }
};

export const hasConsentWithdrawal = (
  previousPreferences: ConsentPreferences | null,
  nextPreferences: ConsentPreferences
) =>
  Boolean(
    previousPreferences &&
      ((previousPreferences.analytics && !nextPreferences.analytics) ||
        (previousPreferences.marketing && !nextPreferences.marketing) ||
        (previousPreferences.chat && !nextPreferences.chat))
  );

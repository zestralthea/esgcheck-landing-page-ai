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

const optionalCookiePatterns = [
  /^_ga($|_)/,
  /^_gid$/,
  /^_gat/,
  /^_gac_/,
  /^_gcl_/,
  /^brevo/i,
  /^sib/i,
  /^sib_cuid/i,
  /^visitor_id/i,
];

const optionalStoragePatterns = [
  /^_ga($|_)/,
  /^brevo/i,
  /^sib/i,
  /^sib_cuid/i,
  /^BrevoConversations/i,
  /^brevo_conversations/i,
];

const matchesAnyPattern = (value: string, patterns: RegExp[]) =>
  patterns.some((pattern) => pattern.test(value));

const getCookieDeletionDomains = () => {
  const hostname = window.location.hostname;
  const domains = new Set<string | null>([null, hostname, `.${hostname}`]);
  const parts = hostname.split(".").filter(Boolean);

  if (parts.length >= 2) {
    const parentDomain = parts.slice(-2).join(".");
    domains.add(parentDomain);
    domains.add(`.${parentDomain}`);
  }

  return Array.from(domains);
};

const deleteCookie = (name: string) => {
  const encodedName = encodeURIComponent(name);
  const expires = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  const maxAge = "Max-Age=0";

  getCookieDeletionDomains().forEach((domain) => {
    const domainPart = domain ? `; domain=${domain}` : "";
    document.cookie = `${encodedName}=; ${expires}; ${maxAge}; path=/${domainPart}; SameSite=Lax`;
    document.cookie = `${encodedName}=; ${expires}; ${maxAge}; path=/${domainPart}; SameSite=None; Secure`;
  });
};

const decodeCookieName = (name: string) => {
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
};

const clearMatchingStorageKeys = (storage: Storage) => {
  const keysToRemove: string[] = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);

    if (key && key !== CONSENT_STORAGE_KEY && matchesAnyPattern(key, optionalStoragePatterns)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => storage.removeItem(key));
};

export const clearOptionalConsentStorage = () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    document.cookie
      .split(";")
      .map((cookie) => decodeCookieName(cookie.trim().split("=")[0]))
      .filter((name) => name && matchesAnyPattern(name, optionalCookiePatterns))
      .forEach((name) => deleteCookie(name));
  } catch {
    // Cookie access can be restricted by browser privacy settings.
  }

  try {
    clearMatchingStorageKeys(window.localStorage);
  } catch {
    // Storage may be unavailable in private browsing modes.
  }

  try {
    clearMatchingStorageKeys(window.sessionStorage);
  } catch {
    // Storage may be unavailable in private browsing modes.
  }
};

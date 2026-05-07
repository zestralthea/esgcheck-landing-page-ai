import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  deTranslations,
  enTranslations,
  frTranslations,
  itTranslations,
  rmTranslations,
  type TranslationDictionary,
} from "./translations";

export const siteBaseUrl = "https://esgcheck.ch";
export const supportedLanguages = ["en", "de", "fr", "it", "rm"] as const;
export type Language = (typeof supportedLanguages)[number];
export const defaultLanguage: Language = "en";
export type SitePage = "home" | "confirmation" | "thankYou" | "privacy" | "cookies" | "legalNotice";

export const languageMetadata: Record<
  Language,
  { label: string; htmlLang: string; hrefLang: string; path: string }
> = {
  en: { label: "EN", htmlLang: "en", hrefLang: "en", path: "en" },
  de: { label: "DE", htmlLang: "de-CH", hrefLang: "de-CH", path: "de" },
  fr: { label: "FR", htmlLang: "fr-CH", hrefLang: "fr-CH", path: "fr" },
  it: { label: "IT", htmlLang: "it-CH", hrefLang: "it-CH", path: "it" },
  rm: { label: "RM", htmlLang: "rm-CH", hrefLang: "rm-CH", path: "rm" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

declare global {
  interface Window {
    REQUIRED_CODE_ERROR_MESSAGE?: string;
    LOCALE?: string;
    EMAIL_INVALID_MESSAGE?: string;
    SMS_INVALID_MESSAGE?: string;
    REQUIRED_ERROR_MESSAGE?: string;
    GENERIC_INVALID_MESSAGE?: string;
    translation?: {
      common?: {
        selectedList?: string;
        selectedLists?: string;
        selectedOption?: string;
        selectedOptions?: string;
      };
    };
  }
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() =>
    typeof window === "undefined"
      ? defaultLanguage
      : getLanguageFromPathname(window.location.pathname)
  );

  useEffect(() => {
    const syncLanguageFromLocation = () => {
      setLanguageState(getLanguageFromPathname(window.location.pathname));
    };

    window.addEventListener("popstate", syncLanguageFromLocation);

    return () => {
      window.removeEventListener("popstate", syncLanguageFromLocation);
    };
  }, []);

  useEffect(() => {
    const formRuntime = getTranslations(language).formRuntime;

    document.documentElement.lang = languageMetadata[language].htmlLang;
    window.LOCALE = language;
    window.REQUIRED_CODE_ERROR_MESSAGE = formRuntime.requiredCodeErrorMessage;
    window.EMAIL_INVALID_MESSAGE = formRuntime.invalidMessage;
    window.SMS_INVALID_MESSAGE = formRuntime.invalidMessage;
    window.REQUIRED_ERROR_MESSAGE = formRuntime.requiredErrorMessage;
    window.GENERIC_INVALID_MESSAGE = formRuntime.invalidMessage;
    window.translation = {
      ...window.translation,
      common: {
        ...window.translation?.common,
        selectedList: formRuntime.selectedList,
        selectedLists: formRuntime.selectedLists,
        selectedOption: formRuntime.selectedOption,
        selectedOptions: formRuntime.selectedOptions,
      },
    };
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);

    if (typeof window === "undefined") {
      return;
    }

    const nextUrl = getLocalizedUrl(lang, window.location);
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextUrl !== currentUrl) {
      window.history.pushState({}, "", nextUrl);
    }
  };

  const t = (key: string): string => {
    const translations = getTranslations(language);
    return getNestedValue(translations, key) || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const getNestedValue = (obj: Record<string, unknown>, path: string): string | undefined => {
  const value = path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);

  return typeof value === "string" ? value : undefined;
};

export const getLocalePath = (lang: Language, page: SitePage = "home") => {
  const localePath = `/${languageMetadata[lang].path}/`;

  if (page === "confirmation") {
    return `${localePath}confirmation/`;
  }

  if (page === "thankYou") {
    return `${localePath}thank-you/`;
  }

  if (page === "privacy") {
    return `${localePath}privacy/`;
  }

  if (page === "cookies") {
    return `${localePath}cookies/`;
  }

  if (page === "legalNotice") {
    return `${localePath}legal-notice/`;
  }

  return localePath;
};

export const getLocaleUrl = (lang: Language, page: SitePage = "home") =>
  `${siteBaseUrl}${getLocalePath(lang, page)}`;

export const getLanguageFromPathname = (pathname: string): Language => {
  const segment = pathname.split("/").filter(Boolean)[0];

  return isSupportedLanguage(segment) ? segment : defaultLanguage;
};

export const getSitePageFromPathname = (pathname: string): SitePage => {
  const segments = pathname.split("/").filter(Boolean);
  const pageSegment = isSupportedLanguage(segments[0]) ? segments[1] : segments[0];

  if (pageSegment === "confirmation") {
    return "confirmation";
  }

  if (pageSegment === "thank-you" || pageSegment === "subscribed") {
    return "thankYou";
  }

  if (pageSegment === "privacy") {
    return "privacy";
  }

  if (pageSegment === "cookies") {
    return "cookies";
  }

  if (pageSegment === "legal-notice") {
    return "legalNotice";
  }

  return "home";
};

const getLocalizedUrl = (lang: Language, location: Location) => {
  const nextPath = getLocalePath(lang, getSitePageFromPathname(location.pathname));

  return `${nextPath}${location.search}${location.hash}`;
};

const isSupportedLanguage = (value: string | undefined): value is Language =>
  supportedLanguages.includes(value as Language);

export const getTranslations = (lang: Language): TranslationDictionary => {
  switch (lang) {
    case "de":
      return deTranslations;
    case "fr":
      return frTranslations;
    case "it":
      return itTranslations;
    case "rm":
      return rmTranslations;
    case "en":
    default:
      return enTranslations;
  }
};

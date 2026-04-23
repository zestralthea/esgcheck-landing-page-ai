import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  deTranslations,
  enTranslations,
  frTranslations,
  type TranslationDictionary,
} from "./translations";

export type Language = "en" | "de" | "fr";

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
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const formRuntime = getTranslations(language).formRuntime;

    document.documentElement.lang = language;
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

const getTranslations = (lang: Language): TranslationDictionary => {
  switch (lang) {
    case "de":
      return deTranslations;
    case "fr":
      return frTranslations;
    case "en":
    default:
      return enTranslations;
  }
};

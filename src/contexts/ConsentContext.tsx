import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createAllAcceptedConsentPreferences,
  createAllRejectedConsentPreferences,
  createConsentPreferences,
  hasConsentWithdrawal,
  loadConsentPreferences,
  saveConsentPreferences,
  type ConsentPreferences,
  type OptionalConsentPreferences,
} from "@/lib/consent";
import { applyConsentPreferences } from "@/lib/consentScripts";

interface ConsentContextType {
  preferences: ConsentPreferences | null;
  isPreferencesOpen: boolean;
  acceptAll: () => void;
  closePreferences: () => void;
  openPreferences: () => void;
  rejectNonEssential: () => void;
  saveOptionalPreferences: (preferences: OptionalConsentPreferences) => void;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const useConsent = () => {
  const context = useContext(ConsentContext);

  if (!context) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }

  return context;
};

interface ConsentProviderProps {
  children: ReactNode;
}

export const ConsentProvider: React.FC<ConsentProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(() =>
    loadConsentPreferences()
  );
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  useEffect(() => {
    applyConsentPreferences(preferences);
  }, [preferences]);

  const persistPreferences = useCallback(
    (nextPreferences: ConsentPreferences) => {
      const shouldReload = hasConsentWithdrawal(preferences, nextPreferences);

      saveConsentPreferences(nextPreferences);
      setPreferences(nextPreferences);
      setIsPreferencesOpen(false);

      if (shouldReload && typeof window !== "undefined") {
        window.location.reload();
      }
    },
    [preferences]
  );

  const acceptAll = useCallback(() => {
    persistPreferences(createAllAcceptedConsentPreferences());
  }, [persistPreferences]);

  const rejectNonEssential = useCallback(() => {
    persistPreferences(createAllRejectedConsentPreferences());
  }, [persistPreferences]);

  const saveOptionalPreferences = useCallback(
    (optionalPreferences: OptionalConsentPreferences) => {
      persistPreferences(createConsentPreferences(optionalPreferences));
    },
    [persistPreferences]
  );

  const value = useMemo(
    () => ({
      preferences,
      isPreferencesOpen,
      acceptAll,
      closePreferences: () => setIsPreferencesOpen(false),
      openPreferences: () => setIsPreferencesOpen(true),
      rejectNonEssential,
      saveOptionalPreferences,
    }),
    [acceptAll, isPreferencesOpen, preferences, rejectNonEssential, saveOptionalPreferences]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
};

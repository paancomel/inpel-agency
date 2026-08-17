/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "ms" | "en" | "ta" | "zh-CN";

const LANGUAGE_STORAGE_KEY = "inpel-language";
const supportedLanguages: readonly Language[] = ["ms", "en", "ta", "zh-CN"];

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

// Standalone route/component tests render slices without the app shell. Keep
// those slices usable in English while the mounted portal always provides the
// persisted Bahasa Melayu default through LanguageProvider.
const LanguageContext = createContext<LanguageContextValue>({ language: "en", setLanguage: () => undefined });

function readSavedLanguage(): Language {
  try {
    const value = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return supportedLanguages.includes(value as Language) ? value as Language : "ms";
  } catch {
    return "ms";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(readSavedLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // The current page remains usable if browser storage is unavailable.
    }
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

export function t(language: Language, copy: Partial<Record<Language | "zh-Hans", string>> & { ms: string }): string {
  return copy[language] ?? copy["zh-Hans"] ?? copy.ms;
}

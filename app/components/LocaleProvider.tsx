"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  applyLocale,
  getLocaleSnapshot,
  getServerLocaleSnapshot,
  subscribeLocale,
  translate,
  type Locale,
  type TranslationKey,
} from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: TranslationKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    getServerLocaleSnapshot,
  );

  useEffect(() => {
    document.documentElement.lang = locale === "km" ? "km" : "en";
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    applyLocale(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translate(locale, key),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useI18n(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useI18n must be used within LocaleProvider");
  }
  return ctx;
}

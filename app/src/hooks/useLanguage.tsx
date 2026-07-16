import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { isLanguage, translate } from "../i18n";
import type { CopyKey } from "../i18n";
import type { Language } from "../types";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: CopyKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLanguage(): Language {
  const requested = new URLSearchParams(window.location.search).get("lang");
  if (isLanguage(requested)) return requested;

  try {
    const saved = window.localStorage.getItem("timeline-language");
    if (isLanguage(saved)) return saved;
  } catch {
    // Storage can be unavailable in privacy-restricted contexts.
  }

  const browserLanguage = navigator.language.toLowerCase().split("-")[0];
  return isLanguage(browserLanguage) ? browserLanguage : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translate(language, "pageTitle");

    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) {
      description.content = translate(language, "metaDescription");
    }

    try {
      window.localStorage.setItem("timeline-language", language);
    } catch {
      // The language still works for the current session when storage is blocked.
    }

    const url = new URL(window.location.href);
    if (language === "en") url.searchParams.delete("lang");
    else url.searchParams.set("lang", language);
    try {
      window.history.replaceState(window.history.state, "", url);
    } catch {
      // Some embedded and local-file contexts do not permit History API updates.
    }
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    t: (key) => translate(language, key),
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider.");
  return context;
}

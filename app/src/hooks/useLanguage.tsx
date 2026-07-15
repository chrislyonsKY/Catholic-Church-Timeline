import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { translate } from "../i18n";
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
  if (requested === "en" || requested === "es") return requested;

  try {
    const saved = window.localStorage.getItem("timeline-language");
    if (saved === "en" || saved === "es") return saved;
  } catch {
    // Storage can be unavailable in privacy-restricted contexts.
  }

  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === "es"
      ? "Dos mil años de la Iglesia católica"
      : "Two Thousand Years of the Catholic Church";

    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) {
      description.content = language === "es"
        ? "Una cronología bilingüe y basada en fuentes de los apóstoles, los santos, los papas, los concilios y los momentos decisivos de la historia de la Iglesia católica."
        : "A bilingual, source-led chronology of the apostles, saints, popes, councils, and turning points in Catholic Church history.";
    }

    try {
      window.localStorage.setItem("timeline-language", language);
    } catch {
      // The language still works for the current session when storage is blocked.
    }

    const url = new URL(window.location.href);
    if (language === "es") url.searchParams.set("lang", "es");
    else url.searchParams.delete("lang");
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

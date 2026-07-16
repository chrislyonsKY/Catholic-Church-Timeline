import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type TextScale = "default" | "large" | "largest";

interface ReadingPreferences {
  textScale: TextScale;
  highContrast: boolean;
  reduceMotion: boolean;
}

interface AccessibilityContextValue extends ReadingPreferences {
  setTextScale: (scale: TextScale) => void;
  setHighContrast: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  reset: () => void;
}

const defaults: ReadingPreferences = {
  textScale: "default",
  highContrast: false,
  reduceMotion: false,
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function loadPreferences(): ReadingPreferences {
  try {
    const saved = JSON.parse(window.localStorage.getItem("timeline-reading-preferences") ?? "null") as Partial<ReadingPreferences> | null;
    if (saved) {
      return {
        textScale: saved.textScale === "large" || saved.textScale === "largest" ? saved.textScale : "default",
        highContrast: Boolean(saved.highContrast),
        reduceMotion: Boolean(saved.reduceMotion),
      };
    }
  } catch {
    // Invalid or unavailable storage falls back to system-aware defaults.
  }

  return {
    ...defaults,
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<ReadingPreferences>(loadPreferences);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.textScale = preferences.textScale;
    root.dataset.contrast = preferences.highContrast ? "high" : "standard";
    root.dataset.motion = preferences.reduceMotion ? "reduced" : "full";
    try {
      window.localStorage.setItem("timeline-reading-preferences", JSON.stringify(preferences));
    } catch {
      // The current session remains fully functional if storage is restricted.
    }
  }, [preferences]);

  const value = useMemo<AccessibilityContextValue>(() => ({
    ...preferences,
    setTextScale: (textScale) => setPreferences((current) => ({ ...current, textScale })),
    setHighContrast: (highContrast) => setPreferences((current) => ({ ...current, highContrast })),
    setReduceMotion: (reduceMotion) => setPreferences((current) => ({ ...current, reduceMotion })),
    reset: () => setPreferences({ ...defaults }),
  }), [preferences]);

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error("useAccessibility must be used within AccessibilityProvider.");
  return context;
}

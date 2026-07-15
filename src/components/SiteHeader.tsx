import { useRef, useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { translate } from "../i18n";
import type { Language } from "../types";

const navigation = [
  ["#chronology", "navChronology"],
  ["#timeline", "navTimeline"],
  ["#apostles", "navApostles"],
  ["#saints", "navSaints"],
  ["#sources", "navSources"],
] as const;

export function SiteHeader() {
  const { language, setLanguage, t } = useLanguage();
  const [announcement, setAnnouncement] = useState("");
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  function chooseLanguage(nextLanguage: Language) {
    if (nextLanguage === language) return;
    setLanguage(nextLanguage);
    setAnnouncement(translate(nextLanguage, "languageChanged"));
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a href="#top" className="wordmark" aria-label={t("homeLink")}>
          <span className="wordmark__mark" aria-hidden="true">✣</span>
          <span className="wordmark__name"><b>Historia</b><small>Ecclesiae</small></span>
        </a>

        <nav className="primary-nav" aria-label={t("primaryNavigation")}>
          {navigation.map(([href, key]) => (
            <a className="nav-link" href={href} key={href}>{t(key)}</a>
          ))}
        </nav>

        <div className="language-control" role="group" aria-label={t("language")}>
          {(["en", "es"] as const).map((item) => (
            <button
              type="button"
              key={item}
              lang={item}
              aria-pressed={language === item}
              onClick={() => chooseLanguage(item)}
            >
              {item === "en" ? t("english") : t("spanish")}
            </button>
          ))}
        </div>

        <details className="mobile-menu" ref={mobileMenuRef}>
          <summary>{t("menu")}</summary>
          <nav aria-label={t("mobileNavigation")}>
            {navigation.map(([href, key]) => (
              <a
                href={href}
                key={href}
                onClick={() => window.requestAnimationFrame(() => mobileMenuRef.current?.removeAttribute("open"))}
              >
                {t(key)}
              </a>
            ))}
          </nav>
        </details>

        <p className="sr-only" aria-live="polite">{announcement}</p>
      </div>
    </header>
  );
}

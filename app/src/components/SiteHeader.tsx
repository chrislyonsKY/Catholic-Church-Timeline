import { useRef, useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { languageOptions, translate } from "../i18n";
import type { Language } from "../types";
import { ReadingSettings } from "./ReadingSettings";

const navigation = [
  ["#chronology", "navChronology"],
  ["#liturgical-year", "navLiturgicalYear"],
  ["#atlas", "navAtlas"],
  ["#timeline", "navTimeline"],
  ["#traditions", "navBranches"],
  ["#apostles", "navApostles"],
  ["#saints", "navSaints"],
  ["#sources", "navSources"],
] as const;

export function SiteHeader({ onStartTour }: { onStartTour: () => void }) {
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

        <label className="language-control" data-code={language.toUpperCase()}>
          <span className="sr-only">{t("languageSelect")}</span>
          <select value={language} onChange={(event) => chooseLanguage(event.target.value as Language)} aria-label={t("languageSelect")}>
            {languageOptions.map((item) => <option value={item.code} lang={item.code} key={item.code}>{item.label}</option>)}
          </select>
        </label>

        <button className="tour-trigger" type="button" onClick={onStartTour}>{t("startTour")}</button>
        <ReadingSettings />

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
            <button type="button" onClick={() => {
              mobileMenuRef.current?.removeAttribute("open");
              onStartTour();
            }}>{t("startTour")}</button>
          </nav>
        </details>

        <p className="sr-only" aria-live="polite">{announcement}</p>
      </div>
    </header>
  );
}

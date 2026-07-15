import { eras, events } from "../data";
import { useLanguage } from "../hooks/useLanguage";
import { TemporalDial } from "./TemporalDial";

export function Hero() {
  const { t } = useLanguage();

  return (
    <>
      <section className="observatory-hero" aria-labelledby="hero-title">
        <aside className="observatory-hero__rail" aria-hidden="true">
          <span>VOL. I</span>
          <i />
          <span>AD 30—2026</span>
        </aside>

        <div className="hero-copy">
          <p className="section-kicker">{t("heroKicker")}</p>
          <h1 id="hero-title">
            {t("heroTitleLead")} <em>{t("heroTitleAccent")}</em>
          </h1>
          <p className="hero-deck">{t("heroDeck")}</p>
          <div className="hero-actions">
            <a className="button button--primary" href="#timeline">{t("exploreTimeline")}</a>
            <a className="button button--secondary" href="#apostles">{t("meetApostles")}</a>
          </div>
        </div>

        <TemporalDial />

        <dl className="observatory-stats">
          <div><dt>{events.length}</dt><dd>{t("plateEvents")}</dd></div>
          <div><dt>{eras.length}</dt><dd>{t("plateEras")}</dd></div>
          <div><dt>15</dt><dd>{t("plateApostles")}</dd></div>
          <div><dt>26</dt><dd>{t("plateSaints")}</dd></div>
        </dl>
      </section>

      <section className="manifesto" aria-labelledby="about-title">
        <div className="manifesto__index">
          <span>01</span>
          <p>{t("aboutKicker")}</p>
        </div>
        <div className="manifesto__statement">
          <h2 id="about-title">{t("aboutTitle")}</h2>
          <p>{t("aboutLead")}</p>
        </div>
        <div className="manifesto__notes">
          <p>{t("aboutBody")}</p>
          <aside>
            <span>{t("creditLabel")}</span>
            <p>{t("creditBody")}</p>
          </aside>
        </div>
      </section>
    </>
  );
}

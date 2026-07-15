import { eras, events } from "../data";
import { useLanguage } from "../hooks/useLanguage";
import { localize } from "../utils";

export function Hero() {
  const { language, t } = useLanguage();

  return (
    <>
      <section className="hero-shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="section-kicker">{t("heroKicker")}</p>
          <h1 id="hero-title">
            {t("heroTitleLead")} <em>{t("heroTitleAccent")}</em>
          </h1>
          <p className="hero-deck">{t("heroDeck")}</p>
          <div className="flex flex-wrap gap-3">
            <a className="button button--primary" href="#timeline">{t("exploreTimeline")}</a>
            <a className="button button--secondary" href="#apostles">{t("meetApostles")}</a>
          </div>
        </div>

        <figure className="chronology-plate" aria-label={t("plateLabel")}>
          <div className="chronology-plate__head">
            <span>{t("plateLabel")}</span>
            <strong>{t("plateSpan")}</strong>
          </div>
          <ol>
            {eras.map((era) => (
              <li key={era.id}>
                <span>{era.number}</span>
                <div>
                  <strong>{localize(era.title, language)}</strong>
                  <small>{localize(era.years, language)}</small>
                </div>
              </li>
            ))}
          </ol>
          <figcaption>
            <span>{t("creditLabel")}</span>
            <strong>Joe Bland · 2008</strong>
          </figcaption>
        </figure>
      </section>

      <section className="exhibition-intro" aria-labelledby="about-title">
        <div>
          <p className="section-kicker section-kicker--dark">{t("aboutKicker")}</p>
          <h2 id="about-title">{t("aboutTitle")}</h2>
        </div>
        <div className="exhibition-intro__copy">
          <p>{t("aboutLead")}</p>
          <p>{t("aboutBody")}</p>
          <dl className="exhibition-facts">
            <div><dt>{events.length}</dt><dd>{t("plateEvents")}</dd></div>
            <div><dt>15</dt><dd>{t("plateApostles")}</dd></div>
            <div><dt>26</dt><dd>{t("plateSaints")}</dd></div>
          </dl>
          <aside className="credit-note">
            <span>{t("creditLabel")}</span>
            <p>{t("creditBody")}</p>
          </aside>
        </div>
      </section>
    </>
  );
}

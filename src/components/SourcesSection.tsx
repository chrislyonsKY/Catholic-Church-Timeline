import { sourceRecords } from "../data";
import { useLanguage } from "../hooks/useLanguage";
import { localize } from "../utils";

export function SourcesSection() {
  const { language, t } = useLanguage();

  return (
    <section id="sources" className="sources-section section-shell" aria-labelledby="sources-title">
      <header className="section-heading section-heading--light">
        <div>
          <p className="section-kicker section-kicker--dark">{t("sourcesKicker")}</p>
          <h2 id="sources-title">{t("sourcesTitle")}</h2>
        </div>
        <p>{t("sourcesBody")}</p>
      </header>

      <div className="source-register">
        {sourceRecords.map((source) => (
          <a href={source.href} target="_blank" rel="noreferrer" key={source.number}>
            <span>{source.number}</span>
            <strong>{localize(source.title, language)}</strong>
            <small>{localize(source.note, language)}</small>
            <b aria-hidden="true">↗</b>
          </a>
        ))}
      </div>

      <div className="editorial-note">
        <span>JB / 2008</span>
        <p>{t("editorialNote")}</p>
      </div>
    </section>
  );
}

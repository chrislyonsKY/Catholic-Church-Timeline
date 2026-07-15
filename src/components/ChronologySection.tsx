import { categories, eras, events } from "../data";
import { useLanguage } from "../hooks/useLanguage";
import type { EraId } from "../types";
import { formatCount, localize } from "../utils";

export function ChronologySection({ onBrowseEra }: { onBrowseEra: (era: EraId) => void }) {
  const { language, t } = useLanguage();

  return (
    <section id="chronology" className="chronology section-shell" aria-labelledby="chronology-title">
      <header className="section-heading">
        <div>
          <p className="section-kicker">{t("chronologyKicker")}</p>
          <h2 id="chronology-title">{t("chronologyTitle")}</h2>
        </div>
        <p>{t("chronologyBody")}</p>
      </header>

      <ol className="era-list">
        {eras.map((era) => {
          const eraEvents = events.filter((event) => event.era === era.id);
          const leadingCategories = categories
            .map((category) => ({
              category,
              count: eraEvents.filter((event) => event.category === category.id).length,
            }))
            .filter((item) => item.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

          return (
            <li key={era.id} data-era={era.id}>
              <div className="era-list__number">{era.number}</div>
              <div className="era-list__copy">
                <span>{localize(era.years, language)} · {formatCount(eraEvents.length)} {t("records")}</span>
                <h3>{localize(era.title, language)}</h3>
                <p>{localize(era.thesis, language)}</p>
                <button type="button" onClick={() => onBrowseEra(era.id)}>{t("browseEra")} ↓</button>
              </div>
              <div className="era-list__register" aria-label={`${eraEvents.length} ${t("records")}`}>
                <strong>{formatCount(eraEvents.length)}</strong>
                <span>{t("records")}</span>
                <dl>
                  {leadingCategories.map(({ category, count }) => (
                    <div key={category.id}>
                      <dt>{localize(category.shortLabel, language)}</dt>
                      <dd>{formatCount(count)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

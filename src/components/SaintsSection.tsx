import { useMemo, useState } from "react";
import { saintPeriods, saints } from "../data";
import { useLanguage } from "../hooks/useLanguage";
import type { SaintPeriodId } from "../types";
import { formatCount, localize } from "../utils";

export function SaintsSection() {
  const { language, t } = useLanguage();
  const [period, setPeriod] = useState<"all" | SaintPeriodId>("all");
  const visibleSaints = useMemo(
    () => saints.filter((saint) => period === "all" || saint.period === period),
    [period],
  );

  return (
    <section id="saints" className="saints-section section-shell" aria-labelledby="saints-title">
      <header className="section-heading section-heading--light">
        <div>
          <p className="section-kicker section-kicker--dark">{t("saintsKicker")}</p>
          <h2 id="saints-title">{t("saintsTitle")}</h2>
        </div>
        <p>{t("saintsBody")}</p>
      </header>

      <div className="saint-periods" aria-label={t("saintsKicker")}>
        {saintPeriods.map((item) => {
          const count = item.id === "all" ? saints.length : saints.filter((saint) => saint.period === item.id).length;
          const active = period === item.id;
          return (
            <button
              type="button"
              key={item.id}
              className={active ? "is-active" : ""}
              aria-pressed={active}
              onClick={() => setPeriod(item.id)}
            >
              <span>{localize(item.label, language)}</span>
              <strong>{formatCount(count)}</strong>
            </button>
          );
        })}
      </div>

      <div className="saints-toolbar" aria-live="polite">
        <p><strong>{formatCount(visibleSaints.length)}</strong> {t("saintProfiles")}</p>
        <span>{t("datesNote")}</span>
      </div>

      <div className="saint-grid">
        {visibleSaints.map((saint, index) => (
          <article key={saint.id}>
            <header>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <time>{localize(saint.dates, language)}</time>
            </header>
            <h3>{localize(saint.name, language)}</h3>
            <p>{localize(saint.note, language)}</p>
            <small>{localize(saint.place, language)}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

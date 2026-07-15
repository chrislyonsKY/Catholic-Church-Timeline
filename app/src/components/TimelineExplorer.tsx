import { useMemo, useState } from "react";
import { categories, eras, events } from "../data";
import { useLanguage } from "../hooks/useLanguage";
import type { CategoryId, EraId, TimelineEvent } from "../types";
import { formatCount, localize, normalizeSearch } from "../utils";
import { EventDialog } from "./EventDialog";

type SortOrder = "chronological" | "recent" | "title";
type Layout = "timeline" | "index";

interface TimelineExplorerProps {
  era: "all" | EraId;
  onEraChange: (era: "all" | EraId) => void;
}

export function TimelineExplorer({ era, onEraChange }: TimelineExplorerProps) {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | CategoryId>("all");
  const [sort, setSort] = useState<SortOrder>("chronological");
  const [layout, setLayout] = useState<Layout>("timeline");
  const [selected, setSelected] = useState<TimelineEvent | null>(null);

  const visibleEvents = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim());
    const filtered = events.filter((event) => {
      const searchable = normalizeSearch([
        event.title.en,
        event.title.es,
        event.summary.en,
        event.summary.es,
        event.detail.en,
        event.detail.es,
        ...event.people.en,
        ...event.people.es,
      ].join(" "));

      return (
        (!normalizedQuery || searchable.includes(normalizedQuery))
        && (era === "all" || event.era === era)
        && (category === "all" || event.category === category)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sort === "recent") return b.year - a.year;
      if (sort === "title") return localize(a.title, language).localeCompare(localize(b.title, language), language);
      return a.year - b.year;
    });
  }, [category, era, language, query, sort]);

  function clearFilters() {
    setQuery("");
    setCategory("all");
    onEraChange("all");
    setSort("chronological");
  }

  return (
    <section id="timeline" className="archive-section section-shell" aria-labelledby="timeline-title">
      <header className="section-heading section-heading--light">
        <div>
          <p className="section-kicker section-kicker--dark">{t("timelineKicker")}</p>
          <h2 id="timeline-title">{t("timelineTitle")}</h2>
        </div>
        <p>{t("timelineBody")}</p>
      </header>

      <div className="archive-ruler" aria-label={t("eraLabel")}>
        {eras.map((item) => (
          <button
            type="button"
            data-era={item.id}
            className={era === item.id ? "is-active" : ""}
            aria-pressed={era === item.id}
            onClick={() => onEraChange(era === item.id ? "all" : item.id)}
            key={item.id}
          >
            <span>{item.number}</span>
            <strong>{localize(item.years, language)}</strong>
          </button>
        ))}
      </div>

      <div className="archive-controls" role="search" aria-label={t("timelineKicker")}>
        <label className="archive-search">
          <span>{t("searchLabel")}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
          />
        </label>
        <label>
          <span>{t("eraLabel")}</span>
          <select value={era} onChange={(event) => onEraChange(event.target.value as "all" | EraId)}>
            <option value="all">{t("allEras")}</option>
            {eras.map((item) => <option value={item.id} key={item.id}>{localize(item.title, language)}</option>)}
          </select>
        </label>
        <label>
          <span>{t("categoryLabel")}</span>
          <select value={category} onChange={(event) => setCategory(event.target.value as "all" | CategoryId)}>
            <option value="all">{t("allCategories")}</option>
            {categories.map((item) => <option value={item.id} key={item.id}>{localize(item.label, language)}</option>)}
          </select>
        </label>
        <label>
          <span>{t("sortLabel")}</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as SortOrder)}>
            <option value="chronological">{t("oldestFirst")}</option>
            <option value="recent">{t("newestFirst")}</option>
            <option value="title">{t("titleAZ")}</option>
          </select>
        </label>
      </div>

      <div className="archive-toolbar">
        <p aria-live="polite"><strong>{formatCount(visibleEvents.length)}</strong> {t("of")} {events.length} {t("records")}</p>
        <div className="layout-switch" aria-label={t("layoutLabel")}>
          <button type="button" className={layout === "timeline" ? "is-active" : ""} onClick={() => setLayout("timeline")} aria-pressed={layout === "timeline"}>{t("timelineLayout")}</button>
          <button type="button" className={layout === "index" ? "is-active" : ""} onClick={() => setLayout("index")} aria-pressed={layout === "index"}>{t("indexLayout")}</button>
        </div>
      </div>

      {visibleEvents.length > 0 ? (
        <ol className={layout === "timeline" ? "timeline-records" : "event-index"}>
          {visibleEvents.map((event) => {
            const eventCategory = categories.find((item) => item.id === event.category);
            return (
              <li key={event.id} data-category={event.category}>
                <button type="button" onClick={() => setSelected(event)} aria-label={`${t("readRecord")}: ${localize(event.title, language)}`}>
                  <span className="event-record__year">{localize(event.yearLabel, language)}</span>
                  <span className="event-record__body">
                    <span className="event-record__category">{eventCategory ? localize(eventCategory.label, language) : event.category}</span>
                    <strong>{localize(event.title, language)}</strong>
                    <span className="event-record__summary">{localize(event.summary, language)}</span>
                  </span>
                  <span className="event-record__action" aria-hidden="true">↗</span>
                </button>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="archive-empty">
          <h3>{t("emptyTitle")}</h3>
          <button type="button" onClick={clearFilters}>{t("clearFilters")}</button>
        </div>
      )}

      <EventDialog event={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

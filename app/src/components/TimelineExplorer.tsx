import { useEffect, useMemo, useState } from "react";
import { supportedLanguages } from "../i18n";
import { categories, eras, events } from "../data";
import { useLanguage } from "../hooks/useLanguage";
import type { CategoryId, EraId, TimelineEvent } from "../types";
import { formatCount, getCentury, localize, normalizeSearch } from "../utils";
import { CenturyScrubber } from "./CenturyScrubber";
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
  const [centuryStart, setCenturyStart] = useState(1);
  const [centuryEnd, setCenturyEnd] = useState(21);
  const [selected, setSelected] = useState<TimelineEvent | null>(() => {
    const eventId = new URLSearchParams(window.location.search).get("event");
    return events.find((event) => event.id === eventId) ?? null;
  });

  useEffect(() => {
    function syncSelectedFromUrl() {
      const eventId = new URLSearchParams(window.location.search).get("event");
      setSelected(events.find((event) => event.id === eventId) ?? null);
    }
    window.addEventListener("popstate", syncSelectedFromUrl);
    return () => window.removeEventListener("popstate", syncSelectedFromUrl);
  }, []);

  useEffect(() => {
    if (era === "all") return;
    const eraEvents = events.filter((event) => event.era === era);
    setCenturyStart(Math.min(...eraEvents.map((event) => getCentury(event.year))));
    setCenturyEnd(Math.max(...eraEvents.map((event) => getCentury(event.year))));
  }, [era]);

  const visibleEvents = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim());
    const filtered = events.filter((event) => {
      const searchable = normalizeSearch(supportedLanguages.flatMap((item) => [
        event.title[item], event.summary[item], event.detail[item], ...event.people[item],
      ]).join(" "));
      const century = getCentury(event.year);

      return (
        (!normalizedQuery || searchable.includes(normalizedQuery))
        && (era === "all" || event.era === era)
        && (category === "all" || event.category === category)
        && century >= centuryStart
        && century <= centuryEnd
      );
    });

    return [...filtered].sort((a, b) => {
      if (sort === "recent") return b.year - a.year;
      if (sort === "title") return localize(a.title, language).localeCompare(localize(b.title, language), language);
      return a.year - b.year;
    });
  }, [category, centuryEnd, centuryStart, era, language, query, sort]);

  function clearFilters() {
    setQuery("");
    setCategory("all");
    onEraChange("all");
    setSort("chronological");
    setCenturyStart(1);
    setCenturyEnd(21);
  }

  function openEvent(event: TimelineEvent) {
    const url = new URL(window.location.href);
    url.searchParams.set("event", event.id);
    window.history.pushState(window.history.state, "", url);
    setSelected(event);
  }

  function closeEvent() {
    const url = new URL(window.location.href);
    url.searchParams.delete("event");
    window.history.pushState(window.history.state, "", url);
    setSelected(null);
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

      <CenturyScrubber start={centuryStart} end={centuryEnd} onChange={(start, end) => {
        setCenturyStart(start);
        setCenturyEnd(end);
      }} />

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
                <button type="button" onClick={() => openEvent(event)} aria-label={`${t("readRecord")}: ${localize(event.title, language)}`}>
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

      <EventDialog event={selected} onClose={closeEvent} onSelect={openEvent} />
    </section>
  );
}

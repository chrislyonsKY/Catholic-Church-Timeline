import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { categories, eras, events } from "../data";
import { atlasTranslate } from "../data/livingAtlasCopy";
import { useLanguage } from "../hooks/useLanguage";
import type { CategoryId, TimelineEvent } from "../types";
import { localize } from "../utils";

const MIN_YEAR = 30;
const MAX_YEAR = 2026;
const landmarkYears = [30, 325, 1054, 1517, 1962, 2025] as const;
const snapshotCategories: CategoryId[] = ["popes", "councils", "documents", "saints", "turning-points"];
const eraRanges = [
  { id: "apostolic", start: 30, end: 312 },
  { id: "imperial", start: 313, end: 800 },
  { id: "medieval", start: 801, end: 1516 },
  { id: "reformation", start: 1517, end: 1788 },
  { id: "modern", start: 1789, end: 1957 },
  { id: "contemporary", start: 1958, end: 2026 },
] as const;

interface YearMachineProps {
  selectedYear: number;
  selectedEventId: string;
  reduceMotion: boolean;
  onYearChange: (year: number) => void;
  onFocusEvent: (event: TimelineEvent) => void;
  onOpenEvent: (event: TimelineEvent) => void;
}

export function YearMachine({
  selectedYear,
  selectedEventId,
  reduceMotion,
  onYearChange,
  onFocusEvent,
  onOpenEvent,
}: YearMachineProps) {
  const { language } = useLanguage();
  const a = (key: Parameters<typeof atlasTranslate>[1]) => atlasTranslate(language, key);
  const [playing, setPlaying] = useState(false);
  const [yearDraft, setYearDraft] = useState(String(selectedYear));
  const chronological = useMemo(() => [...events].sort((left, right) => left.year - right.year), []);
  const currentEraId = eraRanges.find((range) => selectedYear >= range.start && selectedYear <= range.end)?.id ?? "contemporary";
  const currentEra = eras.find((era) => era.id === currentEraId) ?? eras[0];

  const previous = [...chronological].reverse().find((event) => event.year < selectedYear) ?? null;
  const next = chronological.find((event) => event.year > selectedYear) ?? null;
  const snapshots = snapshotCategories.map((categoryId) => ({
    category: categories.find((category) => category.id === categoryId),
    event: [...chronological].reverse().find((event) => event.category === categoryId && event.year <= selectedYear) ?? null,
  }));
  const progress = ((selectedYear - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

  useEffect(() => {
    if (reduceMotion && playing) setPlaying(false);
  }, [playing, reduceMotion]);

  useEffect(() => setYearDraft(String(selectedYear)), [selectedYear]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      const nextEvent = chronological.find((event) => event.year > selectedYear);
      if (!nextEvent) {
        setPlaying(false);
        return;
      }
      onYearChange(nextEvent.year);
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [chronological, onYearChange, playing, selectedYear]);

  function updateYear(value: number) {
    const nextYear = Math.min(MAX_YEAR, Math.max(MIN_YEAR, Math.round(value)));
    onYearChange(nextYear);
  }

  function commitYearDraft() {
    const parsed = Number(yearDraft);
    if (Number.isFinite(parsed)) updateYear(parsed);
    else setYearDraft(String(selectedYear));
  }

  return (
    <section className="year-machine" data-era={currentEra.id} aria-labelledby="year-machine-title">
      <header className="year-machine__header">
        <div>
          <span className="atlas-eyebrow">01 · {a("yearMachine")}</span>
          <h3 id="year-machine-title">{a("yearMachineTitle")}</h3>
        </div>
        <div className="year-machine__era">
          <span>{localize(currentEra.years, language)}</span>
          <strong>{localize(currentEra.title, language)}</strong>
        </div>
      </header>

      <div className="year-machine__control">
        <label htmlFor="atlas-year-number">
          <span>{a("chooseYear")}</span>
          <input
            id="atlas-year-number"
            type="number"
            min={MIN_YEAR}
            max={MAX_YEAR}
            value={yearDraft}
            aria-label={a("yearField")}
            onChange={(event) => setYearDraft(event.target.value)}
            onBlur={commitYearDraft}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commitYearDraft();
                event.currentTarget.blur();
              }
            }}
          />
        </label>
        <input
          className="year-machine__range"
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={selectedYear}
          aria-label={a("chooseYear")}
          aria-valuetext={`${selectedYear} · ${localize(currentEra.title, language)}`}
          style={{ "--atlas-progress": `${progress}%` } as CSSProperties}
          onChange={(event) => updateYear(Number(event.target.value))}
        />
        <div className="year-machine__scale" aria-hidden="true"><span>30</span><span>500</span><span>1000</span><span>1500</span><span>2026</span></div>
      </div>

      <div className="year-machine__transport">
        <div className="year-machine__presets" aria-label={a("presets")}>
          <span>{a("presets")}</span>
          {landmarkYears.map((year) => (
            <button type="button" key={year} aria-pressed={selectedYear === year} onClick={() => updateYear(year)}>{year}</button>
          ))}
        </div>
        <button
          className="year-machine__play"
          type="button"
          disabled={reduceMotion}
          title={reduceMotion ? a("playUnavailable") : undefined}
          aria-pressed={playing}
          onClick={() => setPlaying((current) => !current)}
        >
          <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span> {playing ? a("pause") : a("play")}
        </button>
      </div>

      <div className="year-machine__neighbors">
        <button type="button" disabled={!previous} onClick={() => previous && onFocusEvent(previous)}>
          <span>← {a("previousMoment")}</span>
          <strong>{previous ? localize(previous.title, language) : "—"}</strong>
          <small>{previous ? localize(previous.yearLabel, language) : ""}</small>
        </button>
        <button type="button" disabled={!next} onClick={() => next && onFocusEvent(next)}>
          <span>{a("nextMoment")} →</span>
          <strong>{next ? localize(next.title, language) : "—"}</strong>
          <small>{next ? localize(next.yearLabel, language) : ""}</small>
        </button>
      </div>

      <div className="year-machine__snapshot">
        <header>
          <h4>{a("curatedSnapshot")}</h4>
          <p>{a("snapshotBody")}</p>
        </header>
        <div className="year-machine__snapshot-grid">
          {snapshots.map(({ category, event }) => (
            <article key={category?.id} data-category={category?.id} className={event?.id === selectedEventId ? "is-selected" : undefined}>
              <span>{category ? localize(category.shortLabel, language) : ""}</span>
              {event ? (
                <>
                  <button type="button" onClick={() => onFocusEvent(event)}>
                    <strong>{localize(event.title, language)}</strong>
                    <small>{localize(event.yearLabel, language)}</small>
                  </button>
                  <button className="year-machine__open" type="button" onClick={() => onOpenEvent(event)}>{a("openRecord")} ↗</button>
                </>
              ) : <p>{a("noPriorRecord")}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

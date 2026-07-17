import { useEffect, useMemo, useRef, useState } from "react";
import { events, saints } from "../data";
import {
  getArchiveConnections,
  getLectionaryReferences,
  getOfficialCalendarUrl,
  getOfficialSourcePage,
  getUsccbReadingsUrl,
  loadLiturgicalCalendar,
  officialCalendarYears,
} from "../data/liturgicalCalendar";
import type {
  LiturgicalCalendar,
  LiturgicalCelebration,
  OfficialCalendarYear,
} from "../data/liturgicalCalendar";
import { calendarLocales, liturgicalCopy, liturgicalLabels } from "../data/liturgicalCopy";
import { useLanguage } from "../hooks/useLanguage";
import { buildPageUrl, localize } from "../utils";

const firstOfficialYear = officialCalendarYears[0];
const lastOfficialYear = officialCalendarYears[officialCalendarYears.length - 1];
const firstOfficialDate = `${firstOfficialYear}-01-01`;
const lastOfficialDate = `${lastOfficialYear}-12-31`;

function localIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function utcDateFromIso(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function isoDateFromUtc(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function dateFromParts(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function calendarCells(year: number, month: number): string[] {
  const first = dateFromParts(year, month, 1);
  const start = dateFromParts(year, month, 1 - first.getUTCDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return isoDateFromUtc(date);
  });
}

function clampOfficialDate(date: string): string {
  if (date < firstOfficialDate) return firstOfficialDate;
  if (date > lastOfficialDate) return lastOfficialDate;
  return date;
}

function primaryCelebration(celebrations: LiturgicalCelebration[] | undefined): LiturgicalCelebration | null {
  return celebrations?.[0] ?? null;
}

function primarySeason(celebration: LiturgicalCelebration | null): string {
  return celebration?.seasons.at(-1) ?? "ORDINARY_TIME";
}

function primaryColor(celebration: LiturgicalCelebration | null): string {
  return celebration?.colors[0] ?? "GREEN";
}

export function LiturgicalCalendarSection() {
  const { language } = useLanguage();
  const copy = liturgicalCopy[language];
  const labels = liturgicalLabels[language];
  const locale = calendarLocales[language];
  const today = useMemo(() => localIsoDate(new Date()), []);
  const todayInRange = today >= firstOfficialDate && today <= lastOfficialDate;
  const initialDate = todayInRange ? today : firstOfficialDate;
  const initial = utcDateFromIso(initialDate);

  const [year, setYear] = useState<OfficialCalendarYear>(initial.getUTCFullYear() as OfficialCalendarYear);
  const [month, setMonth] = useState(initial.getUTCMonth());
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [ascensionOnSunday, setAscensionOnSunday] = useState(true);
  const [calendar, setCalendar] = useState<LiturgicalCalendar | null>(null);
  const [todayCalendar, setTodayCalendar] = useState<LiturgicalCalendar | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [retryCount, setRetryCount] = useState(0);
  const dayButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocus = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    loadLiturgicalCalendar(year, language, ascensionOnSunday).then((result) => {
      if (!active) return;
      setCalendar(result);
      setStatus("ready");
    }).catch(() => {
      if (!active) return;
      setCalendar(null);
      setStatus("error");
    });
    return () => { active = false; };
  }, [ascensionOnSunday, language, retryCount, year]);

  useEffect(() => {
    if (!todayInRange) return;
    let active = true;
    loadLiturgicalCalendar(Number(today.slice(0, 4)) as OfficialCalendarYear, language, ascensionOnSunday)
      .then((result) => { if (active) setTodayCalendar(result); })
      .catch(() => { if (active) setTodayCalendar(null); });
    return () => { active = false; };
  }, [ascensionOnSunday, language, today, todayInRange]);

  useEffect(() => {
    const date = pendingFocus.current;
    if (!date) return;
    pendingFocus.current = null;
    window.requestAnimationFrame(() => dayButtonRefs.current.get(date)?.focus());
  }, [calendar, month, selectedDate, year]);

  const monthDays = useMemo(() => calendarCells(year, month), [month, year]);
  const selectedCelebrations = calendar?.[selectedDate] ?? [];
  const selectedPrimary = primaryCelebration(selectedCelebrations);
  const todayCelebrations = todayInRange
    ? (Number(today.slice(0, 4)) === year ? calendar?.[today] : todayCalendar?.[today]) ?? []
    : [];
  const todayPrimary = primaryCelebration(todayCelebrations);
  const lectionaryReferences = getLectionaryReferences(selectedDate);

  const relatedRecords = getArchiveConnections(selectedCelebrations).flatMap((connection) => {
    if (connection.kind === "event") {
      const event = events.find((item) => item.id === connection.id);
      return event ? [{
        key: `event:${event.id}`,
        kind: copy.timelineRecord,
        label: localize(event.title, language),
        href: buildPageUrl({ event: event.id }, "#timeline"),
      }] : [];
    }
    const saint = saints.find((item) => item.id === connection.id);
    return saint ? [{
      key: `saint:${saint.id}`,
      kind: copy.saintProfile,
      label: localize(saint.name, language),
      href: buildPageUrl({ event: null }, `#saint-${saint.id}`),
    }] : [];
  });

  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale, {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  }), [locale]);
  const monthFormatter = useMemo(() => new Intl.DateTimeFormat(locale, {
    month: "long", year: "numeric", timeZone: "UTC",
  }), [locale]);
  const monthNameFormatter = useMemo(() => new Intl.DateTimeFormat(locale, {
    month: "long", timeZone: "UTC",
  }), [locale]);
  const weekdayFormatter = useMemo(() => new Intl.DateTimeFormat(locale, {
    weekday: "short", timeZone: "UTC",
  }), [locale]);

  const weekdayNames = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = dateFromParts(2024, 0, 7 + index);
    return weekdayFormatter.format(date);
  }), [weekdayFormatter]);

  const monthNames = useMemo(() => Array.from({ length: 12 }, (_, index) => (
    monthNameFormatter.format(dateFromParts(2026, index, 1))
  )), [monthNameFormatter]);

  function formatDate(date: string): string {
    return dateFormatter.format(utcDateFromIso(date));
  }

  function calendarLabel(date: string, celebration: LiturgicalCelebration | null): string {
    if (!celebration) return formatDate(date);
    const rank = labels.ranks[celebration.rank] ?? celebration.rank;
    const colors = celebration.colors.map((color) => labels.colors[color] ?? color).join(", ");
    const seasons = celebration.seasons.map((season) => labels.seasons[season] ?? season).join(", ");
    return `${formatDate(date)} — ${celebration.name}. ${rank}. ${colors}. ${seasons}.`;
  }

  function selectDate(date: string, focus = false) {
    const nextDate = clampOfficialDate(date);
    const parsed = utcDateFromIso(nextDate);
    const nextYear = parsed.getUTCFullYear() as OfficialCalendarYear;
    const nextMonth = parsed.getUTCMonth();
    setYear(nextYear);
    setMonth(nextMonth);
    setSelectedDate(nextDate);
    if (focus) {
      if (nextDate === selectedDate && nextYear === year && nextMonth === month) {
        window.requestAnimationFrame(() => dayButtonRefs.current.get(nextDate)?.focus());
      } else {
        pendingFocus.current = nextDate;
      }
    }
  }

  function changeMonth(nextYear: number, nextMonth: number, focus = false) {
    const normalized = dateFromParts(nextYear, nextMonth, 1);
    const normalizedYear = Math.min(lastOfficialYear, Math.max(firstOfficialYear, normalized.getUTCFullYear())) as OfficialCalendarYear;
    const normalizedMonth = normalizedYear === firstOfficialYear && normalized.getUTCFullYear() < firstOfficialYear
      ? 0
      : normalizedYear === lastOfficialYear && normalized.getUTCFullYear() > lastOfficialYear
        ? 11
        : normalized.getUTCMonth();
    const selectedDay = utcDateFromIso(selectedDate).getUTCDate();
    const nextDay = Math.min(selectedDay, daysInMonth(normalizedYear, normalizedMonth));
    selectDate(isoDateFromUtc(dateFromParts(normalizedYear, normalizedMonth, nextDay)), focus);
  }

  function shiftMonth(amount: number) {
    changeMonth(year, month + amount, true);
  }

  function moveByDays(date: string, amount: number) {
    const next = utcDateFromIso(date);
    next.setUTCDate(next.getUTCDate() + amount);
    selectDate(isoDateFromUtc(next), true);
  }

  function handleDayKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, date: string) {
    const parsed = utcDateFromIso(date);
    const moves: Partial<Record<string, number>> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -parsed.getUTCDay(),
      End: 6 - parsed.getUTCDay(),
    };
    const move = moves[event.key];
    if (typeof move === "number") {
      event.preventDefault();
      moveByDays(date, move);
      return;
    }
    if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      changeMonth(parsed.getUTCFullYear(), parsed.getUTCMonth() + (event.key === "PageUp" ? -1 : 1), true);
    }
  }

  const selectedColor = primaryColor(selectedPrimary);
  const selectedSeason = primarySeason(selectedPrimary);
  const canMovePrevious = !(year === firstOfficialYear && month === 0);
  const canMoveNext = !(year === lastOfficialYear && month === 11);

  return (
    <section
      id="liturgical-year"
      className="liturgical-year-section section-shell"
      aria-labelledby="liturgical-year-title"
      data-calendar-engine="romcal-3.0.0-dev.125"
      data-calendar-scope="roman-rite-1969-us"
    >
      <header className="section-heading">
        <div>
          <p className="section-kicker">{copy.sectionKicker}</p>
          <h2 id="liturgical-year-title">{copy.sectionTitle}</h2>
        </div>
        <p>{copy.sectionBody}</p>
      </header>

      <div className="liturgical-introduction">
        <article
          className="liturgical-today"
          data-color={primaryColor(todayPrimary)}
          data-season={primarySeason(todayPrimary)}
          aria-labelledby="liturgical-today-title"
        >
          <header>
            <p>{copy.today}</p>
            {todayInRange && <time dateTime={today}>{formatDate(today)}</time>}
          </header>
          <h3 id="liturgical-today-title">{todayPrimary?.name ?? copy.loading}</h3>
          {todayPrimary && (
            <p className="liturgical-today__meta">
              {labels.ranks[todayPrimary.rank]} · {labels.seasons[primarySeason(todayPrimary)]} · {todayPrimary.colors.map((color) => labels.colors[color]).join(" / ")}
            </p>
          )}
          {todayInRange && (
            <button type="button" onClick={() => selectDate(today, true)}>{copy.viewToday} <span aria-hidden="true">↓</span></button>
          )}
        </article>

        <aside className="liturgical-scope" aria-labelledby="liturgical-scope-title">
          <p className="liturgical-scope__label">{copy.scopeLabel}</p>
          <h3 id="liturgical-scope-title">{copy.scopeTitle}</h3>
          <p>{copy.scopeBody}</p>
          <a href={getOfficialSourcePage()} target="_blank" rel="noreferrer">{copy.editionLabel} <span aria-hidden="true">↗</span></a>
          <div className="liturgical-season-legend" aria-label={copy.season}>
            {Object.entries(labels.seasons).map(([season, label]) => (
              <span data-season={season} key={season}><i aria-hidden="true" />{label}</span>
            ))}
          </div>
        </aside>
      </div>

      {status === "error" ? (
        <div className="liturgical-error" role="status">
          <p className="section-kicker">{copy.errorTitle}</p>
          <p>{copy.errorBody}</p>
          <button type="button" onClick={() => setRetryCount((count) => count + 1)}>{copy.retry}</button>
        </div>
      ) : (
        <div className={`liturgical-workspace${status === "loading" ? " is-loading" : ""}`} aria-busy={status === "loading"}>
          <div className="liturgical-month-panel">
            <header className="liturgical-month-toolbar">
              <div>
                <p className="section-kicker">{copy.calendarTitle}</p>
                <h3>{monthFormatter.format(dateFromParts(year, month, 1))}</h3>
              </div>
              <div className="liturgical-month-toolbar__buttons">
                <button type="button" onClick={() => shiftMonth(-1)} disabled={!canMovePrevious} aria-label={copy.previousMonth}>←</button>
                <button type="button" onClick={() => shiftMonth(1)} disabled={!canMoveNext} aria-label={copy.nextMonth}>→</button>
              </div>
            </header>

            <div className="liturgical-navigation">
              <label>
                <span>{copy.monthLabel}</span>
                <select value={month} onChange={(event) => changeMonth(year, Number(event.target.value))}>
                  {monthNames.map((name, index) => <option value={index} key={name}>{name}</option>)}
                </select>
              </label>
              <label>
                <span>{copy.yearLabel}</span>
                <select value={year} onChange={(event) => changeMonth(Number(event.target.value), month)}>
                  {officialCalendarYears.map((item) => <option value={item} key={item}>{item}</option>)}
                </select>
              </label>
              <button type="button" onClick={() => selectDate(todayInRange ? today : firstOfficialDate, true)}>{copy.returnToday}</button>
            </div>

            <label className="liturgical-jurisdiction">
              <span>{copy.ascensionLabel}</span>
              <select value={ascensionOnSunday ? "sunday" : "thursday"} onChange={(event) => setAscensionOnSunday(event.target.value === "sunday")}>
                <option value="sunday">{copy.ascensionSunday}</option>
                <option value="thursday">{copy.ascensionThursday}</option>
              </select>
              <small>{ascensionOnSunday ? copy.ascensionSundayNote : copy.ascensionThursdayNote}</small>
            </label>

            <div className="liturgical-calendar" role="grid" aria-label={`${copy.calendarTitle}: ${monthFormatter.format(dateFromParts(year, month, 1))}`}>
              <div className="liturgical-weekdays" role="row">
                {weekdayNames.map((name, index) => <span role="columnheader" key={`${name}-${index}`}>{name}</span>)}
              </div>
              <div className="liturgical-days">
                {monthDays.map((date) => {
                  const parsed = utcDateFromIso(date);
                  const dateYear = parsed.getUTCFullYear();
                  const inOfficialRange = date >= firstOfficialDate && date <= lastOfficialDate;
                  const celebration = dateYear === year ? primaryCelebration(calendar?.[date]) : null;
                  const inMonth = parsed.getUTCMonth() === month;
                  const isSelected = date === selectedDate;
                  const isToday = date === today;
                  return (
                    <div role="gridcell" key={date}>
                      <button
                        ref={(node) => {
                          if (node) dayButtonRefs.current.set(date, node);
                          else dayButtonRefs.current.delete(date);
                        }}
                        type="button"
                        className={`${inMonth ? "" : "is-outside"}${isSelected ? " is-selected" : ""}${isToday ? " is-today" : ""}`}
                        data-season={primarySeason(celebration)}
                        data-color={primaryColor(celebration)}
                        aria-label={calendarLabel(date, celebration)}
                        aria-selected={isSelected}
                        tabIndex={isSelected ? 0 : -1}
                        disabled={!inOfficialRange}
                        onClick={() => selectDate(date)}
                        onKeyDown={(event) => handleDayKeyDown(event, date)}
                      >
                        <span className="liturgical-day__number">{parsed.getUTCDate()}</span>
                        <span className="liturgical-day__name">{celebration?.name ?? ""}</span>
                        {celebration && <span className="liturgical-day__rank">{labels.ranks[celebration.rank]}</span>}
                        {isToday && <span className="sr-only">{copy.today}</span>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <aside
            className="liturgical-detail"
            data-color={selectedColor}
            data-season={selectedSeason}
            aria-labelledby="liturgical-detail-title"
            aria-live="polite"
          >
            {selectedPrimary ? (
              <>
                <header>
                  <p>{copy.dayDetails}</p>
                  <time dateTime={selectedDate}>{formatDate(selectedDate)}</time>
                  <h3 id="liturgical-detail-title">{selectedPrimary.name}</h3>
                  {selectedPrimary.isHolyDayOfObligation && <span className="liturgical-holyday">{copy.holyDay}</span>}
                </header>

                <dl className="liturgical-metadata">
                  <div><dt>{copy.rank}</dt><dd>{labels.ranks[selectedPrimary.rank]}</dd></div>
                  <div><dt>{copy.season}</dt><dd>{selectedPrimary.seasons.map((season) => labels.seasons[season]).join(" · ")}</dd></div>
                  <div><dt>{copy.color}</dt><dd>{selectedPrimary.colors.map((color) => labels.colors[color]).join(" · ")}</dd></div>
                  <div><dt>{copy.sundayCycle}</dt><dd>{labels.sundayCycles[selectedPrimary.cycles.sundayCycle]}</dd></div>
                  <div><dt>{copy.weekdayCycle}</dt><dd>{labels.weekdayCycles[selectedPrimary.cycles.weekdayCycle]}</dd></div>
                  <div><dt>{copy.psalterWeek}</dt><dd>{labels.psalterWeeks[selectedPrimary.cycles.psalterWeek]}</dd></div>
                  <div className="liturgical-metadata__lectionary"><dt>{copy.lectionary}</dt><dd>{lectionaryReferences.join(" · ")}</dd></div>
                </dl>

                {selectedCelebrations.length > 1 && (
                  <div className="liturgical-options">
                    <h4>{copy.optionalCelebrations}</h4>
                    <ul>
                      {selectedCelebrations.slice(1).map((celebration) => (
                        <li key={celebration.id}>
                          <span data-color={primaryColor(celebration)} aria-hidden="true" />
                          <div><strong>{celebration.name}</strong><small>{labels.ranks[celebration.rank]} · {celebration.colors.map((color) => labels.colors[color]).join(" / ")}</small></div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="liturgical-actions">
                  <a href={getUsccbReadingsUrl(selectedDate)} target="_blank" rel="noreferrer">{copy.officialReadings} <span aria-hidden="true">↗</span></a>
                  <a href={getOfficialCalendarUrl(year)} target="_blank" rel="noreferrer">{copy.annualCalendar} <span aria-hidden="true">↗</span></a>
                </div>

                {relatedRecords.length > 0 && (
                  <div className="liturgical-related">
                    <h4>{copy.relatedArchive}</h4>
                    <ul>
                      {relatedRecords.map((record) => (
                        <li key={record.key}><a href={record.href}><span>{record.kind}</span><strong>{record.label}</strong><i aria-hidden="true">→</i></a></li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="liturgical-source-note">{copy.sourcesNote}</p>
              </>
            ) : (
              <p className="liturgical-detail__loading">{copy.loading}</p>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}

export default LiturgicalCalendarSection;

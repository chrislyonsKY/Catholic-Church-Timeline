import { useEffect, useMemo, useRef, useState } from "react";
import { categories, eras, events } from "../data";
import { useLanguage } from "../hooks/useLanguage";
import type { TimelineEvent } from "../types";
import { buildPageUrl, copyText, getCentury, localize } from "../utils";

interface EventDialogProps {
  event: TimelineEvent | null;
  onClose: () => void;
  onSelect: (event: TimelineEvent) => void;
}

export function EventDialog({ event, onClose, onSelect }: EventDialogProps) {
  const { language, t } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const context = useMemo(() => {
    if (!event) return null;
    const chronological = [...events].sort((a, b) => a.year - b.year);
    const index = chronological.findIndex((item) => item.id === event.id);
    const people = new Set(event.people.en);
    const related = events
      .filter((candidate) => candidate.id !== event.id)
      .map((candidate) => {
        const sharedPeople = candidate.people.en.filter((person) => people.has(person)).length;
        const score = sharedPeople * 5
          + (candidate.category === event.category ? 2 : 0)
          + (candidate.era === event.era ? 1 : 0)
          + (Math.abs(candidate.year - event.year) <= 100 ? 1 : 0);
        return { candidate, score };
      })
      .filter(({ score }) => score > 1)
      .sort((a, b) => b.score - a.score || Math.abs(a.candidate.year - event.year) - Math.abs(b.candidate.year - event.year))
      .slice(0, 4)
      .map(({ candidate }) => candidate);

    return {
      previous: index > 0 ? chronological[index - 1] : null,
      next: index < chronological.length - 1 ? chronological[index + 1] : null,
      related,
      era: eras.find((item) => item.id === event.era),
    };
  }, [event]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !event) return;
    setCopyState("idle");
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("dialog-open");

    return () => {
      document.body.classList.remove("dialog-open");
    };
  }, [event]);

  if (!event || !context) return null;

  const category = categories.find((item) => item.id === event.category);

  async function copyLink() {
    if (!event) return;
    const copied = await copyText(buildPageUrl({ event: event.id }));
    setCopyState(copied ? "copied" : "failed");
  }

  return (
    <dialog
      className="event-dialog"
      ref={dialogRef}
      onClose={onClose}
      onCancel={(cancelEvent) => {
        cancelEvent.preventDefault();
        dialogRef.current?.close();
      }}
      onMouseDown={(mouseEvent) => {
        if (mouseEvent.target === mouseEvent.currentTarget) dialogRef.current?.close();
      }}
      aria-labelledby="event-dialog-title"
      aria-describedby="event-dialog-summary"
    >
      <article className="event-dialog__panel" data-category={event.category}>
        <header>
          <div>
            <span>{localize(event.yearLabel, language)}</span>
            <span>{category ? localize(category.label, language) : event.category}</span>
            <span>{t("centuryShort")}{getCentury(event.year)}</span>
          </div>
          <button type="button" onClick={() => dialogRef.current?.close()} autoFocus aria-label={t("dialogClose")}>
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="event-dialog__body">
          <h2 id="event-dialog-title">{localize(event.title, language)}</h2>
          <p id="event-dialog-summary" className="event-dialog__summary">{localize(event.summary, language)}</p>

          <div className="event-dialog__actions">
            <button type="button" onClick={copyLink}>
              {copyState === "copied" ? t("linkCopied") : copyState === "failed" ? t("linkCopyFailed") : t("copyLink")}
            </button>
            {event.source && (
              <a href={event.source} target="_blank" rel="noreferrer">{t("primaryReference")} <span aria-hidden="true">↗</span></a>
            )}
          </div>

          <section className="event-dialog__prose" aria-labelledby="event-context-title">
            <h3 id="event-context-title">{t("historicalContext")}</h3>
            <p>{localize(event.detail, language)}</p>
          </section>

          {context.era && (
            <section className="event-dialog__era" data-era={context.era.id} aria-labelledby="event-era-title">
              <span>{context.era.number} · {localize(context.era.years, language)}</span>
              <h3 id="event-era-title">{t("longView")}: {localize(context.era.title, language)}</h3>
              <p>{localize(context.era.thesis, language)}</p>
            </section>
          )}

          {event.people[language].length > 0 && (
            <section className="event-dialog__people" aria-labelledby="event-people-title">
              <h3 id="event-people-title">{t("peopleLabel")}</h3>
              <ul>
                {event.people[language].map((person) => <li key={person}>{person}</li>)}
              </ul>
            </section>
          )}

          <section className="event-dialog__neighbors" aria-labelledby="event-neighbors-title">
            <h3 id="event-neighbors-title">{t("chronologyNeighbors")}</h3>
            <div>
              {context.previous && (
                <button type="button" onClick={() => onSelect(context.previous!)}>
                  <span>← {t("previousRecord")}</span>
                  <strong>{localize(context.previous.title, language)}</strong>
                  <small>{localize(context.previous.yearLabel, language)}</small>
                </button>
              )}
              {context.next && (
                <button type="button" onClick={() => onSelect(context.next!)}>
                  <span>{t("nextRecord")} →</span>
                  <strong>{localize(context.next.title, language)}</strong>
                  <small>{localize(context.next.yearLabel, language)}</small>
                </button>
              )}
            </div>
          </section>

          {context.related.length > 0 && (
            <section className="event-dialog__related" aria-labelledby="event-related-title">
              <h3 id="event-related-title">{t("relatedRecords")}</h3>
              <ul>
                {context.related.map((related) => (
                  <li key={related.id}>
                    <button type="button" onClick={() => onSelect(related)}>
                      <span>{localize(related.yearLabel, language)}</span>
                      <strong>{localize(related.title, language)}</strong>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>
    </dialog>
  );
}

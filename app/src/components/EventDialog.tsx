import { useEffect, useRef } from "react";
import { categories } from "../data";
import { useLanguage } from "../hooks/useLanguage";
import type { TimelineEvent } from "../types";
import { localize } from "../utils";

interface EventDialogProps {
  event: TimelineEvent | null;
  onClose: () => void;
}

export function EventDialog({ event, onClose }: EventDialogProps) {
  const { language, t } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !event) return;

    if (!dialog.open) dialog.showModal();
    document.body.classList.add("dialog-open");

    return () => {
      document.body.classList.remove("dialog-open");
      if (dialog.open) dialog.close();
    };
  }, [event]);

  if (!event) return null;

  const category = categories.find((item) => item.id === event.category);

  return (
    <dialog
      className="event-dialog"
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
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
          </div>
          <button type="button" onClick={() => dialogRef.current?.close()} autoFocus aria-label={t("dialogClose")}>
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="event-dialog__body">
          <h2 id="event-dialog-title">{localize(event.title, language)}</h2>
          <p id="event-dialog-summary" className="event-dialog__summary">{localize(event.summary, language)}</p>
          <div className="event-dialog__rule" />
          <p className="event-dialog__detail">{localize(event.detail, language)}</p>

          {event.people[language].length > 0 && (
            <section className="event-dialog__people" aria-labelledby="event-people-title">
              <h3 id="event-people-title">{t("peopleLabel")}</h3>
              <ul>
                {event.people[language].map((person) => <li key={person}>{person}</li>)}
              </ul>
            </section>
          )}

          {event.source && (
            <a className="primary-link primary-link--dark" href={event.source} target="_blank" rel="noreferrer">
              {t("primaryReference")} <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </article>
    </dialog>
  );
}

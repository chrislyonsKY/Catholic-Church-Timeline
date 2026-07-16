import { useEffect, useMemo, useRef, useState } from "react";
import OpenSeadragon from "openseadragon";
import { events } from "../data";
import { sourceObjects } from "../data/livingAtlas";
import { atlasTranslate } from "../data/livingAtlasCopy";
import { useLanguage } from "../hooks/useLanguage";
import type { TimelineEvent } from "../types";
import { localize } from "../utils";

interface SourceReadingRoomProps {
  selectedYear: number;
  selectedSourceId: string;
  onSelectSource: (sourceId: string) => void;
  onFocusEvent: (event: TimelineEvent) => void;
  onOpenEvent: (event: TimelineEvent) => void;
}

export function SourceReadingRoom({
  selectedYear,
  selectedSourceId,
  onSelectSource,
  onFocusEvent,
  onOpenEvent,
}: SourceReadingRoomProps) {
  const { language } = useLanguage();
  const a = (key: Parameters<typeof atlasTranslate>[1]) => atlasTranslate(language, key);
  const viewerElementRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);
  const [viewerState, setViewerState] = useState<"loading" | "ready" | "failed">("loading");
  const availableObjects = useMemo(() => sourceObjects.filter((source) => source.startYear <= selectedYear), [selectedYear]);
  const selectedObject = availableObjects.find((source) => source.id === selectedSourceId) ?? availableObjects.at(-1) ?? null;

  useEffect(() => {
    if (selectedObject && selectedObject.id !== selectedSourceId) onSelectSource(selectedObject.id);
  }, [onSelectSource, selectedObject, selectedSourceId]);

  useEffect(() => {
    const element = viewerElementRef.current;
    if (!element || !selectedObject) return;
    setViewerState("loading");
    const viewer = OpenSeadragon({
      element,
      tileSources: `${selectedObject.imageService}/info.json`,
      showNavigationControl: false,
      showNavigator: true,
      navigatorPosition: "BOTTOM_RIGHT",
      navigatorSizeRatio: 0.16,
      animationTime: 0.8,
      blendTime: 0.15,
      visibilityRatio: 0.5,
      constrainDuringPan: true,
      crossOriginPolicy: "Anonymous",
    });
    viewerRef.current = viewer;
    viewer.addHandler("open", () => setViewerState("ready"));
    viewer.addHandler("open-failed", () => setViewerState("failed"));
    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [selectedObject]);

  function zoomBy(factor: number) {
    const viewport = viewerRef.current?.viewport;
    if (!viewport) return;
    viewport.zoomBy(factor);
    viewport.applyConstraints();
  }

  return (
    <section className="reading-room" id="reading-room" data-reading-room-build="20260716" aria-labelledby="reading-room-title">
      <header className="atlas-panel-heading">
        <span className="atlas-eyebrow">04 · {a("readingKicker")}</span>
        <h3 id="reading-room-title">{a("readingTitle")}</h3>
        <p>{a("readingBody")}</p>
      </header>

      {selectedObject ? (
        <div className="reading-room__layout">
          <aside className="reading-room__shelf" aria-labelledby="reading-room-shelf-title">
            <header>
              <span id="reading-room-shelf-title">{a("chooseObject")}</span>
              <strong>{availableObjects.length}</strong>
              <small>{a("sourceAvailable")}</small>
            </header>
            <ol>
              {availableObjects.map((source, index) => (
                <li key={source.id}>
                  <button type="button" aria-pressed={source.id === selectedObject.id} onClick={() => onSelectSource(source.id)}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{localize(source.title, language)}</strong>
                    <small>{localize(source.dateLabel, language)}</small>
                  </button>
                </li>
              ))}
            </ol>
          </aside>

          <div className="reading-room__viewer-column">
            <div className="reading-room__viewer-shell">
              <div
                ref={viewerElementRef}
                className="reading-room__viewer"
                role="img"
                aria-label={`${localize(selectedObject.title, language)} · ${localize(selectedObject.canvasLabel, language)}`}
              />
              {viewerState !== "ready" && (
                <div className={`reading-room__viewer-status is-${viewerState}`} role="status">
                  {viewerState === "loading" && <span className="atlas-loader" aria-hidden="true" />}
                  <p>{viewerState === "failed" ? a("viewerFailed") : a("viewerLoading")}</p>
                </div>
              )}
              <div className="reading-room__zoom" aria-label={a("selectedImage")}>
                <button type="button" onClick={() => zoomBy(1.5)} aria-label={a("zoomIn")}>+</button>
                <button type="button" onClick={() => zoomBy(1 / 1.5)} aria-label={a("zoomOut")}>−</button>
                <button type="button" onClick={() => viewerRef.current?.viewport.goHome()} aria-label={a("resetView")}>⌂</button>
              </div>
              <p className="reading-room__canvas-label">{localize(selectedObject.canvasLabel, language)}</p>
            </div>

            <article className="reading-room__object">
              <span>{localize(selectedObject.dateLabel, language)}</span>
              <h4>{localize(selectedObject.title, language)}</h4>
              <p className="reading-room__repository">{localize(selectedObject.repository, language)}</p>
              <p>{localize(selectedObject.description, language)}</p>
              <div className="reading-room__relationship">
                <strong>{a("contextualRelationship")}</strong>
                <p>{localize(selectedObject.relationshipNote, language)}</p>
              </div>
              <div className="reading-room__links">
                <a href={selectedObject.manifestUrl} target="_blank" rel="noreferrer">{a("manifest")} ↗</a>
                <a href={selectedObject.objectUrl} target="_blank" rel="noreferrer">{a("repositoryRecord")} ↗</a>
              </div>
              <dl>
                <div><dt>{a("rights")}</dt><dd>{selectedObject.rights}</dd></div>
                <div><dt>{a("selectedImage")}</dt><dd>{localize(selectedObject.canvasLabel, language)}</dd></div>
              </dl>

              <div className="reading-room__events">
                <strong>{a("connectedMoments")}</strong>
                <ul>
                  {selectedObject.relatedEventIds.map((eventId) => events.find((event) => event.id === eventId)).filter((event): event is TimelineEvent => Boolean(event)).map((event) => (
                    <li key={event.id}>
                      <button type="button" onClick={() => onFocusEvent(event)}>
                        <span>{localize(event.yearLabel, language)}</span>
                        <strong>{localize(event.title, language)}</strong>
                      </button>
                      <button type="button" onClick={() => onOpenEvent(event)} aria-label={`${a("openRecord")}: ${localize(event.title, language)}`}>↗</button>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        </div>
      ) : (
        <div className="reading-room__unavailable">
          <span aria-hidden="true">◌</span>
          <p>{a("sourceUnavailable")}</p>
        </div>
      )}
    </section>
  );
}

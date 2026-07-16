import { lazy, Suspense, useMemo, useState } from "react";
import { events } from "../data";
import { buildKnowledgeGraph } from "../data/knowledgeGraph";
import { atlasPlaces, sourceObjects, sourcesForEvent } from "../data/livingAtlas";
import { atlasTranslate } from "../data/livingAtlasCopy";
import { useAccessibility } from "../hooks/useAccessibility";
import { useLanguage } from "../hooks/useLanguage";
import type { TimelineEvent } from "../types";
import { localize } from "../utils";
import { EventDialog } from "./EventDialog";
import { KnowledgeConstellation } from "./KnowledgeConstellation";
import { YearMachine } from "./YearMachine";

const EcclesialMap = lazy(() => import("./EcclesialMap"));
const SourceReadingRoom = lazy(() => import("./SourceReadingRoom").then((module) => ({ default: module.SourceReadingRoom })));

const chronological = [...events].sort((left, right) => left.year - right.year);

export function LivingAtlasSection() {
  const { language } = useLanguage();
  const { reduceMotion } = useAccessibility();
  const a = (key: Parameters<typeof atlasTranslate>[1]) => atlasTranslate(language, key);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedEventId, setSelectedEventId] = useState("leo-fourteen");
  const [selectedSourceId, setSelectedSourceId] = useState("menologion-basil-ii");
  const [dialogEvent, setDialogEvent] = useState<TimelineEvent | null>(null);

  const visibleEvents = useMemo(() => chronological.filter((event) => event.year <= selectedYear), [selectedYear]);
  const visiblePlaces = useMemo(() => atlasPlaces.filter((place) => place.eventIds.some((eventId) => visibleEvents.some((event) => event.id === eventId))), [visibleEvents]);
  const graph = useMemo(() => buildKnowledgeGraph(selectedYear, language), [language, selectedYear]);
  const visibleSources = useMemo(() => sourceObjects.filter((source) => source.startYear <= selectedYear), [selectedYear]);
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? visibleEvents.at(-1) ?? events[0];

  function focusEvent(event: TimelineEvent) {
    setSelectedYear(event.year);
    setSelectedEventId(event.id);
    const relatedSource = sourcesForEvent(event.id).filter((source) => source.startYear <= event.year).at(-1);
    if (relatedSource) setSelectedSourceId(relatedSource.id);
  }

  function openEvent(event: TimelineEvent) {
    focusEvent(event);
    setDialogEvent(event);
  }

  function changeYear(year: number) {
    setSelectedYear(year);
    const nearest = [...chronological].reverse().find((event) => event.year <= year) ?? chronological[0];
    setSelectedEventId(nearest.id);
    const nearestSource = [...sourceObjects].reverse().find((source) => source.startYear <= year);
    if (nearestSource) setSelectedSourceId(nearestSource.id);
  }

  return (
    <section className="living-atlas" id="atlas" data-atlas-build="20260716" aria-labelledby="living-atlas-title">
      <div className="living-atlas__masthead">
        <div>
          <span className="section-kicker">{a("sectionKicker")}</span>
          <h2 id="living-atlas-title">{a("sectionTitle")}</h2>
        </div>
        <div>
          <p>{a("sectionBody")}</p>
          <span className="living-atlas__sync"><i aria-hidden="true" />{a("synchronized")}</span>
        </div>
      </div>

      <div className="living-atlas__status" aria-live="polite">
        <div className="living-atlas__coordinate">
          <span>{selectedYear}</span>
          <p><strong>{localize(selectedEvent.title, language)}</strong><small>{localize(selectedEvent.yearLabel, language)}</small></p>
        </div>
        <dl>
          <div><dt>{a("atlasMetricEvents")}</dt><dd>{visibleEvents.length}</dd></div>
          <div><dt>{a("atlasMetricPlaces")}</dt><dd>{visiblePlaces.length}</dd></div>
          <div><dt>{a("atlasMetricEntities")}</dt><dd>{graph.nodes.length}</dd></div>
          <div><dt>{a("atlasMetricObjects")}</dt><dd>{visibleSources.length}</dd></div>
        </dl>
      </div>

      <YearMachine
        selectedYear={selectedYear}
        selectedEventId={selectedEventId}
        reduceMotion={reduceMotion}
        onYearChange={changeYear}
        onFocusEvent={focusEvent}
        onOpenEvent={openEvent}
      />

      <Suspense fallback={<div className="atlas-module-loading" role="status"><span className="atlas-loader" aria-hidden="true" />{a("mapLoading")}</div>}>
        <EcclesialMap
          selectedYear={selectedYear}
          selectedEventId={selectedEventId}
          onFocusEvent={focusEvent}
          onOpenEvent={openEvent}
        />
      </Suspense>

      <KnowledgeConstellation
        selectedYear={selectedYear}
        selectedEventId={selectedEventId}
        onFocusEvent={focusEvent}
        onOpenEvent={openEvent}
        onSelectSource={setSelectedSourceId}
      />

      <Suspense fallback={<div className="atlas-module-loading atlas-module-loading--light" role="status"><span className="atlas-loader" aria-hidden="true" />{a("viewerLoading")}</div>}>
        <SourceReadingRoom
          selectedYear={selectedYear}
          selectedSourceId={selectedSourceId}
          onSelectSource={setSelectedSourceId}
          onFocusEvent={focusEvent}
          onOpenEvent={openEvent}
        />
      </Suspense>

      <aside className="living-atlas__evidence">
        <span>✣</span>
        <div><strong>{a("evidenceStandard")}</strong><p>{a("evidenceStandardBody")}</p></div>
      </aside>

      <EventDialog
        event={dialogEvent}
        onClose={() => setDialogEvent(null)}
        onSelect={(event) => {
          focusEvent(event);
          setDialogEvent(event);
        }}
      />
    </section>
  );
}

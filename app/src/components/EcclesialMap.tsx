import { useEffect, useMemo, useRef, useState } from "react";
import { events } from "../data";
import { atlasPlaces } from "../data/livingAtlas";
import { atlasTranslate } from "../data/livingAtlasCopy";
import { useAccessibility } from "../hooks/useAccessibility";
import { useLanguage } from "../hooks/useLanguage";
import type { TimelineEvent } from "../types";
import { localize } from "../utils";

interface ArcGISGraphic {
  attributes?: Record<string, unknown>;
}

interface ArcGISLayer {
  removeAll: () => void;
  addMany: (graphics: ArcGISGraphic[]) => void;
}

interface ArcGISView {
  zoom: number;
  when: () => Promise<void>;
  on: (name: "click", handler: (event: unknown) => void) => { remove: () => void };
  hitTest: (event: unknown, options: { include: ArcGISLayer }) => Promise<{ results: Array<{ type: string; graphic?: ArcGISGraphic }> }>;
  goTo: (target: Record<string, unknown>, options: Record<string, unknown>) => Promise<void>;
  destroy: () => void;
}

type ArcGISConstructor<T> = new (properties: Record<string, unknown>) => T;

declare global {
  interface Window {
    $arcgis?: {
      import: <T>(moduleIds: string | string[]) => Promise<T>;
    };
  }
}

let arcGISLoader: Promise<NonNullable<Window["$arcgis"]>> | null = null;

function loadArcGIS(): Promise<NonNullable<Window["$arcgis"]>> {
  if (window.$arcgis) return Promise.resolve(window.$arcgis);
  if (arcGISLoader) return arcGISLoader;
  arcGISLoader = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-living-atlas-arcgis="theme"]')) {
      const stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = "https://js.arcgis.com/5.1/esri/themes/dark/main.css";
      stylesheet.dataset.livingAtlasArcgis = "theme";
      document.head.append(stylesheet);
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-living-atlas-arcgis="sdk"]');
    const script = existing ?? document.createElement("script");
    const finish = () => window.$arcgis ? resolve(window.$arcgis) : reject(new Error("ArcGIS CDN did not initialize."));
    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", () => reject(new Error("ArcGIS CDN could not load.")), { once: true });
    if (!existing) {
      script.type = "module";
      script.src = "https://js.arcgis.com/5.1/";
      script.dataset.livingAtlasArcgis = "sdk";
      document.head.append(script);
    }
  });
  return arcGISLoader;
}

interface EcclesialMapProps {
  selectedYear: number;
  selectedEventId: string;
  onFocusEvent: (event: TimelineEvent) => void;
  onOpenEvent: (event: TimelineEvent) => void;
}

export function EcclesialMap({ selectedYear, selectedEventId, onFocusEvent, onOpenEvent }: EcclesialMapProps) {
  const { language } = useLanguage();
  const { reduceMotion } = useAccessibility();
  const a = (key: Parameters<typeof atlasTranslate>[1]) => atlasTranslate(language, key);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<ArcGISView | null>(null);
  const layerRef = useRef<ArcGISLayer | null>(null);
  const graphicConstructorRef = useRef<ArcGISConstructor<ArcGISGraphic> | null>(null);
  const focusHandlerRef = useRef(onFocusEvent);
  const [mapState, setMapState] = useState<"loading" | "ready" | "failed">("loading");

  function accuracyLabel(accuracy: "site" | "city" | "region"): string {
    if (accuracy === "site") return a("mapAccuracySite");
    if (accuracy === "city") return a("mapAccuracyCity");
    return a("mapAccuracyRegion");
  }

  focusHandlerRef.current = onFocusEvent;

  const visiblePlaces = useMemo(() => atlasPlaces
    .map((place) => {
      const placeEvents = place.eventIds
        .map((eventId) => events.find((event) => event.id === eventId))
        .filter((event): event is TimelineEvent => Boolean(event && event.year <= selectedYear))
        .sort((left, right) => right.year - left.year);
      return { place, placeEvents };
    })
    .filter(({ placeEvents }) => placeEvents.length > 0)
    .sort((left, right) => right.placeEvents[0].year - left.placeEvents[0].year), [selectedYear]);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let clickHandle: { remove: () => void } | null = null;

    void loadArcGIS().then(async (arcgis) => {
      const [ArcMap, MapView, Graphic, GraphicsLayer] = await arcgis.import<[
        ArcGISConstructor<unknown>,
        ArcGISConstructor<ArcGISView>,
        ArcGISConstructor<ArcGISGraphic>,
        ArcGISConstructor<ArcGISLayer>,
      ]>([
        "@arcgis/core/Map.js",
        "@arcgis/core/views/MapView.js",
        "@arcgis/core/Graphic.js",
        "@arcgis/core/layers/GraphicsLayer.js",
      ]);
      if (cancelled || !containerRef.current) return;
      const layer = new GraphicsLayer({ title: "Curated historical locations" });
      const map = new ArcMap({ basemap: "osm", layers: [layer] });
      const view = new MapView({
        container: containerRef.current,
        map,
        center: [15, 40],
        zoom: 3,
        constraints: { minZoom: 2, maxZoom: 16 },
        popupEnabled: false,
      });
      viewRef.current = view;
      layerRef.current = layer;
      graphicConstructorRef.current = Graphic;

      clickHandle = view.on("click", async (clickEvent) => {
        const hit = await view.hitTest(clickEvent, { include: layer });
        const result = hit.results.find((item) => item.type === "graphic");
        const eventId = String(result?.graphic?.attributes?.eventId ?? "");
        const selected = events.find((event) => event.id === eventId);
        if (selected) focusHandlerRef.current(selected);
      });
      await view.when();
      if (!cancelled) setMapState("ready");
    }).catch(() => {
      if (!cancelled) setMapState("failed");
    });

    return () => {
      cancelled = true;
      clickHandle?.remove();
      viewRef.current?.destroy();
      viewRef.current = null;
      layerRef.current = null;
      graphicConstructorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    const Graphic = graphicConstructorRef.current;
    if (!layer || !Graphic) return;
    layer.removeAll();
    const graphics = visiblePlaces.map(({ place, placeEvents }) => {
      const focusedEvent = placeEvents.find((event) => event.id === selectedEventId);
      const representedEvent = focusedEvent ?? placeEvents[0];
      const focused = Boolean(focusedEvent);
      const multiple = placeEvents.length > 1;
      return new Graphic({
        geometry: { type: "point", longitude: place.longitude, latitude: place.latitude },
        attributes: {
          eventId: representedEvent.id,
          placeId: place.id,
          year: representedEvent.year,
          count: placeEvents.length,
        },
        symbol: {
          type: "simple-marker",
          style: multiple ? "diamond" : "circle",
          size: focused ? 16 : multiple ? 11 : 8,
          color: focused ? [230, 184, 92, 0.98] : multiple ? [192, 74, 54, 0.88] : [77, 141, 145, 0.82],
          outline: { color: focused ? [255, 250, 240, 1] : [11, 27, 51, 0.9], width: focused ? 2.5 : 1 },
        },
      });
    });
    layer.addMany(graphics);
  }, [mapState, selectedEventId, visiblePlaces]);

  useEffect(() => {
    if (mapState !== "ready") return;
    const view = viewRef.current;
    const place = atlasPlaces.find((candidate) => candidate.eventIds.includes(selectedEventId));
    if (!view || !place) return;
    void view.goTo({ center: [place.longitude, place.latitude], zoom: Math.max(view.zoom, 5) }, {
      animate: !reduceMotion,
      duration: reduceMotion ? 0 : 700,
    }).catch(() => undefined);
  }, [mapState, reduceMotion, selectedEventId]);

  return (
    <section className="ecclesial-map" aria-labelledby="ecclesial-map-title">
      <header className="atlas-panel-heading">
        <span className="atlas-eyebrow">02 · {a("mapKicker")}</span>
        <h3 id="ecclesial-map-title">{a("mapTitle")}</h3>
        <p>{a("mapBody")}</p>
      </header>
      <div className="ecclesial-map__layout">
        <div className="ecclesial-map__stage">
          <div ref={containerRef} className="ecclesial-map__canvas" aria-label={a("mapTitle")} />
          {mapState !== "ready" && (
            <div className="ecclesial-map__status" role="status">
              <span className="atlas-loader" aria-hidden="true" />
              {mapState === "failed" ? a("mapFailed") : a("mapLoading")}
            </div>
          )}
          <div className="ecclesial-map__legend" aria-label={a("mapAccuracy")}>
            <span><i className="is-past" />{a("mapLegendPast")}</span>
            <span><i className="is-focus" />{a("mapLegendFocus")}</span>
            <span><i className="is-multiple" />{a("mapLegendMultiple")}</span>
          </div>
        </div>

        <aside className="ecclesial-map__index" aria-labelledby="map-place-index">
          <header>
            <span id="map-place-index">{a("mapIndex")}</span>
            <strong>{visiblePlaces.length}</strong>
            <small>{a("mapSitesAtYear")}</small>
          </header>
          <ol>
            {visiblePlaces.map(({ place, placeEvents }) => {
              const event = placeEvents.find((candidate) => candidate.id === selectedEventId) ?? placeEvents[0];
              return (
                <li key={place.id} className={place.eventIds.includes(selectedEventId) ? "is-selected" : undefined}>
                  <button type="button" onClick={() => onFocusEvent(event)}>
                    <span>{localize(place.name, language)}</span>
                    <strong>{localize(event.title, language)}</strong>
                    <small>{localize(event.yearLabel, language)} · {localize(place.region, language)}</small>
                  </button>
                  <button type="button" onClick={() => onOpenEvent(event)} aria-label={`${a("openRecord")}: ${localize(event.title, language)}`}>↗</button>
                  <p><b>{a("mapAccuracy")} · {accuracyLabel(place.accuracy)}</b>{localize(place.note, language)}</p>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </section>
  );
}

export default EcclesialMap;

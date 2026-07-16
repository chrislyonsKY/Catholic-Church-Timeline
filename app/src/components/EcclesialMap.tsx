import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { LayerGroup, Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { events } from "../data";
import { atlasPlaces } from "../data/livingAtlas";
import { atlasTranslate } from "../data/livingAtlasCopy";
import { useAccessibility } from "../hooks/useAccessibility";
import { useLanguage } from "../hooks/useLanguage";
import type { AtlasPlace, TimelineEvent } from "../types";
import { localize } from "../utils";

interface ArcGISGraphic {
  attributes?: Record<string, unknown>;
  geometry?: Record<string, unknown>;
}

interface ArcGISLayer {
  removeAll: () => void;
  addMany: (graphics: ArcGISGraphic[]) => void;
}

interface ArcGISPopup {
  on: (name: "trigger-action", handler: (event: { action?: { id?: string } }) => void) => { remove: () => void };
}

interface ArcGISView {
  zoom: number;
  container?: HTMLDivElement;
  popup?: ArcGISPopup;
  when: () => Promise<void>;
  on: (name: "click" | "pointer-move", handler: (event: unknown) => void) => { remove: () => void };
  hitTest: (event: unknown, options: { include: ArcGISLayer }) => Promise<{ results: Array<{ type: string; graphic?: ArcGISGraphic }> }>;
  goTo: (target: unknown, options: Record<string, unknown>) => Promise<void>;
  openPopup?: (options: { features: ArcGISGraphic[]; location?: Record<string, unknown> }) => void;
  destroy: () => void;
}

type ArcGISConstructor<T> = new (properties: Record<string, unknown>) => T;
type MapState = "loading" | "arcgis" | "fallback" | "failed";

declare global {
  interface Window {
    $arcgis?: {
      import: <T>(moduleIds: string | string[]) => Promise<T>;
    };
  }
}

let arcGISLoader: Promise<NonNullable<Window["$arcgis"]>> | null = null;

function supportsWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

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
  const popupTemplateConstructorRef = useRef<ArcGISConstructor<unknown> | null>(null);
  const graphicsRef = useRef<ArcGISGraphic[]>([]);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const leafletLayerRef = useRef<LayerGroup | null>(null);
  const leafletMarkersRef = useRef<Map<string, LeafletMarker>>(new Map());
  const fallbackHasFitRef = useRef(false);
  const pendingPopupPlaceRef = useRef<string | null>(null);
  const focusHandlerRef = useRef(onFocusEvent);
  const openHandlerRef = useRef(onOpenEvent);
  const [mapState, setMapState] = useState<MapState>("loading");

  focusHandlerRef.current = onFocusEvent;
  openHandlerRef.current = onOpenEvent;

  function accuracyLabel(accuracy: AtlasPlace["accuracy"]): string {
    if (accuracy === "site") return a("mapAccuracySite");
    if (accuracy === "city") return a("mapAccuracyCity");
    return a("mapAccuracyRegion");
  }

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

  function buildPopupContent(place: AtlasPlace, placeEvents: TimelineEvent[]): HTMLElement {
    const root = document.createElement("section");
    root.className = "atlas-popup";

    const meta = document.createElement("div");
    meta.className = "atlas-popup__meta";
    const precision = document.createElement("span");
    precision.textContent = accuracyLabel(place.accuracy);
    const count = document.createElement("span");
    count.textContent = `${placeEvents.length} ${a("mapRecords")}`;
    meta.append(precision, count);

    const region = document.createElement("p");
    region.className = "atlas-popup__region";
    region.textContent = localize(place.region, language);
    const note = document.createElement("p");
    note.className = "atlas-popup__note";
    note.textContent = localize(place.note, language);

    const heading = document.createElement("strong");
    heading.className = "atlas-popup__heading";
    heading.textContent = a("mapMomentsHere");
    const list = document.createElement("ol");
    list.className = "atlas-popup__events";

    for (const event of placeEvents) {
      const item = document.createElement("li");
      const focus = document.createElement("button");
      focus.type = "button";
      focus.className = event.id === selectedEventId ? "is-current" : "";
      const year = document.createElement("span");
      year.textContent = localize(event.yearLabel, language);
      const title = document.createElement("strong");
      title.textContent = localize(event.title, language);
      focus.append(year, title);
      focus.addEventListener("click", () => {
        pendingPopupPlaceRef.current = place.id;
        focusHandlerRef.current(event);
      });

      const open = document.createElement("button");
      open.type = "button";
      open.className = "atlas-popup__open";
      open.textContent = "↗";
      open.setAttribute("aria-label", `${a("openRecord")}: ${localize(event.title, language)}`);
      open.addEventListener("click", () => openHandlerRef.current(event));
      item.append(focus, open);
      list.append(item);
    }

    root.append(meta, region, note, heading, list);
    return root;
  }

  function buildRasterPopupContent(place: AtlasPlace, placeEvents: TimelineEvent[]): HTMLElement {
    const root = document.createElement("article");
    root.className = "atlas-raster-popup";
    const heading = document.createElement("h4");
    heading.className = "atlas-raster-popup__title";
    heading.textContent = localize(place.name, language);
    root.append(heading, buildPopupContent(place, placeEvents));
    return root;
  }

  function fitVisiblePlaces() {
    const view = viewRef.current;
    const geometries = graphicsRef.current.map((graphic) => graphic.geometry).filter(Boolean);
    if (view && geometries.length > 0) {
      void view.goTo(geometries, { animate: !reduceMotion, duration: reduceMotion ? 0 : 850, padding: 70 }).catch(() => undefined);
      return;
    }

    const leaflet = leafletRef.current;
    const map = leafletMapRef.current;
    const markers = Array.from(leafletMarkersRef.current.values());
    if (!leaflet || !map || markers.length === 0) return;
    map.fitBounds(leaflet.latLngBounds(markers.map((marker) => marker.getLatLng())), {
      animate: !reduceMotion,
      maxZoom: 5,
      padding: [48, 48],
    });
  }

  function openPlacePopup(placeId: string) {
    const view = viewRef.current;
    const graphic = graphicsRef.current.find((candidate) => candidate.attributes?.placeId === placeId);
    if (view && graphic) {
      view.openPopup?.({ features: [graphic], location: graphic.geometry });
      void view.goTo({ target: graphic.geometry, zoom: Math.max(view.zoom, 5) }, {
        animate: !reduceMotion,
        duration: reduceMotion ? 0 : 650,
      }).catch(() => undefined);
      return;
    }

    const map = leafletMapRef.current;
    const marker = leafletMarkersRef.current.get(placeId);
    if (!map || !marker) return;
    marker.openPopup();
    map.setView(marker.getLatLng(), Math.max(map.getZoom(), 5), { animate: !reduceMotion });
  }

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let pointerHandle: { remove: () => void } | null = null;
    let actionHandle: { remove: () => void } | null = null;
    let pointerFrame = 0;
    let resizeFrame = 0;
    let latestPointerEvent: unknown;

    function clearArcGIS() {
      pointerHandle?.remove();
      actionHandle?.remove();
      pointerHandle = null;
      actionHandle = null;
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      viewRef.current?.destroy();
      viewRef.current = null;
      layerRef.current = null;
      graphicConstructorRef.current = null;
      popupTemplateConstructorRef.current = null;
      graphicsRef.current = [];
    }

    async function initializeArcGIS() {
      const arcgis = await loadArcGIS();
      const [ArcMap, MapView, Graphic, GraphicsLayer, PopupTemplate] = await arcgis.import<[
        ArcGISConstructor<unknown>,
        ArcGISConstructor<ArcGISView>,
        ArcGISConstructor<ArcGISGraphic>,
        ArcGISConstructor<ArcGISLayer>,
        ArcGISConstructor<unknown>,
      ]>([
        "@arcgis/core/Map.js",
        "@arcgis/core/views/MapView.js",
        "@arcgis/core/Graphic.js",
        "@arcgis/core/layers/GraphicsLayer.js",
        "@arcgis/core/PopupTemplate.js",
      ]);
      if (cancelled || !containerRef.current) return;
      const layer = new GraphicsLayer({ title: "Curated historical locations" });
      const map = new ArcMap({ basemap: "osm", layers: [layer] });
      const view = new MapView({
        container: containerRef.current,
        map,
        center: [15, 40],
        zoom: 3,
        constraints: { minZoom: 2, maxZoom: 16, snapToZoom: false },
        popupEnabled: true,
        popup: {
          dockEnabled: false,
          collapseEnabled: false,
          highlightEnabled: true,
          visibleElements: { closeButton: true, featureNavigation: false },
        },
      });
      viewRef.current = view;
      layerRef.current = layer;
      graphicConstructorRef.current = Graphic;
      popupTemplateConstructorRef.current = PopupTemplate;

      pointerHandle = view.on("pointer-move", async (pointerEvent) => {
        latestPointerEvent = pointerEvent;
        if (pointerFrame) return;
        pointerFrame = window.requestAnimationFrame(() => {
          pointerFrame = 0;
          void view.hitTest(latestPointerEvent, { include: layer }).then((hit) => {
            if (!cancelled && view.container) view.container.style.cursor = hit.results.some((item) => item.type === "graphic") ? "pointer" : "grab";
          }).catch(() => undefined);
        });
      });
      await view.when();
      if (cancelled) return;
      actionHandle = view.popup?.on("trigger-action", (actionEvent) => {
        const eventId = actionEvent.action?.id?.replace("open-record:", "");
        const event = events.find((candidate) => candidate.id === eventId);
        if (event) openHandlerRef.current(event);
      }) ?? null;
      if (!cancelled) setMapState("arcgis");
    }

    async function initializeRasterFallback() {
      const leaflet = await import("leaflet");
      if (cancelled || !containerRef.current) return;
      const map = leaflet.map(containerRef.current, {
        attributionControl: true,
        maxZoom: 12,
        minZoom: 2,
        preferCanvas: false,
        worldCopyJump: true,
        zoomControl: false,
      }).setView([40, 15], 3);
      leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxNativeZoom: 19,
        maxZoom: 19,
      }).addTo(map);
      leaflet.control.zoom({ position: "bottomleft" }).addTo(map);
      const layer = leaflet.layerGroup().addTo(map);
      leafletRef.current = leaflet;
      leafletMapRef.current = map;
      leafletLayerRef.current = layer;
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0;
        if (!cancelled) map.invalidateSize(false);
      });
      if (!cancelled) setMapState("fallback");
    }

    async function initializeMap() {
      if (supportsWebGL2()) {
        try {
          await initializeArcGIS();
          return;
        } catch (error) {
          console.warn("ArcGIS MapView unavailable; activating the raster compatibility map.", error);
          clearArcGIS();
          containerRef.current?.replaceChildren();
        }
      }

      try {
        await initializeRasterFallback();
      } catch (error) {
        console.error("The raster compatibility map could not initialize.", error);
        if (!cancelled) setMapState("failed");
      }
    }

    void initializeMap();

    return () => {
      cancelled = true;
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      clearArcGIS();
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
      leafletLayerRef.current = null;
      leafletMarkersRef.current.clear();
      leafletRef.current = null;
      fallbackHasFitRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (mapState === "fallback") {
      const leaflet = leafletRef.current;
      const map = leafletMapRef.current;
      const layer = leafletLayerRef.current;
      if (!leaflet || !map || !layer) return;
      layer.clearLayers();
      leafletMarkersRef.current.clear();

      for (const { place, placeEvents } of visiblePlaces) {
        const focusedEvent = placeEvents.find((event) => event.id === selectedEventId);
        const representedEvent = focusedEvent ?? placeEvents[0];
        const focused = Boolean(focusedEvent);
        const multiple = placeEvents.length > 1;
        const markerClass = focused ? "is-focus" : multiple ? "is-multiple" : "is-past";
        const icon = leaflet.divIcon({
          className: `atlas-leaflet-marker ${markerClass}`,
          html: '<span aria-hidden="true"></span>',
          iconAnchor: [11, 11],
          iconSize: [22, 22],
          popupAnchor: [0, -13],
        });
        const marker = leaflet.marker([place.latitude, place.longitude], {
          alt: localize(place.name, language),
          icon,
          keyboard: true,
          riseOnHover: true,
          title: localize(place.name, language),
          zIndexOffset: focused ? 1000 : multiple ? 500 : 0,
        });
        marker.bindPopup(buildRasterPopupContent(place, placeEvents), {
          className: "atlas-leaflet-popup",
          closeButton: true,
          maxWidth: 380,
        });
        marker.on("click", () => {
          if (representedEvent.id === selectedEventId) return;
          pendingPopupPlaceRef.current = place.id;
          focusHandlerRef.current(representedEvent);
        });
        marker.addTo(layer);
        leafletMarkersRef.current.set(place.id, marker);
      }

      const markers = Array.from(leafletMarkersRef.current.values());
      if (!fallbackHasFitRef.current && markers.length > 0) {
        map.fitBounds(leaflet.latLngBounds(markers.map((marker) => marker.getLatLng())), {
          animate: false,
          maxZoom: 4,
          padding: [42, 42],
        });
        fallbackHasFitRef.current = true;
      }

      const pendingPlaceId = pendingPopupPlaceRef.current;
      const pendingMarker = pendingPlaceId ? leafletMarkersRef.current.get(pendingPlaceId) : undefined;
      if (pendingMarker) {
        pendingMarker.openPopup();
        map.panTo(pendingMarker.getLatLng(), { animate: !reduceMotion });
        pendingPopupPlaceRef.current = null;
      }
      return;
    }

    if (mapState !== "arcgis") return;
    const layer = layerRef.current;
    const Graphic = graphicConstructorRef.current;
    const PopupTemplate = popupTemplateConstructorRef.current;
    if (!layer || !Graphic || !PopupTemplate) return;
    layer.removeAll();
    const graphics = visiblePlaces.map(({ place, placeEvents }) => {
      const focusedEvent = placeEvents.find((event) => event.id === selectedEventId);
      const representedEvent = focusedEvent ?? placeEvents[0];
      const focused = Boolean(focusedEvent);
      const multiple = placeEvents.length > 1;
      const popupTemplate = new PopupTemplate({
        title: localize(place.name, language),
        outFields: ["*"],
        content: () => buildPopupContent(place, placeEvents),
        actions: [{ id: `open-record:${representedEvent.id}`, title: a("openRecord"), icon: "document" }],
      });
      return new Graphic({
        geometry: { type: "point", longitude: place.longitude, latitude: place.latitude },
        attributes: {
          eventId: representedEvent.id,
          placeId: place.id,
          placeName: localize(place.name, language),
          year: representedEvent.year,
          count: placeEvents.length,
          precision: accuracyLabel(place.accuracy),
        },
        popupTemplate,
        symbol: {
          type: "simple-marker",
          style: multiple ? "diamond" : "circle",
          size: focused ? 17 : multiple ? 12 : 9,
          color: focused ? [230, 184, 92, 0.98] : multiple ? [192, 74, 54, 0.9] : [77, 141, 145, 0.88],
          outline: { color: focused ? [255, 250, 240, 1] : [11, 27, 51, 0.95], width: focused ? 3 : 1.25 },
        },
      });
    });
    graphicsRef.current = graphics;
    layer.addMany(graphics);
    const pendingPlaceId = pendingPopupPlaceRef.current;
    const pendingGraphic = graphics.find((graphic) => graphic.attributes?.placeId === pendingPlaceId);
    if (pendingGraphic) {
      viewRef.current?.openPopup?.({ features: [pendingGraphic], location: pendingGraphic.geometry });
      pendingPopupPlaceRef.current = null;
    }
  }, [language, mapState, reduceMotion, selectedEventId, visiblePlaces]);

  useEffect(() => {
    const place = atlasPlaces.find((candidate) => candidate.eventIds.includes(selectedEventId));
    if (!place) return;

    if (mapState === "arcgis") {
      const view = viewRef.current;
      if (!view) return;
      void view.goTo({ center: [place.longitude, place.latitude], zoom: Math.max(view.zoom, 5) }, {
        animate: !reduceMotion,
        duration: reduceMotion ? 0 : 700,
      }).catch(() => undefined);
      return;
    }

    if (mapState === "fallback") {
      const map = leafletMapRef.current;
      const marker = leafletMarkersRef.current.get(place.id);
      if (!map || !marker) return;
      map.setView(marker.getLatLng(), Math.max(map.getZoom(), 5), { animate: !reduceMotion });
    }
  }, [mapState, reduceMotion, selectedEventId]);

  const mapReady = mapState === "arcgis" || mapState === "fallback";

  return (
    <section className="ecclesial-map" data-map-build="20260716c" data-map-engine={mapState} aria-labelledby="ecclesial-map-title">
      <header className="atlas-panel-heading">
        <span className="atlas-eyebrow">02 · {a("mapKicker")}</span>
        <h3 id="ecclesial-map-title">{a("mapTitle")}</h3>
        <p>{a("mapBody")}</p>
      </header>
      <div className="ecclesial-map__layout">
        <div className="ecclesial-map__stage">
          <div ref={containerRef} className="ecclesial-map__canvas" aria-label={a("mapTitle")} />
          {!mapReady && (
            <div className="ecclesial-map__status" role="status">
              <span className="atlas-loader" aria-hidden="true" />
              {mapState === "failed" ? a("mapFailed") : a("mapLoading")}
            </div>
          )}
          {mapReady && (
            <div className="ecclesial-map__tools">
              <button type="button" onClick={fitVisiblePlaces} aria-label={a("mapFit")}><span aria-hidden="true">⌗</span>{a("mapFit")}</button>
            </div>
          )}
          {mapState === "fallback" && <p className="ecclesial-map__engine" role="status">{a("mapCompatibility")}</p>}
          <p className="ecclesial-map__hint"><span aria-hidden="true">＋</span>{a("mapPopupHint")}</p>
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
                  <button type="button" onClick={() => openPlacePopup(place.id)} aria-label={`${a("mapOpenPlace")}: ${localize(place.name, language)}`}>
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

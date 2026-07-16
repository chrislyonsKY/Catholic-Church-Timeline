# Living Ecclesial Atlas

## Product intent

The atlas turns the existing chronology into four synchronized instruments. A single selected year and focused event coordinate the year machine, geographic atlas, knowledge constellation, and IIIF reading room. The suite is an interpretive learning tool, not a claim to exhaustive ecclesiastical coverage.

## Shared state

- `selectedYear` is bounded to AD 30–2026.
- `selectedEventId` resolves to the latest curated event at or before a manually chosen year.
- Selecting an event anywhere moves every instrument to that event’s year.
- `selectedSourceId` follows an available contextual object when a disclosed relationship exists.
- Full timeline records continue to open in the existing `EventDialog`.

## Instruments

1. **Church in Any Year** — precise year input, accessible range control, landmark presets, event-by-event playback, chronological neighbors, era context, and latest-by-category snapshot.
2. **Historical atlas** — ArcGIS Maps SDK loaded from Esri’s 5.1 CDN at runtime, OpenStreetMap basemap, curated point locations, synchronized marker focus, and a complete non-map place index.
3. **Knowledge constellation** — deterministic D3 force layout with focused and galaxy views. Nodes represent events, named people, editorial eras, and disclosed source objects.
4. **IIIF reading room** — OpenSeadragon deep zoom for selected Vatican Apostolic Library objects, with exact manifests, image services, repository records, rights statements, and relationship notes.

## Evidence contract

- A map marker identifies a documented site, city, or regional orientation; it never implies a reconstructed political or ecclesiastical boundary.
- A `names` graph edge is created only when the person appears in the existing curated event record.
- A `belongs-to` edge expresses the chronology’s existing editorial era assignment.
- A `witnessed-by` edge is a disclosed curatorial pairing. Its note states when the object is contextual rather than a direct record.
- IIIF objects retain the Vatican Apostolic Library rights statement. Images are streamed from the repository and are not copied into this repository.
- “Latest” snapshot cards mean latest in this 52-event exhibition, not the historically complete officeholder or documentary record.

## Accessibility and resilience

- All graph nodes are keyboard-selectable and have accessible names.
- The map has a synchronized HTML place index; no task depends on WebGL or pointer-only map interaction.
- Deep-zoom controls are ordinary labeled buttons, with repository and manifest fallbacks.
- User-selected high contrast and reduced motion apply across the suite.
- Reduced motion disables automatic playback and suppresses animated map navigation.
- Every control exposes its selected state through native or ARIA state.
- All interface copy and atlas records are available in English, Spanish, French, and Portuguese.

## Deployment decisions

- ArcGIS core modules use Esri’s documented `$arcgis.import()` CDN loader. Bundling `@arcgis/core` transformed roughly 4,900 modules and exceeded the 2 GB Vite build limit; runtime loading keeps the application build deterministic and the map code split small.
- The reading room and map are separate lazy chunks.
- The source and location contract is checked by `tests/living-atlas.test.mjs`; TypeScript validates the derived graph model.

## Acceptance checks

- Every curated event resolves to at least one known atlas location.
- All IIIF records use HTTPS Vatican Library manifests and image services and carry the repository rights statement.
- Changing the year updates event, place, graph, and source counts.
- Selecting a map, graph, snapshot, or source relationship focuses the same event throughout the suite.
- The production and GitHub Pages builds complete without local network access.

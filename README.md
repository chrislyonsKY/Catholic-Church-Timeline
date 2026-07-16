# Historia Ecclesiae

[![Verify GitHub Pages bundle](https://github.com/chrislyonsKY/Catholic-Church-Timeline/actions/workflows/pages.yml/badge.svg)](https://github.com/chrislyonsKY/Catholic-Church-Timeline/actions/workflows/pages.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-a7482e.svg)](LICENSE)
[![Four complete languages](https://img.shields.io/badge/languages-EN%20%7C%20ES%20%7C%20FR%20%7C%20PT-2f6866.svg)](https://chrislyonsKY.github.io/Catholic-Church-Timeline/)

**Two Thousand Years of the Catholic Church** is a multilingual digital exhibition of apostolic witness, saints, councils, papal succession, reform, division, and renewal from AD 30 to the present.

**[Explore in English](https://chrislyonsKY.github.io/Catholic-Church-Timeline/)** · **[Español](https://chrislyonsKY.github.io/Catholic-Church-Timeline/?lang=es)** · **[Français](https://chrislyonsKY.github.io/Catholic-Church-Timeline/?lang=fr)** · **[Português](https://chrislyonsKY.github.io/Catholic-Church-Timeline/?lang=pt)**

## The exhibition

The interface carries the editorial rigor of the Cartographic Archive into a distinct **ecclesial observatory** concept: a lapis night field, data-driven twenty-century dial, illuminated era spectrum, typographic registers, and high-contrast coral and gold exhibition rooms. It is a designed historical instrument rather than a generic card dashboard.

- 52 curated historical records across six eras
- A data-driven chronometer plotting all 52 events across twenty centuries
- 15 apostolic profiles and 26 representative saint profiles
- Complete English, Spanish, French, and Portuguese interface and content editions
- Search across all four languages, including names, descriptions, people, councils, and documents
- A two-handle century navigator combined with era, category, period, sort, and layout controls
- Deep-linked event dossiers with era context, chronology neighbors, related records, people, sources, and copyable URLs
- An interactive communion-and-fracture atlas linking major Christian traditions back to the chronology
- A synchronized “Church in Any Year” control that reorganizes the event horizon, places, evidence graph, and digitized sources
- An ArcGIS historical atlas with documented site/city/region precision and a complete HTML place index
- A D3 knowledge constellation with focused and galaxy views across events, people, editorial eras, and disclosed source pairings
- An OpenSeadragon IIIF reading room for selected Vatican Apostolic Library manuscripts, including manifests, repository records, and rights statements
- Shareable apostle and saint profiles with scriptural or connected historical records
- A five-step guided tour and persistent language detection
- User-controlled text sizing, high contrast, reduced motion, responsive layouts, and print support
- Semantic headings, native controls, skip navigation, visible focus, and live announcements

The selected language is stored locally and reflected in the shareable URL. Use `?lang=es`, `?lang=fr`, or `?lang=pt` to open a specific edition. Every historical event also has a stable `?event=…` address.

## Architecture

This edition replaces the earlier single-file prototype with a maintainable, typed application:

| Layer | Implementation |
| --- | --- |
| UI | React 19 components with semantic HTML |
| Language | Typed English, Spanish, French, and Portuguese dictionaries and local content packs |
| Styling | Tailwind CSS 4 plus a documented editorial component layer |
| Historical atlas | ArcGIS Maps SDK 5.1 modules loaded on demand from Esri’s CDN |
| Evidence graph | Deterministic D3 force layout with inspectable relationship types |
| Manuscript viewer | OpenSeadragon with Vatican Apostolic Library IIIF image services |
| Tooling | TypeScript 5 and Vite 7 |
| Validation | Node test runner data-contract tests plus strict TypeScript build |
| Hosting | Versioned Vite bundle served by GitHub Pages and verified by GitHub Actions |

Historical content lives separately from presentation code in `app/src/data/content.json`; French and Portuguese editions live in `app/src/data/content-extra.json`. Atlas locations, IIIF objects, and evidence rules live in `app/src/data/livingAtlas.ts` and `app/src/data/knowledgeGraph.ts`. Adding a record does not require duplicating presentation markup. The evidence and interaction contract is documented in [`docs/LIVING_ATLAS_SPEC.md`](docs/LIVING_ATLAS_SPEC.md).

## Run locally

Node.js 22.13 or newer is required.

```bash
git clone https://github.com/chrislyonsKY/Catholic-Church-Timeline.git
cd Catholic-Church-Timeline
npm ci
npm run dev
```

Vite prints the local address when the development server starts.

## Validate a change

```bash
npm run check
```

The command validates record counts, unique IDs, categories, eras, source URLs, all four language editions, atlas coverage, and IIIF service contracts before running a strict TypeScript production build. Preview that build with:

```bash
npm run preview
```

## Publish to GitHub Pages

The repository's Pages setting currently publishes the root of `main`. The editable application therefore lives in `app/`, while the small versioned production bundle at the repository root is generated by Vite. This keeps the development source clean and gives the legacy Pages publisher only browser-ready files.

After changing the application, regenerate the public bundle before committing:

```bash
npm run prepare:pages
```

GitHub Actions runs the same production build and fails if `index.html`, `favicon.svg`, `.nojekyll`, or `assets/` do not match the source. This prevents an unbuilt TypeScript entry point from being published again.

## Project structure

```text
app/
├── index.html        Vite application document
├── public/           Static application assets
└── src/
    ├── components/   Exhibition sections and interactive controls
    ├── data/         Typed chronology, apostle, saint, and source records
    ├── hooks/        Language state and URL persistence
    ├── App.tsx       Page composition
    ├── i18n.ts       Four complete interface dictionaries
    ├── styles.css    Tailwind entry point and editorial design system
    └── types.ts      Shared domain types
assets/               Generated, browser-ready production assets
scripts/              Deterministic Pages publishing and verification
tests/                Content contract tests
.github/workflows/    Continuous verification
```

## Historical approach and sources

This is a curated learning aid, not an exhaustive ecclesiastical history. Approximate dates are marked with “c.”, editorial period boundaries are identified as such, and complex developments are described as processes rather than isolated moments.

Individual records link to primary references where available. Core reference collections include the [Holy See’s list of Supreme Pontiffs](https://www.vatican.va/content/vatican/en/holy-father.html), [historical councils archive](https://www.vatican.va/archive/hist_councils/index.htm), [Catechism of the Catholic Church](https://www.vatican.va/archive/ENG0015/_INDEX.HTM), and the [USCCB Bible](https://bible.usccb.org/bible).

## Attribution

The original hand-drawn chronology was created by **Joe Bland in 2008**. This project is a structured, multilingual digital interpretation with expanded historical context, navigation, and references. The original source photograph is not included in the site or repository.

## License

Distributed under the existing [Apache License 2.0](LICENSE).

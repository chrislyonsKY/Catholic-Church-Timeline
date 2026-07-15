# Historia Ecclesiae

[![Deploy GitHub Pages](https://github.com/chrislyonsKY/Catholic-Church-Timeline/actions/workflows/pages.yml/badge.svg)](https://github.com/chrislyonsKY/Catholic-Church-Timeline/actions/workflows/pages.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-a7482e.svg)](LICENSE)
[![English and Spanish](https://img.shields.io/badge/languages-English%20%7C%20Espa%C3%B1ol-2f6866.svg)](https://chrislyonsKY.github.io/Catholic-Church-Timeline/?lang=es)

**Two Thousand Years of the Catholic Church** is a bilingual digital exhibition of apostolic witness, saints, councils, papal succession, reform, division, and renewal from AD 30 to the present.

**[Explore the live timeline](https://chrislyonsKY.github.io/Catholic-Church-Timeline/)** · **[Abrir en español](https://chrislyonsKY.github.io/Catholic-Church-Timeline/?lang=es)**

## The exhibition

The interface follows the editorial system established for the Cartographic Archive: paper and ink tones, restrained rust and sea accents, serif display typography, mono archival labels, strong rules, and information-dense registers. It is a designed historical tool rather than a generic card dashboard.

- 52 curated historical records across six eras
- 15 apostolic profiles and 26 representative saint profiles
- Search across English and Spanish names, descriptions, people, councils, and documents
- Era, category, period, sort, and layout controls
- Source-linked event dialogs with keyboard and backdrop dismissal
- A complete Spanish interface selected with the **English / Español** control
- Responsive, print-aware layouts and reduced-motion support
- Semantic headings, native controls, skip navigation, visible focus, and live announcements

The selected language is stored locally and reflected in the shareable URL. Spanish can be opened directly with `?lang=es`.

## Architecture

This edition replaces the earlier single-file prototype with a maintainable, typed application:

| Layer | Implementation |
| --- | --- |
| UI | React 19 components with semantic HTML |
| Language | Typed English/Spanish dictionaries and localized content records |
| Styling | Tailwind CSS 4 plus a documented editorial component layer |
| Tooling | TypeScript 5 and Vite 7 |
| Validation | Node test runner data-contract tests plus strict TypeScript build |
| Hosting | GitHub Actions production build deployed to GitHub Pages |

Historical content lives separately from presentation code in `src/data/content.json`. Adding a record does not require editing a component or duplicating markup.

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

The command validates record counts, unique IDs, categories, eras, source URLs, and both language editions before running a strict TypeScript production build. Preview that build with:

```bash
npm run preview
```

## Project structure

```text
src/
├── components/       Exhibition sections and interactive controls
├── data/             Typed chronology, apostle, saint, and source records
├── hooks/            Language state and URL persistence
├── App.tsx           Page composition
├── i18n.ts           English and Spanish interface copy
├── styles.css        Tailwind entry point and editorial design system
└── types.ts          Shared domain types
tests/                Content contract tests
.github/workflows/    GitHub Pages build and deployment
```

## Historical approach and sources

This is a curated learning aid, not an exhaustive ecclesiastical history. Approximate dates are marked with “c.”, editorial period boundaries are identified as such, and complex developments are described as processes rather than isolated moments.

Individual records link to primary references where available. Core reference collections include the [Holy See’s list of Supreme Pontiffs](https://www.vatican.va/content/vatican/en/holy-father.html), [historical councils archive](https://www.vatican.va/archive/hist_councils/index.htm), [Catechism of the Catholic Church](https://www.vatican.va/archive/ENG0015/_INDEX.HTM), and the [USCCB Bible](https://bible.usccb.org/bible).

## Attribution

The original hand-drawn chronology was created by **Joe Bland in 2008**. This project is a structured, bilingual digital interpretation with expanded historical context, navigation, and references. The original source photograph is not included in the site or repository.

## License

Distributed under the existing [Apache License 2.0](LICENSE).

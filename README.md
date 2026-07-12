# Two Thousand Years of the Catholic Church

[![Deploy GitHub Pages](https://github.com/chrislyonsKY/Catholic-Church-Timeline/actions/workflows/pages.yml/badge.svg)](https://github.com/chrislyonsKY/Catholic-Church-Timeline/actions/workflows/pages.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-355C7D.svg)](LICENSE)

An interactive, browser-based chronology of Catholic Church history—from the apostolic age through the pontificate of Leo XIV. The timeline presents major councils, saints, popes, documents, reform movements, divisions, and other consequential moments across twenty centuries.

**[View the interactive timeline](https://chrislyonsKY.github.io/Catholic-Church-Timeline/)**

## Highlights

- 52 curated historical milestones spanning approximately AD 30–2026
- Dedicated profiles for 15 apostles and apostolic witnesses
- Filterable gallery of 26 representative saints
- Full-text search across dates, people, events, and descriptions
- Complete English and Spanish editions with a built-in language switcher
- Filters for historical era and event category
- Accessible event-detail panels, visible keyboard focus, a skip link, and Escape-to-close behavior
- Responsive presentation for desktop, tablet, and mobile browsers
- No framework, build process, API key, or external JavaScript dependency

## Use locally

The complete experience is contained in `index.html`.

1. Download or clone this repository.
2. Open `index.html` in a modern web browser.

No web server or package installation is required.

## English and Spanish / Inglés y español

Use the **English / Español** control in the site header to change languages. The choice is remembered in the browser, and first-time visitors whose browser is set to Spanish automatically receive the Spanish edition. Timeline search recognizes names and terms in either language.

The Spanish edition can also be shared directly with `?lang=es` appended to the site address.

Usa el control **English / Español** de la cabecera para cambiar de idioma. La elección se guarda en el navegador y quienes visiten el sitio por primera vez con el navegador configurado en español recibirán automáticamente la edición en español. La búsqueda reconoce nombres y términos en ambos idiomas.

## Repository structure

| Path | Purpose |
| --- | --- |
| `index.html` | Complete interactive timeline, including its CSS, JavaScript, and historical data |
| `.github/workflows/pages.yml` | Automated GitHub Pages deployment workflow |
| `LICENSE` | Apache License 2.0 |

## Historical approach

This is a curated learning aid rather than an exhaustive ecclesiastical history. Approximate dates are marked with “c.”, and complex developments—such as the East–West Schism—are described as historical processes rather than isolated events.

Primary reference links are included within the timeline. Major reference collections include:

- [The Holy See: Supreme Pontiffs](https://www.vatican.va/content/vatican/en/holy-father.html)
- [The Holy See: Historical Councils](https://www.vatican.va/archive/hist_councils/index.htm)
- [Catechism of the Catholic Church](https://www.vatican.va/archive/ENG0015/_INDEX.HTM)
- [United States Conference of Catholic Bishops: Bible](https://bible.usccb.org/bible)

## Attribution

The original hand-drawn chronology was created by **Joe Bland in 2008**. This repository presents an interactive digital interpretation of that chronology with expanded navigation, structured historical context, and linked references.

## License

This project is distributed under the [Apache License 2.0](LICENSE).

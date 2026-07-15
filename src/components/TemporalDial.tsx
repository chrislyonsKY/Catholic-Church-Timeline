import { eras, events } from "../data";
import { useLanguage } from "../hooks/useLanguage";
import type { EraId } from "../types";
import { localize } from "../utils";

const startYear = 30;
const endYear = 2026;
const startAngle = -132;
const sweep = 264;

const eraBounds: Array<{ id: EraId; start: number; end: number }> = [
  { id: "apostolic", start: 30, end: 312 },
  { id: "imperial", start: 313, end: 800 },
  { id: "medieval", start: 801, end: 1516 },
  { id: "reformation", start: 1517, end: 1788 },
  { id: "modern", start: 1789, end: 1957 },
  { id: "contemporary", start: 1958, end: 2026 },
];

function angleForYear(year: number): number {
  return startAngle + ((year - startYear) / (endYear - startYear)) * sweep;
}

function pointOnCircle(angle: number, radius: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: 260 + radius * Math.cos(radians),
    y: 260 + radius * Math.sin(radians),
  };
}

function arcPath(from: number, to: number, radius: number): string {
  const start = pointOnCircle(to, radius);
  const end = pointOnCircle(from, radius);
  const largeArc = to - from <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function TemporalDial() {
  const { language, t } = useLanguage();

  return (
    <figure className="temporal-dial" aria-label={t("dialLabel")}>
      <svg viewBox="0 0 520 520" aria-hidden="true">
        <circle className="temporal-dial__orbit temporal-dial__orbit--outer" cx="260" cy="260" r="218" />
        <circle className="temporal-dial__orbit" cx="260" cy="260" r="174" />
        <circle className="temporal-dial__orbit temporal-dial__orbit--inner" cx="260" cy="260" r="112" />

        {Array.from({ length: 21 }, (_, index) => {
          const year = startYear + ((endYear - startYear) / 20) * index;
          const outer = pointOnCircle(angleForYear(year), 228);
          const inner = pointOnCircle(angleForYear(year), index % 5 === 0 ? 205 : 214);
          return <line className="temporal-dial__century" x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} key={index} />;
        })}

        {events.map((event) => {
          const angle = angleForYear(event.year);
          const inner = pointOnCircle(angle, 181);
          const outer = pointOnCircle(angle, 197);
          return <line className="temporal-dial__event" x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} key={event.id} />;
        })}

        {eraBounds.map((bound) => (
          <path
            className="temporal-dial__era"
            data-era={bound.id}
            d={arcPath(angleForYear(bound.start) + 0.7, angleForYear(bound.end) - 0.7, 194)}
            key={bound.id}
          />
        ))}

        <line className="temporal-dial__axis" x1="260" y1="152" x2="260" y2="368" />
        <line className="temporal-dial__axis" x1="152" y1="260" x2="368" y2="260" />
        <circle className="temporal-dial__center" cx="260" cy="260" r="76" />
        <text className="temporal-dial__number" x="260" y="249" textAnchor="middle">XX</text>
        <text className="temporal-dial__caption" x="260" y="282" textAnchor="middle">SAECULA</text>
        <text className="temporal-dial__date temporal-dial__date--start" x="54" y="432">AD 30</text>
        <text className="temporal-dial__date temporal-dial__date--end" x="410" y="432">2026</text>
      </svg>

      <figcaption>
        <span>{t("dialLabel")}</span>
        <ol>
          {eras.map((era) => (
            <li data-era={era.id} key={era.id}>
              <i aria-hidden="true" />
              <span>{era.number}</span>
              <strong>{localize(era.title, language)}</strong>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}

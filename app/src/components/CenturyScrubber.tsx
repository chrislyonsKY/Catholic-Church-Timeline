import type { CSSProperties } from "react";
import { useLanguage } from "../hooks/useLanguage";

interface CenturyScrubberProps {
  start: number;
  end: number;
  onChange: (start: number, end: number) => void;
}

const maxCentury = 21;
const marks = [1, 5, 10, 15, 20, 21];

export function CenturyScrubber({ start, end, onChange }: CenturyScrubberProps) {
  const { t } = useLanguage();
  const style = {
    "--range-start": `${((start - 1) / (maxCentury - 1)) * 100}%`,
    "--range-end": `${((end - 1) / (maxCentury - 1)) * 100}%`,
  } as CSSProperties;

  return (
    <section className="century-scrubber" aria-labelledby="century-range-title" style={style}>
      <header>
        <div>
          <span id="century-range-title">{t("centuryRange")}</span>
          <strong>{t("centuryVisible")}: {t("centuryShort")}{start}–{t("centuryShort")}{end}</strong>
        </div>
        <button type="button" onClick={() => onChange(1, maxCentury)} disabled={start === 1 && end === maxCentury}>
          {t("centuryReset")}
        </button>
      </header>

      <div className="century-scrubber__scale">
        <span className="century-scrubber__track" aria-hidden="true" />
        <label>
          <span className="sr-only">{t("centuryFrom")}</span>
          <input
            className="century-scrubber__start"
            type="range"
            min="1"
            max={maxCentury}
            value={start}
            aria-valuetext={`${t("centuryFrom")} ${start}`}
            onChange={(event) => onChange(Math.min(Number(event.target.value), end), end)}
          />
        </label>
        <label>
          <span className="sr-only">{t("centuryTo")}</span>
          <input
            className="century-scrubber__end"
            type="range"
            min="1"
            max={maxCentury}
            value={end}
            aria-valuetext={`${t("centuryTo")} ${end}`}
            onChange={(event) => onChange(start, Math.max(Number(event.target.value), start))}
          />
        </label>
        <div className="century-scrubber__marks" aria-hidden="true">
          {marks.map((century) => <span key={century} style={{ left: `${((century - 1) / (maxCentury - 1)) * 100}%` }}>{century}</span>)}
        </div>
      </div>
    </section>
  );
}

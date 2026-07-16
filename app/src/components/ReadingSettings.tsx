import { useAccessibility } from "../hooks/useAccessibility";
import { useLanguage } from "../hooks/useLanguage";
import type { TextScale } from "../hooks/useAccessibility";

const sizes: Array<{ value: TextScale; key: "textNormal" | "textLarge" | "textLargest" }> = [
  { value: "default", key: "textNormal" },
  { value: "large", key: "textLarge" },
  { value: "largest", key: "textLargest" },
];

export function ReadingSettings() {
  const { t } = useLanguage();
  const {
    textScale,
    highContrast,
    reduceMotion,
    setTextScale,
    setHighContrast,
    setReduceMotion,
    reset,
  } = useAccessibility();

  return (
    <details className="reading-settings">
      <summary aria-label={t("accessibilityOpen")}>
        <span aria-hidden="true">Aa</span>
        <span>{t("accessibility")}</span>
      </summary>
      <div className="reading-settings__panel">
        <fieldset>
          <legend>{t("textSize")}</legend>
          <div className="reading-settings__sizes">
            {sizes.map(({ value, key }) => (
              <button
                type="button"
                key={value}
                aria-pressed={textScale === value}
                onClick={() => setTextScale(value)}
              >
                {t(key)}
              </button>
            ))}
          </div>
        </fieldset>
        <label>
          <input type="checkbox" checked={highContrast} onChange={(event) => setHighContrast(event.target.checked)} />
          <span>{t("highContrast")}</span>
        </label>
        <label>
          <input type="checkbox" checked={reduceMotion} onChange={(event) => setReduceMotion(event.target.checked)} />
          <span>{t("reduceMotion")}</span>
        </label>
        <button className="reading-settings__reset" type="button" onClick={reset}>{t("resetPreferences")}</button>
      </div>
    </details>
  );
}

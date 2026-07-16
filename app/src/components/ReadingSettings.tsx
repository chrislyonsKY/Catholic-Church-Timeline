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
        <div className="reading-settings__toggles">
          <button
            className="reading-settings__toggle"
            type="button"
            aria-pressed={highContrast}
            onClick={() => setHighContrast(!highContrast)}
          >
            <span className="reading-settings__toggle-copy">
              <strong>{t("highContrast")}</strong>
              <small>{t("highContrastDescription")}</small>
            </span>
            <span className="reading-settings__toggle-state">
              <span className="reading-settings__switch" aria-hidden="true" />
              <span>{highContrast ? t("settingOn") : t("settingOff")}</span>
            </span>
          </button>
          <button
            className="reading-settings__toggle"
            type="button"
            aria-pressed={reduceMotion}
            onClick={() => setReduceMotion(!reduceMotion)}
          >
            <span className="reading-settings__toggle-copy">
              <strong>{t("reduceMotion")}</strong>
              <small>{t("reduceMotionDescription")}</small>
            </span>
            <span className="reading-settings__toggle-state">
              <span className="reading-settings__switch" aria-hidden="true" />
              <span>{reduceMotion ? t("settingOn") : t("settingOff")}</span>
            </span>
          </button>
        </div>
        <button className="reading-settings__reset" type="button" onClick={reset}>{t("resetPreferences")}</button>
      </div>
    </details>
  );
}

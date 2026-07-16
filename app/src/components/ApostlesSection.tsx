import { useState } from "react";
import { apostles } from "../data";
import { useLanguage } from "../hooks/useLanguage";
import { buildPageUrl, copyText, localize } from "../utils";

export function ApostlesSection() {
  const { language, t } = useLanguage();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function shareProfile(id: string) {
    const copied = await copyText(buildPageUrl({ event: null }, `#apostle-${id}`));
    setCopiedId(copied ? id : null);
  }

  return (
    <section id="apostles" className="apostles-section section-shell" aria-labelledby="apostles-title">
      <header className="section-heading">
        <div>
          <p className="section-kicker">{t("apostlesKicker")}</p>
          <h2 id="apostles-title">{t("apostlesTitle")}</h2>
        </div>
        <p>{t("apostlesBody")}</p>
      </header>

      <ol className="apostle-register">
        {apostles.map((apostle, index) => (
          <li id={`apostle-${apostle.id}`} key={apostle.id}>
            <span className="apostle-register__number">{String(index + 1).padStart(2, "0")}</span>
            <span className="apostle-register__mark" aria-hidden="true">{apostle.mark}</span>
            <h3>{localize(apostle.name, language)}</h3>
            <p>{localize(apostle.note, language)}</p>
            <details>
              <summary>{t("moreDetails")}</summary>
              <dl>
                <div><dt>{t("scriptureLabel")}</dt><dd>{apostle.reference}</dd></div>
              </dl>
              {apostle.relatedEventId && <a href={buildPageUrl({ event: apostle.relatedEventId }, "#timeline")}>{t("connectedRecord")} <span aria-hidden="true">↗</span></a>}
              <button type="button" onClick={() => shareProfile(apostle.id)}>{copiedId === apostle.id ? t("linkCopied") : t("shareProfile")}</button>
            </details>
          </li>
        ))}
      </ol>

      <a className="primary-link apostles-link" href="https://www.vatican.va/content/benedict-xvi/en/audiences/2006.index.html" target="_blank" rel="noreferrer">
        {t("vaticanCatecheses")} <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}

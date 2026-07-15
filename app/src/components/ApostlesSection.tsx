import { apostles } from "../data";
import { useLanguage } from "../hooks/useLanguage";
import { localize } from "../utils";

export function ApostlesSection() {
  const { language, t } = useLanguage();

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
          <li key={apostle.id}>
            <span className="apostle-register__number">{String(index + 1).padStart(2, "0")}</span>
            <span className="apostle-register__mark" aria-hidden="true">{apostle.mark}</span>
            <h3>{localize(apostle.name, language)}</h3>
            <p>{localize(apostle.note, language)}</p>
          </li>
        ))}
      </ol>

      <a className="primary-link apostles-link" href="https://www.vatican.va/content/benedict-xvi/en/audiences/2006.index.html" target="_blank" rel="noreferrer">
        {t("vaticanCatecheses")} <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}

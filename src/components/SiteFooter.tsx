import { useLanguage } from "../hooks/useLanguage";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <div>
        <div>
          <p>{t("siteName")}</p>
          <span>{t("footerBody")}</span>
        </div>
        <nav aria-label={t("footerNavigation")}>
          <a className="footer-link" href="#sources">{t("navSources")}</a>
          <a className="footer-link" href="https://github.com/chrislyonsKY/Catholic-Church-Timeline">{t("sourceCode")}</a>
          <a className="footer-link" href="#top">{t("backToTop")} ↑</a>
        </nav>
      </div>
      <small>{t("originalCreditLine")}</small>
    </footer>
  );
}

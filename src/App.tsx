import { useState } from "react";
import { ApostlesSection } from "./components/ApostlesSection";
import { ChronologySection } from "./components/ChronologySection";
import { Hero } from "./components/Hero";
import { SaintsSection } from "./components/SaintsSection";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { SourcesSection } from "./components/SourcesSection";
import { TimelineExplorer } from "./components/TimelineExplorer";
import { LanguageProvider, useLanguage } from "./hooks/useLanguage";
import type { EraId } from "./types";

function TimelineSite() {
  const { t } = useLanguage();
  const [era, setEra] = useState<"all" | EraId>("all");

  function browseEra(nextEra: EraId) {
    setEra(nextEra);
    window.requestAnimationFrame(() => {
      document.getElementById("timeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <>
      <a className="skip-link" href="#main-content">{t("skip")}</a>
      <div id="top" />
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <ChronologySection onBrowseEra={browseEra} />
        <TimelineExplorer era={era} onEraChange={setEra} />
        <ApostlesSection />
        <SaintsSection />
        <SourcesSection />
      </main>
      <SiteFooter />
    </>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <TimelineSite />
    </LanguageProvider>
  );
}

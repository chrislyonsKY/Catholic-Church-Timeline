import { useState } from "react";
import { AccessibilityProvider } from "./hooks/useAccessibility";
import { ApostlesSection } from "./components/ApostlesSection";
import { ChronologySection } from "./components/ChronologySection";
import { Hero } from "./components/Hero";
import { GuidedTour } from "./components/GuidedTour";
import { SaintsSection } from "./components/SaintsSection";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { SourcesSection } from "./components/SourcesSection";
import { TimelineExplorer } from "./components/TimelineExplorer";
import { TraditionMap } from "./components/TraditionMap";
import { LanguageProvider, useLanguage } from "./hooks/useLanguage";
import type { EraId } from "./types";

function TimelineSite() {
  const { t } = useLanguage();
  const [era, setEra] = useState<"all" | EraId>("all");
  const [tourOpen, setTourOpen] = useState(false);

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
      <SiteHeader onStartTour={() => setTourOpen(true)} />
      <main id="main-content">
        <Hero onStartTour={() => setTourOpen(true)} />
        <ChronologySection onBrowseEra={browseEra} />
        <TimelineExplorer era={era} onEraChange={setEra} />
        <TraditionMap />
        <ApostlesSection />
        <SaintsSection />
        <SourcesSection />
      </main>
      <SiteFooter />
      <GuidedTour open={tourOpen} onClose={() => setTourOpen(false)} />
    </>
  );
}

export function App() {
  return (
    <AccessibilityProvider>
      <LanguageProvider>
        <TimelineSite />
      </LanguageProvider>
    </AccessibilityProvider>
  );
}

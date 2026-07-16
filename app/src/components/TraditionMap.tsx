import { useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
import type { LocalizedText } from "../types";
import { buildPageUrl, localize } from "../utils";

type Lane = "common" | "east" | "oriental" | "west" | "reform" | "renewal";

interface TraditionMilestone {
  id: string;
  year: string;
  lane: Lane;
  title: LocalizedText;
  summary: LocalizedText;
  eventId?: string;
  source?: string;
}

const text = (en: string, es: string, fr: string, pt: string): LocalizedText => ({ en, es, fr, pt });

const milestones: TraditionMilestone[] = [
  {
    id: "apostolic-communion", year: "AD 30", lane: "common",
    title: text("Apostolic communion", "Comunión apostólica", "Communion apostolique", "Comunhão apostólica"),
    summary: text("The first communities gather around apostolic preaching, baptism, Eucharist, prayer, and shared care.", "Las primeras comunidades se reúnen en torno a la predicación apostólica, el bautismo, la Eucaristía, la oración y el cuidado mutuo.", "Les premières communautés se rassemblent autour de la prédication apostolique, du baptême, de l’Eucharistie, de la prière et du soin mutuel.", "As primeiras comunidades reúnem-se em torno da pregação apostólica, do batismo, da Eucaristia, da oração e do cuidado comum."),
    eventId: "pentecost",
  },
  {
    id: "church-east", year: "431", lane: "east",
    title: text("Church of the East", "Iglesia del Oriente", "Église de l’Orient", "Igreja do Oriente"),
    summary: text("The reception of Ephesus and older differences in language, empire, and jurisdiction contribute to separation between churches of the Persian and Roman worlds.", "La recepción de Éfeso y diferencias anteriores de lengua, imperio y jurisdicción contribuyen a la separación entre las Iglesias de los mundos persa y romano.", "La réception d’Éphèse et d’anciennes différences de langue, d’empire et de juridiction contribuent à la séparation des Églises des mondes perse et romain.", "A recepção de Éfeso e diferenças anteriores de língua, império e jurisdição contribuem para a separação entre Igrejas dos mundos persa e romano."),
    eventId: "ephesus",
  },
  {
    id: "oriental-orthodox", year: "451", lane: "oriental",
    title: text("Oriental Orthodox churches", "Iglesias ortodoxas orientales", "Églises orthodoxes orientales", "Igrejas ortodoxas orientais"),
    summary: text("Disputes over the language and reception of Chalcedon produce lasting separation, later reconsidered through modern Christological dialogue.", "Las disputas sobre el lenguaje y la recepción de Calcedonia producen una separación duradera, reconsiderada después mediante el diálogo cristológico moderno.", "Les débats sur le langage et la réception de Chalcédoine entraînent une séparation durable, réexaminée par le dialogue christologique moderne.", "Disputas sobre a linguagem e a recepção de Calcedônia produzem separação duradoura, depois reconsiderada pelo diálogo cristológico moderno."),
    eventId: "chalcedon",
  },
  {
    id: "east-west", year: "1054", lane: "west",
    title: text("Catholic and Eastern Orthodox communion ruptures", "Ruptura entre la comunión católica y ortodoxa oriental", "Rupture entre communions catholique et orthodoxe", "Ruptura entre as comunhões católica e ortodoxa"),
    summary: text("The conventional date marks an accumulated estrangement shaped by authority, theology, language, politics, and later conflict—not a single instantaneous schism.", "La fecha convencional marca un distanciamiento acumulado por autoridad, teología, lengua, política y conflictos posteriores, no un cisma instantáneo.", "La date conventionnelle marque un éloignement cumulatif façonné par l’autorité, la théologie, la langue, la politique et les conflits ultérieurs, non un schisme instantané.", "A data convencional marca um afastamento acumulado por autoridade, teologia, língua, política e conflitos posteriores, não um cisma instantâneo."),
    eventId: "great-schism",
    source: "https://www.vatican.va/content/paul-vi/en/declarations/documents/hf_p-vi_decl_19651207_common-declaration.html",
  },
  {
    id: "protestant-reformations", year: "1517", lane: "reform",
    title: text("Protestant reformations", "Reformas protestantes", "Réformes protestantes", "Reformas protestantes"),
    summary: text("Controversies over authority, grace, worship, sacraments, and political order develop into Lutheran, Reformed, Anabaptist, and other traditions.", "Las controversias sobre autoridad, gracia, culto, sacramentos y orden político dan lugar a tradiciones luteranas, reformadas, anabaptistas y otras.", "Les controverses sur l’autorité, la grâce, le culte, les sacrements et l’ordre politique donnent naissance aux traditions luthériennes, réformées, anabaptistes et autres.", "Controvérsias sobre autoridade, graça, culto, sacramentos e ordem política desenvolvem tradições luteranas, reformadas, anabatistas e outras."),
    eventId: "reformation",
  },
  {
    id: "anglican-communion", year: "1534", lane: "reform",
    title: text("English Reformation and Anglican tradition", "Reforma inglesa y tradición anglicana", "Réforme anglaise et tradition anglicane", "Reforma inglesa e tradição anglicana"),
    summary: text("Royal supremacy, reform movements, and successive settlements reshape the Church of England and the later worldwide Anglican Communion.", "La supremacía real, los movimientos de reforma y acuerdos sucesivos transforman la Iglesia de Inglaterra y la posterior Comunión anglicana mundial.", "La suprématie royale, les mouvements réformateurs et les règlements successifs transforment l’Église d’Angleterre puis la Communion anglicane mondiale.", "A supremacia real, os movimentos de reforma e acordos sucessivos remodelam a Igreja da Inglaterra e a posterior Comunhão Anglicana mundial."),
  },
  {
    id: "catholic-renewal", year: "1545", lane: "renewal",
    title: text("Catholic reform and global mission", "Reforma católica y misión global", "Réforme catholique et mission mondiale", "Reforma católica e missão global"),
    summary: text("Trent, renewed religious communities, seminaries, spiritual reform, education, and worldwide missions reshape Catholic life.", "Trento, comunidades religiosas renovadas, seminarios, reforma espiritual, educación y misiones mundiales transforman la vida católica.", "Trente, les communautés renouvelées, les séminaires, la réforme spirituelle, l’éducation et les missions mondiales transforment la vie catholique.", "Trento, comunidades renovadas, seminários, reforma espiritual, educação e missões mundiais remodelam a vida católica."),
    eventId: "trent",
  },
  {
    id: "ecumenical-dialogue", year: "1964", lane: "renewal",
    title: text("Ecumenical dialogue", "Diálogo ecuménico", "Dialogue œcuménique", "Diálogo ecumênico"),
    summary: text("Vatican II commits the Catholic Church to prayer, conversion, study, and dialogue in pursuit of Christian unity while naming real doctrinal differences.", "El Vaticano II compromete a la Iglesia católica con la oración, la conversión, el estudio y el diálogo por la unidad cristiana, reconociendo diferencias doctrinales reales.", "Vatican II engage l’Église catholique dans la prière, la conversion, l’étude et le dialogue pour l’unité chrétienne, tout en reconnaissant de réelles différences doctrinales.", "O Vaticano II compromete a Igreja Católica com oração, conversão, estudo e diálogo pela unidade cristã, reconhecendo diferenças doutrinais reais."),
    eventId: "vatican-two",
    source: "https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_decree_19641121_unitatis-redintegratio_en.html",
  },
];

export function TraditionMap() {
  const { language, t } = useLanguage();
  const [activeId, setActiveId] = useState(milestones[0].id);
  const active = milestones.find(({ id }) => id === activeId) ?? milestones[0];

  return (
    <section id="traditions" className="traditions-section section-shell" aria-labelledby="traditions-title">
      <header className="section-heading">
        <div>
          <p className="section-kicker">{t("branchesKicker")}</p>
          <h2 id="traditions-title">{t("branchesTitle")}</h2>
        </div>
        <p>{t("branchesBody")}</p>
      </header>

      <div className="tradition-atlas">
        <div className="tradition-map" role="group" aria-label={t("branchMapLabel")}>
          <span className="tradition-map__trunk" aria-hidden="true" />
          {milestones.map((milestone) => (
            <button
              type="button"
              className={activeId === milestone.id ? "is-active" : ""}
              data-lane={milestone.lane}
              aria-pressed={activeId === milestone.id}
              onClick={() => setActiveId(milestone.id)}
              key={milestone.id}
            >
              <span>{milestone.year}</span>
              <strong>{localize(milestone.title, language)}</strong>
            </button>
          ))}
        </div>

        <aside className="tradition-detail" aria-live="polite">
          <p>{t("branchesInstruction")}</p>
          <span>{active.year}</span>
          <h3>{localize(active.title, language)}</h3>
          <p>{localize(active.summary, language)}</p>
          <div>
            {active.eventId && (
              <a href={buildPageUrl({ event: active.eventId }, "#timeline")}>{t("branchReadRecord")} <span aria-hidden="true">↗</span></a>
            )}
            {active.source && (
              <a href={active.source} target="_blank" rel="noreferrer">{t("branchSource")} <span aria-hidden="true">↗</span></a>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

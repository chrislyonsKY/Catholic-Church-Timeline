import content from "./content.json";
import type {
  Apostle,
  CategoryId,
  Era,
  LocalizedText,
  Saint,
  SaintPeriodId,
  TimelineEvent,
} from "../types";

export const events = content.events as TimelineEvent[];
export const saints = content.saints as Saint[];

export interface CategoryDefinition {
  id: CategoryId;
  label: LocalizedText;
  shortLabel: LocalizedText;
}

export const categories: CategoryDefinition[] = [
  { id: "apostles", label: { en: "Apostles", es: "Apóstoles" }, shortLabel: { en: "Apostles", es: "Apóstoles" } },
  { id: "saints", label: { en: "Saints", es: "Santos" }, shortLabel: { en: "Saints", es: "Santos" } },
  { id: "popes", label: { en: "Popes", es: "Papas" }, shortLabel: { en: "Popes", es: "Papas" } },
  { id: "councils", label: { en: "Councils", es: "Concilios" }, shortLabel: { en: "Councils", es: "Concilios" } },
  { id: "turning-points", label: { en: "Turning points", es: "Momentos decisivos" }, shortLabel: { en: "Turning points", es: "Momentos" } },
  { id: "documents", label: { en: "Documents", es: "Documentos" }, shortLabel: { en: "Documents", es: "Documentos" } },
];

export const eras: Era[] = [
  {
    id: "apostolic",
    number: "01",
    years: { en: "AD 30–312", es: "30–312 d. C." },
    title: { en: "Apostolic Church", es: "Iglesia apostólica" },
    thesis: {
      en: "Witness, mission, persecution, and the first structures of communion take shape around the apostolic proclamation.",
      es: "El testimonio, la misión, la persecución y las primeras estructuras de comunión toman forma en torno a la proclamación apostólica.",
    },
  },
  {
    id: "imperial",
    number: "02",
    years: { en: "313–800", es: "313–800 d. C." },
    title: { en: "Councils & Fathers", es: "Concilios y Padres" },
    thesis: {
      en: "Public toleration, ecumenical councils, monastic rules, and patristic theology reshape Christian life across the Roman world.",
      es: "La tolerancia pública, los concilios ecuménicos, las reglas monásticas y la teología patrística transforman la vida cristiana en el mundo romano.",
    },
  },
  {
    id: "medieval",
    number: "03",
    years: { en: "801–1516", es: "801–1516 d. C." },
    title: { en: "Medieval Church", es: "Iglesia medieval" },
    thesis: {
      en: "Monastic reform, mendicant movements, universities, papal government, division, and renewal unfold across a changing Europe.",
      es: "La reforma monástica, los movimientos mendicantes, las universidades, el gobierno papal, la división y la renovación se desarrollan en una Europa cambiante.",
    },
  },
  {
    id: "reformation",
    number: "04",
    years: { en: "1517–1788", es: "1517–1788 d. C." },
    title: { en: "Reformation & Renewal", es: "Reforma y renovación" },
    thesis: {
      en: "Western fracture, Catholic reform, global missions, new religious communities, and disciplined pastoral structures define the period.",
      es: "La fractura occidental, la reforma católica, las misiones globales, nuevas comunidades religiosas y estructuras pastorales disciplinadas definen el período.",
    },
  },
  {
    id: "modern",
    number: "05",
    years: { en: "1789–1957", es: "1789–1957 d. C." },
    title: { en: "Modern Church", es: "Iglesia moderna" },
    thesis: {
      en: "The Church responds to industrial society, nationalism, new states, mass communication, social upheaval, and global conflict.",
      es: "La Iglesia responde a la sociedad industrial, el nacionalismo, nuevos Estados, la comunicación de masas, la agitación social y el conflicto mundial.",
    },
  },
  {
    id: "contemporary",
    number: "06",
    years: { en: "1958–2026", es: "1958–2026 d. C." },
    title: { en: "Contemporary Church", es: "Iglesia contemporánea" },
    thesis: {
      en: "Conciliar renewal, global papal ministry, ecumenism, synodality, and engagement with modern cultures shape a worldwide Church.",
      es: "La renovación conciliar, el ministerio papal global, el ecumenismo, la sinodalidad y el diálogo con las culturas modernas configuran una Iglesia universal.",
    },
  },
];

export const apostles: Apostle[] = [
  { id: "peter", mark: "P", name: { en: "Peter", es: "Pedro" }, note: { en: "The Rock · first among the Twelve · witness at Rome", es: "La Roca · primero entre los Doce · testigo en Roma" } },
  { id: "andrew", mark: "A", name: { en: "Andrew", es: "Andrés" }, note: { en: "Brother of Peter · brings others to Jesus", es: "Hermano de Pedro · lleva a otros hasta Jesús" } },
  { id: "james-greater", mark: "J", name: { en: "James the Greater", es: "Santiago el Mayor" }, note: { en: "Son of Zebedee · first of the Twelve martyred", es: "Hijo de Zebedeo · primer mártir de los Doce" } },
  { id: "john", mark: "J", name: { en: "John", es: "Juan" }, note: { en: "Son of Zebedee · beloved disciple in Christian tradition", es: "Hijo de Zebedeo · discípulo amado en la tradición cristiana" } },
  { id: "philip", mark: "Ph", name: { en: "Philip", es: "Felipe" }, note: { en: "Called at Bethsaida · speaks with Jesus before the loaves", es: "Llamado en Betsaida · habla con Jesús antes de la multiplicación de los panes" } },
  { id: "bartholomew", mark: "B", name: { en: "Bartholomew", es: "Bartolomé" }, note: { en: "Traditionally identified with Nathanael", es: "Tradicionalmente identificado con Natanael" } },
  { id: "matthew", mark: "M", name: { en: "Matthew", es: "Mateo" }, note: { en: "Tax collector called from his post", es: "Recaudador de impuestos llamado desde su puesto" } },
  { id: "thomas", mark: "T", name: { en: "Thomas", es: "Tomás" }, note: { en: "Confesses: ‘My Lord and my God’", es: "Confiesa: «Señor mío y Dios mío»" } },
  { id: "james-less", mark: "J", name: { en: "James the Less", es: "Santiago el Menor" }, note: { en: "Son of Alphaeus · one of the Twelve", es: "Hijo de Alfeo · uno de los Doce" } },
  { id: "jude", mark: "Jd", name: { en: "Jude Thaddeus", es: "Judas Tadeo" }, note: { en: "Also called Judas, not Iscariot", es: "También llamado Judas, no el Iscariote" } },
  { id: "simon", mark: "S", name: { en: "Simon the Zealot", es: "Simón el Zelote" }, note: { en: "Named among the Twelve in the Gospels", es: "Nombrado entre los Doce en los Evangelios" } },
  { id: "matthias", mark: "Mt", name: { en: "Matthias", es: "Matías" }, note: { en: "Chosen to take Judas Iscariot’s place", es: "Elegido para ocupar el lugar de Judas Iscariote" } },
  { id: "paul", mark: "Pa", name: { en: "Paul", es: "Pablo" }, note: { en: "Apostle to the Gentiles · missionary and letter writer", es: "Apóstol de los gentiles · misionero y autor de cartas" } },
  { id: "barnabas", mark: "Ba", name: { en: "Barnabas", es: "Bernabé" }, note: { en: "Missionary companion · called an apostle in Acts", es: "Compañero de misión · llamado apóstol en Hechos" } },
  { id: "mary-magdalene", mark: "MM", name: { en: "Mary Magdalene", es: "María Magdalena" }, note: { en: "Witness of the Resurrection · ‘apostle to the apostles’", es: "Testigo de la Resurrección · «apóstol de los apóstoles»" } },
];

export interface SaintPeriodDefinition {
  id: "all" | SaintPeriodId;
  label: LocalizedText;
}

export const saintPeriods: SaintPeriodDefinition[] = [
  { id: "all", label: { en: "All periods", es: "Todos los períodos" } },
  { id: "early", label: { en: "Early witnesses", es: "Primeros testigos" } },
  { id: "founders", label: { en: "Fathers & founders", es: "Padres y fundadores" } },
  { id: "medieval", label: { en: "Medieval voices", es: "Voces medievales" } },
  { id: "renewal", label: { en: "Reform & mission", es: "Reforma y misión" } },
  { id: "modern", label: { en: "Modern witnesses", es: "Testigos modernos" } },
];

export const sourceRecords = [
  {
    number: "01",
    title: { en: "Official list of Supreme Pontiffs", es: "Lista oficial de Sumos Pontífices" },
    note: { en: "The Holy See · Peter through Leo XIV", es: "La Santa Sede · de Pedro a León XIV" },
    href: "https://www.vatican.va/content/vatican/en/holy-father.html",
  },
  {
    number: "02",
    title: { en: "Historical councils archive", es: "Archivo histórico de los concilios" },
    note: { en: "The Holy See · conciliar documents", es: "La Santa Sede · documentos conciliares" },
    href: "https://www.vatican.va/archive/hist_councils/index.htm",
  },
  {
    number: "03",
    title: { en: "Catechism of the Catholic Church", es: "Catecismo de la Iglesia católica" },
    note: { en: "Doctrine, worship, moral life, and prayer", es: "Doctrina, culto, vida moral y oración" },
    href: "https://www.vatican.va/archive/ENG0015/_INDEX.HTM",
  },
  {
    number: "04",
    title: { en: "New American Bible", es: "Nueva Biblia Americana" },
    note: { en: "USCCB · scriptural chronology and apostolic narratives", es: "USCCB · cronología bíblica y relatos apostólicos" },
    href: "https://bible.usccb.org/bible",
  },
] as const;

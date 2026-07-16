import content from "./content.json";
import additionalContent from "./content-extra.json";
import type {
  Apostle,
  CategoryId,
  Era,
  Language,
  LocalizedText,
  Saint,
  SaintPeriodId,
  TimelineEvent,
} from "../types";

type BaseLanguage = "en" | "es";
type AdditionalLanguage = Exclude<Language, BaseLanguage>;
type BaseLocalizedText = Record<BaseLanguage, string>;

interface AdditionalEventTranslation {
  title: string;
  summary: string;
  detail: string;
}

interface AdditionalSaintTranslation {
  name: string;
  dates: string;
  place: string;
  note: string;
}

interface AdditionalContent {
  fr: {
    events: Record<string, AdditionalEventTranslation>;
    saints: Record<string, AdditionalSaintTranslation>;
  };
  pt: {
    events: Record<string, AdditionalEventTranslation>;
    saints: Record<string, AdditionalSaintTranslation>;
  };
}

interface BaseEvent extends Omit<TimelineEvent, "yearLabel" | "title" | "summary" | "detail" | "people"> {
  yearLabel: BaseLocalizedText;
  title: BaseLocalizedText;
  summary: BaseLocalizedText;
  detail: BaseLocalizedText;
  people: Record<BaseLanguage, string[]>;
}

interface BaseSaint extends Omit<Saint, "name" | "dates" | "place" | "note"> {
  name: BaseLocalizedText;
  dates: BaseLocalizedText;
  place: BaseLocalizedText;
  note: BaseLocalizedText;
}

const extra = additionalContent as AdditionalContent;
const base = content as { events: BaseEvent[]; saints: BaseSaint[] };

function text(en: string, es: string, fr: string, pt: string): LocalizedText {
  return { en, es, fr, pt };
}

function translateYearLabel(value: string, language: AdditionalLanguage): string {
  const approximate = value.startsWith("c. ");
  const years = value.replace(/^c\. AD /, "").replace(/^AD /, "");
  const localizedYears = years.replace("present", language === "fr" ? "aujourd’hui" : "presente");
  if (language === "fr") return `${approximate ? "v. " : ""}${localizedYears} apr. J.-C.`;
  return `${approximate ? "c. " : ""}${localizedYears} d.C.`;
}

const personNames: Record<AdditionalLanguage, Record<string, string>> = {
  fr: {
    Peter: "Pierre", "The Twelve": "Les Douze", Mary: "Marie", "The first disciples": "Les premiers disciples",
    James: "Jacques", "Clement I": "Clément Ier", "Ignatius of Antioch": "Ignace d’Antioche", "Irenaeus of Lyon": "Irénée de Lyon",
    "Hosius of Cordoba": "Ossius de Cordoue", "Gregory of Nazianzus": "Grégoire de Nazianze", "Cyril of Alexandria": "Cyrille d’Alexandrie",
    "Leo the Great": "Léon le Grand", "Benedict of Nursia": "Benoît de Nursie", "Gregory I": "Grégoire Ier", "Augustine of Canterbury": "Augustin de Cantorbéry",
    "Francis of Assisi": "François d’Assise", "Clare of Assisi": "Claire d’Assise", "Thomas Aquinas": "Thomas d’Aquin", "Martin Luther": "Martin Luther",
    "Ignatius of Loyola": "Ignace de Loyola", "Francis Xavier": "François Xavier", "John XXIII": "Jean XXIII", "John Paul II": "Jean-Paul II",
    Stephen: "Étienne", "Augustine of Hippo": "Augustin d’Hippone", "Patrick of Ireland": "Patrick d’Irlande", "Irene of Athens": "Irène d’Athènes",
    "Cyril": "Cyrille", "Methodius": "Méthode", "William I of Aquitaine": "Guillaume Ier d’Aquitaine", "John of the Cross": "Jean de la Croix",
    "Vincent de Paul": "Vincent de Paul", Francis: "François", "Leo XIV": "Léon XIV",
  },
  pt: {
    Peter: "Pedro", "The Twelve": "Os Doze", Mary: "Maria", "The first disciples": "Os primeiros discípulos", James: "Tiago",
    "Clement I": "Clemente I", "Ignatius of Antioch": "Inácio de Antioquia", "Irenaeus of Lyon": "Irineu de Lião", "Hosius of Cordoba": "Ósio de Córdoba",
    "Gregory of Nazianzus": "Gregório de Nazianzo", "Cyril of Alexandria": "Cirilo de Alexandria", "Leo the Great": "Leão Magno",
    "Benedict of Nursia": "Bento de Núrsia", "Gregory I": "Gregório I", "Augustine of Canterbury": "Agostinho de Cantuária",
    "Francis of Assisi": "Francisco de Assis", "Clare of Assisi": "Clara de Assis", "Thomas Aquinas": "Tomás de Aquino", "Martin Luther": "Martinho Lutero",
    "Ignatius of Loyola": "Inácio de Loyola", "Francis Xavier": "Francisco Xavier", "John XXIII": "João XXIII", "John Paul II": "João Paulo II",
    Stephen: "Estêvão", "Augustine of Hippo": "Agostinho de Hipona", "Patrick of Ireland": "Patrício da Irlanda", "Irene of Athens": "Irene de Atenas",
    Cyril: "Cirilo", Methodius: "Metódio", "William I of Aquitaine": "Guilherme I da Aquitânia", "John of the Cross": "João da Cruz",
    "Vincent de Paul": "Vicente de Paulo", Francis: "Francisco", "Leo XIV": "Leão XIV",
  },
};

export const events: TimelineEvent[] = base.events.map((event) => {
  const fr = extra.fr.events[event.id];
  const pt = extra.pt.events[event.id];
  return {
    ...event,
    yearLabel: text(event.yearLabel.en, event.yearLabel.es, translateYearLabel(event.yearLabel.en, "fr"), translateYearLabel(event.yearLabel.en, "pt")),
    title: text(event.title.en, event.title.es, fr.title, pt.title),
    summary: text(event.summary.en, event.summary.es, fr.summary, pt.summary),
    detail: text(event.detail.en, event.detail.es, fr.detail, pt.detail),
    people: {
      ...event.people,
      fr: event.people.en.map((name) => personNames.fr[name] ?? name),
      pt: event.people.en.map((name) => personNames.pt[name] ?? name),
    },
  };
});

const saintEventIds: Record<string, string> = {
  stephen: "stephen-martyr", "ignatius-of-antioch": "ignatius-antioch", "perpetua-felicity": "perpetua-felicity", "irenaeus-of-lyon": "irenaeus",
  "monica-augustine": "augustine-hippo", jerome: "vulgate", patrick: "patrick-ireland", "benedict-scholastica": "benedict-rule",
  "gregory-the-great": "gregory-great", "cyril-methodius": "cyril-methodius", "francis-clare": "francis", dominic: "dominicans-approved",
  "thomas-aquinas": "aquinas", "teresa-of-avila": "teresa-reform", "ignatius-francis-xavier": "jesuits", "vincent-louise": "vincent-charity",
  "john-paul-ii": "john-paul-two",
};

export const saints: Saint[] = base.saints.map((saint) => {
  const fr = extra.fr.saints[saint.id];
  const pt = extra.pt.saints[saint.id];
  return {
    ...saint,
    name: text(saint.name.en, saint.name.es, fr.name, pt.name),
    dates: text(saint.dates.en, saint.dates.es, fr.dates, pt.dates),
    place: text(saint.place.en, saint.place.es, fr.place, pt.place),
    note: text(saint.note.en, saint.note.es, fr.note, pt.note),
    relatedEventId: saintEventIds[saint.id],
  };
});

export interface CategoryDefinition {
  id: CategoryId;
  label: LocalizedText;
  shortLabel: LocalizedText;
}

export const categories: CategoryDefinition[] = [
  { id: "apostles", label: text("Apostles", "Apóstoles", "Apôtres", "Apóstolos"), shortLabel: text("Apostles", "Apóstoles", "Apôtres", "Apóstolos") },
  { id: "saints", label: text("Saints", "Santos", "Saints", "Santos"), shortLabel: text("Saints", "Santos", "Saints", "Santos") },
  { id: "popes", label: text("Popes", "Papas", "Papes", "Papas"), shortLabel: text("Popes", "Papas", "Papes", "Papas") },
  { id: "councils", label: text("Councils", "Concilios", "Conciles", "Concílios"), shortLabel: text("Councils", "Concilios", "Conciles", "Concílios") },
  { id: "turning-points", label: text("Turning points", "Momentos decisivos", "Tournants", "Momentos decisivos"), shortLabel: text("Turning points", "Momentos", "Tournants", "Momentos") },
  { id: "documents", label: text("Documents", "Documentos", "Documents", "Documentos"), shortLabel: text("Documents", "Documentos", "Documents", "Documentos") },
];

export const eras: Era[] = [
  { id: "apostolic", number: "01", years: text("AD 30–312", "30–312 d. C.", "30–312 apr. J.-C.", "30–312 d.C."), title: text("Apostolic Church", "Iglesia apostólica", "Église apostolique", "Igreja apostólica"), thesis: text("Witness, mission, persecution, and the first structures of communion take shape around the apostolic proclamation.", "El testimonio, la misión, la persecución y las primeras estructuras de comunión toman forma en torno a la proclamación apostólica.", "Témoignage, mission, persécution et premières structures de communion prennent forme autour de la proclamation apostolique.", "Testemunho, missão, perseguição e as primeiras estruturas de comunhão tomam forma ao redor da proclamação apostólica.") },
  { id: "imperial", number: "02", years: text("313–800", "313–800 d. C.", "313–800 apr. J.-C.", "313–800 d.C."), title: text("Councils & Fathers", "Concilios y Padres", "Conciles et Pères", "Concílios e Padres"), thesis: text("Public toleration, ecumenical councils, monastic rules, and patristic theology reshape Christian life across the Roman world.", "La tolerancia pública, los concilios ecuménicos, las reglas monásticas y la teología patrística transforman la vida cristiana en el mundo romano.", "La tolérance publique, les conciles œcuméniques, les règles monastiques et la théologie patristique transforment la vie chrétienne dans le monde romain.", "A tolerância pública, os concílios ecumênicos, as regras monásticas e a teologia patrística remodelam a vida cristã no mundo romano.") },
  { id: "medieval", number: "03", years: text("801–1516", "801–1516 d. C.", "801–1516 apr. J.-C.", "801–1516 d.C."), title: text("Medieval Church", "Iglesia medieval", "Église médiévale", "Igreja medieval"), thesis: text("Monastic reform, mendicant movements, universities, papal government, division, and renewal unfold across a changing Europe.", "La reforma monástica, los movimientos mendicantes, las universidades, el gobierno papal, la división y la renovación se desarrollan en una Europa cambiante.", "Réforme monastique, mouvements mendiants, universités, gouvernement pontifical, divisions et renouveau se déploient dans une Europe en mutation.", "Reforma monástica, movimentos mendicantes, universidades, governo papal, divisões e renovação se desenvolvem numa Europa em mudança.") },
  { id: "reformation", number: "04", years: text("1517–1788", "1517–1788 d. C.", "1517–1788 apr. J.-C.", "1517–1788 d.C."), title: text("Reformation & Renewal", "Reforma y renovación", "Réforme et renouveau", "Reforma e renovação"), thesis: text("Western fracture, Catholic reform, global missions, new religious communities, and disciplined pastoral structures define the period.", "La fractura occidental, la reforma católica, las misiones globales, nuevas comunidades religiosas y estructuras pastorales disciplinadas definen el período.", "Fracture occidentale, réforme catholique, missions mondiales, nouvelles communautés religieuses et structures pastorales organisées définissent la période.", "Fratura ocidental, reforma católica, missões globais, novas comunidades religiosas e estruturas pastorais disciplinadas definem o período.") },
  { id: "modern", number: "05", years: text("1789–1957", "1789–1957 d. C.", "1789–1957 apr. J.-C.", "1789–1957 d.C."), title: text("Modern Church", "Iglesia moderna", "Église moderne", "Igreja moderna"), thesis: text("The Church responds to industrial society, nationalism, new states, mass communication, social upheaval, and global conflict.", "La Iglesia responde a la sociedad industrial, el nacionalismo, nuevos Estados, la comunicación de masas, la agitación social y el conflicto mundial.", "L’Église répond à la société industrielle, au nationalisme, aux nouveaux États, aux communications de masse, aux bouleversements sociaux et aux conflits mondiaux.", "A Igreja responde à sociedade industrial, ao nacionalismo, aos novos Estados, à comunicação de massa, às convulsões sociais e aos conflitos mundiais.") },
  { id: "contemporary", number: "06", years: text("1958–2026", "1958–2026 d. C.", "1958–2026 apr. J.-C.", "1958–2026 d.C."), title: text("Contemporary Church", "Iglesia contemporánea", "Église contemporaine", "Igreja contemporânea"), thesis: text("Conciliar renewal, global papal ministry, ecumenism, synodality, and engagement with modern cultures shape a worldwide Church.", "La renovación conciliar, el ministerio papal global, el ecumenismo, la sinodalidad y el diálogo con las culturas modernas configuran una Iglesia universal.", "Renouveau conciliaire, ministère pontifical mondial, œcuménisme, synodalité et dialogue avec les cultures modernes façonnent une Église universelle.", "Renovação conciliar, ministério papal global, ecumenismo, sinodalidade e diálogo com as culturas modernas moldam uma Igreja mundial.") },
];

export const apostles: Apostle[] = [
  { id: "peter", mark: "P", name: text("Peter", "Pedro", "Pierre", "Pedro"), note: text("The Rock · first among the Twelve · witness at Rome", "La Roca · primero entre los Doce · testigo en Roma", "Le Roc · premier parmi les Douze · témoin à Rome", "A Rocha · primeiro entre os Doze · testemunha em Roma"), reference: "Mt 16:13–19 · Lk 22:31–32 · Jn 21:15–19", relatedEventId: "peter-paul-martyrdom" },
  { id: "andrew", mark: "A", name: text("Andrew", "Andrés", "André", "André"), note: text("Brother of Peter · brings others to Jesus", "Hermano de Pedro · lleva a otros hasta Jesús", "Frère de Pierre · conduit d’autres personnes à Jésus", "Irmão de Pedro · conduz outros a Jesus"), reference: "Jn 1:35–42 · Mk 1:16–18" },
  { id: "james-greater", mark: "J", name: text("James the Greater", "Santiago el Mayor", "Jacques le Majeur", "Tiago Maior"), note: text("Son of Zebedee · first of the Twelve martyred", "Hijo de Zebedeo · primer mártir de los Doce", "Fils de Zébédée · premier des Douze à subir le martyre", "Filho de Zebedeu · primeiro dos Doze a ser martirizado"), reference: "Mk 1:19–20 · Acts 12:1–2" },
  { id: "john", mark: "J", name: text("John", "Juan", "Jean", "João"), note: text("Son of Zebedee · beloved disciple in Christian tradition", "Hijo de Zebedeo · discípulo amado en la tradición cristiana", "Fils de Zébédée · disciple bien-aimé dans la tradition chrétienne", "Filho de Zebedeu · discípulo amado na tradição cristã"), reference: "Jn 13:23–26 · Jn 19:25–27 · Acts 3–4" },
  { id: "philip", mark: "Ph", name: text("Philip", "Felipe", "Philippe", "Filipe"), note: text("Called at Bethsaida · speaks with Jesus before the loaves", "Llamado en Betsaida · habla con Jesús antes de la multiplicación de los panes", "Appelé à Bethsaïde · dialogue avec Jésus avant les pains", "Chamado em Betsaida · fala com Jesus antes dos pães"), reference: "Jn 1:43–46 · Jn 6:5–7 · Jn 14:8–11" },
  { id: "bartholomew", mark: "B", name: text("Bartholomew", "Bartolomé", "Barthélemy", "Bartolomeu"), note: text("Traditionally identified with Nathanael", "Tradicionalmente identificado con Natanael", "Traditionnellement identifié à Nathanaël", "Tradicionalmente identificado com Natanael"), reference: "Mt 10:3 · Mk 3:18 · Lk 6:14" },
  { id: "matthew", mark: "M", name: text("Matthew", "Mateo", "Matthieu", "Mateus"), note: text("Tax collector called from his post", "Recaudador de impuestos llamado desde su puesto", "Collecteur d’impôts appelé à son poste", "Cobrador de impostos chamado de seu posto"), reference: "Mt 9:9–13 · Mt 10:3" },
  { id: "thomas", mark: "T", name: text("Thomas", "Tomás", "Thomas", "Tomé"), note: text("Confesses: ‘My Lord and my God’", "Confiesa: «Señor mío y Dios mío»", "Confesse : « Mon Seigneur et mon Dieu »", "Confessa: ‘Meu Senhor e meu Deus’"), reference: "Jn 11:16 · Jn 20:24–29" },
  { id: "james-less", mark: "J", name: text("James the Less", "Santiago el Menor", "Jacques le Mineur", "Tiago Menor"), note: text("Son of Alphaeus · one of the Twelve", "Hijo de Alfeo · uno de los Doce", "Fils d’Alphée · l’un des Douze", "Filho de Alfeu · um dos Doze"), reference: "Mk 3:18 · Mt 10:3" },
  { id: "jude", mark: "Jd", name: text("Jude Thaddeus", "Judas Tadeo", "Jude Thaddée", "Judas Tadeu"), note: text("Also called Judas, not Iscariot", "También llamado Judas, no el Iscariote", "Aussi appelé Judas, non pas l’Iscariote", "Também chamado Judas, não o Iscariotes"), reference: "Lk 6:16 · Jn 14:22" },
  { id: "simon", mark: "S", name: text("Simon the Zealot", "Simón el Zelote", "Simon le Zélote", "Simão, o Zelote"), note: text("Named among the Twelve in the Gospels", "Nombrado entre los Doce en los Evangelios", "Nommé parmi les Douze dans les Évangiles", "Nomeado entre os Doze nos Evangelhos"), reference: "Lk 6:15 · Acts 1:13" },
  { id: "matthias", mark: "Mt", name: text("Matthias", "Matías", "Matthias", "Matias"), note: text("Chosen to take Judas Iscariot’s place", "Elegido para ocupar el lugar de Judas Iscariote", "Choisi pour prendre la place de Judas Iscariote", "Escolhido para ocupar o lugar de Judas Iscariotes"), reference: "Acts 1:15–26", relatedEventId: "pentecost" },
  { id: "paul", mark: "Pa", name: text("Paul", "Pablo", "Paul", "Paulo"), note: text("Apostle to the Gentiles · missionary and letter writer", "Apóstol de los gentiles · misionero y autor de cartas", "Apôtre des nations · missionnaire et épistolier", "Apóstolo dos gentios · missionário e autor de cartas"), reference: "Acts 9 · Gal 1–2", relatedEventId: "paul-conversion" },
  { id: "barnabas", mark: "Ba", name: text("Barnabas", "Bernabé", "Barnabé", "Barnabé"), note: text("Missionary companion · called an apostle in Acts", "Compañero de misión · llamado apóstol en Hechos", "Compagnon de mission · appelé apôtre dans les Actes", "Companheiro de missão · chamado apóstolo em Atos"), reference: "Acts 4:36–37 · Acts 9:27 · Acts 11–15", relatedEventId: "jerusalem-council" },
  { id: "mary-magdalene", mark: "MM", name: text("Mary Magdalene", "María Magdalena", "Marie Madeleine", "Maria Madalena"), note: text("Witness of the Resurrection · ‘apostle to the apostles’", "Testigo de la Resurrección · «apóstol de los apóstoles»", "Témoin de la Résurrection · « apôtre des apôtres »", "Testemunha da Ressurreição · ‘apóstola dos apóstolos’"), reference: "Lk 8:1–3 · Jn 20:1–18" },
];

export interface SaintPeriodDefinition { id: "all" | SaintPeriodId; label: LocalizedText; }
export const saintPeriods: SaintPeriodDefinition[] = [
  { id: "all", label: text("All periods", "Todos los períodos", "Toutes les périodes", "Todos os períodos") },
  { id: "early", label: text("Early witnesses", "Primeros testigos", "Premiers témoins", "Primeiras testemunhas") },
  { id: "founders", label: text("Fathers & founders", "Padres y fundadores", "Pères et fondateurs", "Padres e fundadores") },
  { id: "medieval", label: text("Medieval voices", "Voces medievales", "Voix médiévales", "Vozes medievais") },
  { id: "renewal", label: text("Reform & mission", "Reforma y misión", "Réforme et mission", "Reforma e missão") },
  { id: "modern", label: text("Modern witnesses", "Testigos modernos", "Témoins modernes", "Testemunhas modernas") },
];

export const sourceRecords = [
  { number: "01", title: text("Official list of Supreme Pontiffs", "Lista oficial de Sumos Pontífices", "Liste officielle des Souverains Pontifes", "Lista oficial dos Sumos Pontífices"), note: text("The Holy See · Peter through Leo XIV", "La Santa Sede · de Pedro a León XIV", "Le Saint-Siège · de Pierre à Léon XIV", "A Santa Sé · de Pedro a Leão XIV"), href: "https://www.vatican.va/content/vatican/en/holy-father.html" },
  { number: "02", title: text("Historical councils archive", "Archivo histórico de los concilios", "Archives historiques des conciles", "Arquivo histórico dos concílios"), note: text("The Holy See · conciliar documents", "La Santa Sede · documentos conciliares", "Le Saint-Siège · documents conciliaires", "A Santa Sé · documentos conciliares"), href: "https://www.vatican.va/archive/hist_councils/index.htm" },
  { number: "03", title: text("Catechism of the Catholic Church", "Catecismo de la Iglesia católica", "Catéchisme de l’Église catholique", "Catecismo da Igreja Católica"), note: text("Doctrine, worship, moral life, and prayer", "Doctrina, culto, vida moral y oración", "Doctrine, culte, vie morale et prière", "Doutrina, culto, vida moral e oração"), href: "https://www.vatican.va/archive/ENG0015/_INDEX.HTM" },
  { number: "04", title: text("New American Bible", "Nueva Biblia Americana", "New American Bible", "Nova Bíblia Americana"), note: text("USCCB · scriptural chronology and apostolic narratives", "USCCB · cronología bíblica y relatos apostólicos", "USCCB · chronologie scripturaire et récits apostoliques", "USCCB · cronologia bíblica e narrativas apostólicas"), href: "https://bible.usccb.org/bible" },
] as const;

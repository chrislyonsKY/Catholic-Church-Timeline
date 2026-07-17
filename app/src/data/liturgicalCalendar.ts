import lectionaryReferenceData from "./lectionaryReferences.json";
import type { Language } from "../types";

export const officialCalendarYears = [2026, 2027, 2028] as const;
export type OfficialCalendarYear = (typeof officialCalendarYears)[number];

export type LiturgicalColor = "RED" | "ROSE" | "PURPLE" | "GREEN" | "WHITE" | "GOLD" | "BLACK";
export type LiturgicalSeason = "ADVENT" | "CHRISTMAS_TIME" | "LENT" | "PASCHAL_TRIDUUM" | "EASTER_TIME" | "ORDINARY_TIME";
export type LiturgicalRank = "SOLEMNITY" | "SUNDAY" | "FEAST" | "MEMORIAL" | "OPTIONAL_MEMORIAL" | "WEEKDAY";

export interface LiturgicalCycles {
  properCycle: string;
  sundayCycle: string;
  weekdayCycle: string;
  psalterWeek: string;
}

export interface LiturgicalCelebration {
  id: string;
  date: string;
  name: string;
  rank: LiturgicalRank;
  colors: LiturgicalColor[];
  seasons: LiturgicalSeason[];
  cycles: LiturgicalCycles;
  isHolyDayOfObligation: boolean;
  isOptional: boolean;
}

export type LiturgicalCalendar = Record<string, LiturgicalCelebration[]>;

interface LectionaryReferenceData {
  source: string;
  sourcePage: string;
  editions: Record<string, string>;
  verifiedOn: string;
  years: Record<string, Record<string, string[]>>;
}

interface SerializedCelebration {
  i: string;
  n: string;
  r: LiturgicalRank;
  c: LiturgicalColor[];
  s: LiturgicalSeason[];
  y: [string, string, string, string];
  h: boolean;
  o: boolean;
}

type SerializedCalendar = Record<string, SerializedCelebration[]>;

interface SerializedCalendarData {
  metadata: {
    rite: string;
    calendar: string;
    romcal: string;
    calendarBundle: string;
    generatedOn: string;
  };
  sunday: Record<string, SerializedCalendar>;
  thursdayOverrides: Record<string, SerializedCalendar>;
}

export type ArchiveConnection =
  | { kind: "event"; id: string }
  | { kind: "saint"; id: string };

const references = lectionaryReferenceData as LectionaryReferenceData;
const calendarDataLoaders: Record<Language, () => Promise<SerializedCalendarData>> = {
  en: () => import("./liturgicalCalendars/en.json").then(({ default: data }) => data as unknown as SerializedCalendarData),
  es: () => import("./liturgicalCalendars/es.json").then(({ default: data }) => data as unknown as SerializedCalendarData),
  fr: () => import("./liturgicalCalendars/fr.json").then(({ default: data }) => data as unknown as SerializedCalendarData),
  pt: () => import("./liturgicalCalendars/pt.json").then(({ default: data }) => data as unknown as SerializedCalendarData),
};

const localizedNameOverrides: Partial<Record<string, Record<Language, string>>> = {
  john_nepomucene_neumann_bishop: {
    en: "Saint John Neumann, Bishop", es: "San Juan Neumann, obispo", fr: "Saint Jean Neumann, évêque", pt: "São João Neumann, bispo",
  },
  andre_bessette_religious: {
    en: "Saint André Bessette, Religious", es: "San André Bessette, religioso", fr: "Saint André Bessette, religieux", pt: "Santo André Bessette, religioso",
  },
  marianne_cope_virgin: {
    en: "Saint Marianne Cope, Virgin", es: "Santa Mariana Cope, virgen", fr: "Sainte Marianne Cope, vierge", pt: "Santa Mariana Cope, virgem",
  },
  katharine_drexel_virgin: {
    en: "Saint Katharine Drexel, Virgin", es: "Santa Catalina Drexel, virgen", fr: "Sainte Katharine Drexel, vierge", pt: "Santa Catarina Drexel, virgem",
  },
  isidore_the_farmer: {
    en: "Saint Isidore", es: "San Isidro Labrador", fr: "Saint Isidore le Laboureur", pt: "Santo Isidoro Lavrador",
  },
  junipero_serra_priest: {
    en: "Saint Junípero Serra, Priest", es: "San Junípero Serra, presbítero", fr: "Saint Junípero Serra, prêtre", pt: "São Junípero Serra, presbítero",
  },
  kateri_tekakwitha_virgin: {
    en: "Saint Kateri Tekakwitha, Virgin", es: "Santa Kateri Tekakwitha, virgen", fr: "Sainte Kateri Tekakwitha, vierge", pt: "Santa Kateri Tekakwitha, virgem",
  },
  francis_xavier_seelos_priest: {
    en: "Blessed Francis Xavier Seelos, Priest", es: "Beato Francisco Javier Seelos, presbítero", fr: "Bienheureux François-Xavier Seelos, prêtre", pt: "Beato Francisco Xavier Seelos, presbítero",
  },
  marie_rose_durocher_virgin: {
    en: "Blessed Marie-Rose Durocher, Virgin", es: "Beata María Rosa Durocher, virgen", fr: "Bienheureuse Marie-Rose Durocher, vierge", pt: "Beata Marie-Rose Durocher, virgem",
  },
  frances_xavier_cabrini_virgin: {
    en: "Saint Frances Xavier Cabrini, Virgin", es: "Santa Francisca Javiera Cabrini, virgen", fr: "Sainte Françoise-Xavière Cabrini, vierge", pt: "Santa Francisca Xavier Cabrini, virgem",
  },
  rose_philippine_duchesne_virgin: {
    en: "Saint Rose Philippine Duchesne, Virgin", es: "Santa Rosa Filipina Duchesne, virgen", fr: "Sainte Rose-Philippine Duchesne, vierge", pt: "Santa Rosa Filipina Duchesne, virgem",
  },
  miguel_agustin_pro_priest: {
    en: "Blessed Miguel Agustín Pro, Priest and Martyr", es: "Beato Miguel Agustín Pro, presbítero y mártir", fr: "Bienheureux Miguel Agustín Pro, prêtre et martyr", pt: "Beato Miguel Agustín Pro, presbítero e mártir",
  },
  immaculate_conception_of_the_blessed_virgin_mary: {
    en: "The Immaculate Conception of the Blessed Virgin Mary, Patroness of the USA",
    es: "La Inmaculada Concepción de la Bienaventurada Virgen María, patrona de los Estados Unidos",
    fr: "L’Immaculée Conception de la Bienheureuse Vierge Marie, patronne des États-Unis",
    pt: "A Imaculada Conceição da Bem-aventurada Virgem Maria, padroeira dos Estados Unidos",
  },
  our_lady_of_guadalupe: {
    en: "Our Lady of Guadalupe, Patroness of the Americas", es: "Nuestra Señora de Guadalupe, patrona de las Américas", fr: "Notre-Dame de Guadalupe, patronne des Amériques", pt: "Nossa Senhora de Guadalupe, padroeira das Américas",
  },
};

const archiveConnections: Record<string, ArchiveConnection[]> = {
  pentecost_sunday: [{ kind: "event", id: "pentecost" }],
  peter_and_paul_apostles: [{ kind: "event", id: "peter-paul-martyrdom" }],
  stephen_the_first_martyr: [{ kind: "saint", id: "stephen" }, { kind: "event", id: "stephen-martyr" }],
  ignatius_of_antioch_bishop: [{ kind: "saint", id: "ignatius-of-antioch" }, { kind: "event", id: "ignatius-antioch" }],
  athanasius_of_alexandria_bishop: [{ kind: "saint", id: "athanasius" }],
  augustine_of_hippo_bishop: [{ kind: "saint", id: "monica-augustine" }, { kind: "event", id: "augustine-hippo" }],
  jerome_of_stridon_priest: [{ kind: "saint", id: "jerome" }, { kind: "event", id: "vulgate" }],
  patrick_of_ireland_bishop: [{ kind: "saint", id: "patrick" }, { kind: "event", id: "patrick-ireland" }],
  benedict_of_nursia_abbot: [{ kind: "saint", id: "benedict-scholastica" }, { kind: "event", id: "benedict-rule" }],
  gregory_i_the_great_pope: [{ kind: "saint", id: "gregory-the-great" }, { kind: "event", id: "gregory-great" }],
  cyril_constantine_the_philosopher_monk_and_methodius_michael_of_thessaloniki_bishop: [{ kind: "saint", id: "cyril-methodius" }, { kind: "event", id: "cyril-methodius" }],
  hildegard_of_bingen_abbess: [{ kind: "saint", id: "hildegard-of-bingen" }],
  francis_of_assisi_religious: [{ kind: "saint", id: "francis-clare" }, { kind: "event", id: "francis" }],
  dominic_de_guzman_priest: [{ kind: "saint", id: "dominic" }, { kind: "event", id: "dominicans-approved" }],
  thomas_aquinas_priest: [{ kind: "saint", id: "thomas-aquinas" }, { kind: "event", id: "aquinas" }],
  catherine_of_siena_virgin: [{ kind: "saint", id: "catherine-of-siena" }],
  teresa_of_jesus_of_avila_virgin: [{ kind: "saint", id: "teresa-of-avila" }, { kind: "event", id: "teresa-reform" }],
  ignatius_of_loyola_priest: [{ kind: "saint", id: "ignatius-francis-xavier" }, { kind: "event", id: "jesuits" }],
  francis_xavier_priest: [{ kind: "saint", id: "ignatius-francis-xavier" }, { kind: "event", id: "jesuits" }],
  vincent_de_paul_priest: [{ kind: "saint", id: "vincent-louise" }, { kind: "event", id: "vincent-charity" }],
  kateri_tekakwitha_virgin: [{ kind: "saint", id: "kateri-tekakwitha" }],
  therese_of_the_child_jesus_and_the_holy_face_of_lisieux_virgin: [{ kind: "saint", id: "therese-of-lisieux" }],
  maximilian_mary_raymund_kolbe_priest: [{ kind: "saint", id: "maximilian-kolbe" }],
  teresa_of_calcutta_virgin: [{ kind: "saint", id: "teresa-of-calcutta" }],
  john_paul_ii_pope: [{ kind: "saint", id: "john-paul-ii" }, { kind: "event", id: "john-paul-two" }],
  our_lady_of_guadalupe: [{ kind: "event", id: "guadalupe" }],
  immaculate_conception_of_the_blessed_virgin_mary: [{ kind: "event", id: "immaculate-conception" }],
  assumption_of_the_blessed_virgin_mary: [{ kind: "event", id: "assumption-defined" }],
};

const calendarCache = new Map<string, Promise<LiturgicalCalendar>>();

function hydrateCalendar(calendar: SerializedCalendar, language: Language): LiturgicalCalendar {
  return Object.fromEntries(Object.entries(calendar).map(([date, days]) => [
    date,
    days.map((day) => ({
      id: day.i,
      date,
      name: localizedNameOverrides[day.i]?.[language] ?? day.n,
      rank: day.r,
      colors: day.c,
      seasons: day.s,
      cycles: {
        properCycle: day.y[0],
        sundayCycle: day.y[1],
        weekdayCycle: day.y[2],
        psalterWeek: day.y[3],
      },
      isHolyDayOfObligation: day.h,
      isOptional: day.o,
    })),
  ]));
}

export function loadLiturgicalCalendar(
  year: OfficialCalendarYear,
  language: Language,
  ascensionOnSunday: boolean,
): Promise<LiturgicalCalendar> {
  const cacheKey = `${year}:${language}:${ascensionOnSunday ? "sunday" : "thursday"}`;
  let calendar = calendarCache.get(cacheKey);
  if (!calendar) {
    calendar = calendarDataLoaders[language]().then((data) => {
      const defaultCalendar = data.sunday[String(year)];
      const selectedCalendar = ascensionOnSunday
        ? defaultCalendar
        : { ...defaultCalendar, ...data.thursdayOverrides[String(year)] };
      return hydrateCalendar(selectedCalendar, language);
    });
    calendarCache.set(cacheKey, calendar);
  }
  return calendar;
}

export function getLectionaryReferences(date: string): string[] {
  return references.years[date.slice(0, 4)]?.[date] ?? [];
}

export function getOfficialCalendarUrl(year: OfficialCalendarYear): string {
  return references.editions[String(year)];
}

export function getOfficialSourcePage(): string {
  return references.sourcePage;
}

export function getUsccbReadingsUrl(date: string): string {
  const [year, month, day] = date.split("-");
  return `https://bible.usccb.org/bible/readings/${month}${day}${year.slice(2)}.cfm`;
}

export function getArchiveConnections(celebrations: LiturgicalCelebration[]): ArchiveConnection[] {
  const seen = new Set<string>();
  return celebrations.flatMap((celebration) => archiveConnections[celebration.id] ?? []).filter((connection) => {
    const key = `${connection.kind}:${connection.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

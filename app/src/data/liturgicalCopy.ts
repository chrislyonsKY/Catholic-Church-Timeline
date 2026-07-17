import type { Language } from "../types";

export interface LiturgicalCopy {
  sectionKicker: string;
  sectionTitle: string;
  sectionBody: string;
  scopeLabel: string;
  scopeTitle: string;
  scopeBody: string;
  editionLabel: string;
  today: string;
  viewToday: string;
  loading: string;
  errorTitle: string;
  errorBody: string;
  retry: string;
  calendarTitle: string;
  monthLabel: string;
  yearLabel: string;
  previousMonth: string;
  nextMonth: string;
  returnToday: string;
  ascensionLabel: string;
  ascensionSunday: string;
  ascensionThursday: string;
  ascensionSundayNote: string;
  ascensionThursdayNote: string;
  dayDetails: string;
  rank: string;
  season: string;
  color: string;
  sundayCycle: string;
  weekdayCycle: string;
  psalterWeek: string;
  lectionary: string;
  officialReadings: string;
  annualCalendar: string;
  holyDay: string;
  optionalCelebrations: string;
  relatedArchive: string;
  timelineRecord: string;
  saintProfile: string;
  sourcesNote: string;
}

export interface LiturgicalLabels {
  ranks: Record<string, string>;
  seasons: Record<string, string>;
  colors: Record<string, string>;
  sundayCycles: Record<string, string>;
  weekdayCycles: Record<string, string>;
  psalterWeeks: Record<string, string>;
}

export const liturgicalCopy: Record<Language, LiturgicalCopy> = {
  en: {
    sectionKicker: "Liturgical year · Modern Roman Rite",
    sectionTitle: "The Church’s year, day by day",
    sectionBody: "Move through the U.S. Roman Catholic calendar by month. Each date names the observance, rank, season, liturgical color, Lectionary reference, and cycle of prayer.",
    scopeLabel: "Calendar scope",
    scopeTitle: "General Roman Calendar + United States proper",
    scopeBody: "This is the modern Roman Rite calendar promulgated after the 1969 reform. It is a present-day companion to the historical chronology, not a reconstruction of worship in earlier centuries.",
    editionLabel: "Official USCCB editions · 2026–2028",
    today: "Today",
    viewToday: "View today in the calendar",
    loading: "Preparing the liturgical calendar…",
    errorTitle: "The calendar could not be prepared.",
    errorBody: "The rest of the exhibition remains available. Try loading the calendar again.",
    retry: "Try again",
    calendarTitle: "Month calendar",
    monthLabel: "Month",
    yearLabel: "Year",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    returnToday: "Return to today",
    ascensionLabel: "Ascension observance",
    ascensionSunday: "Sunday · most U.S. provinces",
    ascensionThursday: "Thursday · five U.S. provinces",
    ascensionSundayNote: "Sunday observance used in most U.S. ecclesiastical provinces.",
    ascensionThursdayNote: "Thursday observance used in Boston, Hartford, New York, Omaha, and Philadelphia.",
    dayDetails: "Selected day",
    rank: "Rank",
    season: "Season",
    color: "Color",
    sundayCycle: "Sunday cycle",
    weekdayCycle: "Weekday cycle",
    psalterWeek: "Psalter",
    lectionary: "Lectionary",
    officialReadings: "Open official USCCB readings",
    annualCalendar: "Open the annual USCCB calendar",
    holyDay: "Holyday of Obligation",
    optionalCelebrations: "Other permitted observances",
    relatedArchive: "Connected historical records",
    timelineRecord: "Timeline record",
    saintProfile: "Saint profile",
    sourcesNote: "Celebrations and cycles are computed from the modern U.S. Roman calendar; Lectionary numbers are transcribed from the official USCCB annual calendars. Reading texts remain on the USCCB site.",
  },
  es: {
    sectionKicker: "Año litúrgico · Rito romano moderno",
    sectionTitle: "El año de la Iglesia, día a día",
    sectionBody: "Recorre por meses el calendario católico romano de Estados Unidos. Cada fecha indica la celebración, el rango, el tiempo, el color litúrgico, la referencia del Leccionario y el ciclo de oración.",
    scopeLabel: "Alcance del calendario",
    scopeTitle: "Calendario Romano General + propio de Estados Unidos",
    scopeBody: "Este es el calendario actual del Rito romano promulgado tras la reforma de 1969. Acompaña la cronología histórica, pero no reconstruye el culto de siglos anteriores.",
    editionLabel: "Ediciones oficiales de la USCCB · 2026–2028",
    today: "Hoy",
    viewToday: "Ver hoy en el calendario",
    loading: "Preparando el calendario litúrgico…",
    errorTitle: "No se pudo preparar el calendario.",
    errorBody: "El resto de la exposición sigue disponible. Intenta cargar de nuevo el calendario.",
    retry: "Reintentar",
    calendarTitle: "Calendario mensual",
    monthLabel: "Mes",
    yearLabel: "Año",
    previousMonth: "Mes anterior",
    nextMonth: "Mes siguiente",
    returnToday: "Volver a hoy",
    ascensionLabel: "Celebración de la Ascensión",
    ascensionSunday: "Domingo · mayoría de EE. UU.",
    ascensionThursday: "Jueves · cinco provincias",
    ascensionSundayNote: "Celebración dominical en la mayoría de las provincias eclesiásticas de Estados Unidos.",
    ascensionThursdayNote: "Celebración el jueves en Boston, Hartford, Nueva York, Omaha y Filadelfia.",
    dayDetails: "Día seleccionado",
    rank: "Rango",
    season: "Tiempo",
    color: "Color",
    sundayCycle: "Ciclo dominical",
    weekdayCycle: "Ciclo ferial",
    psalterWeek: "Salterio",
    lectionary: "Leccionario",
    officialReadings: "Abrir las lecturas oficiales de la USCCB",
    annualCalendar: "Abrir el calendario anual de la USCCB",
    holyDay: "Día santo de precepto",
    optionalCelebrations: "Otras celebraciones permitidas",
    relatedArchive: "Registros históricos relacionados",
    timelineRecord: "Registro cronológico",
    saintProfile: "Perfil del santo",
    sourcesNote: "Las celebraciones y los ciclos se calculan a partir del calendario romano moderno de Estados Unidos; los números del Leccionario proceden de los calendarios anuales oficiales de la USCCB. Los textos de las lecturas permanecen en el sitio de la USCCB.",
  },
  fr: {
    sectionKicker: "Année liturgique · Rite romain moderne",
    sectionTitle: "L’année de l’Église, jour après jour",
    sectionBody: "Parcourez mois par mois le calendrier catholique romain des États-Unis. Chaque date indique la célébration, le rang, le temps, la couleur liturgique, la référence du Lectionnaire et le cycle de prière.",
    scopeLabel: "Portée du calendrier",
    scopeTitle: "Calendrier romain général + propre des États-Unis",
    scopeBody: "Il s’agit du calendrier actuel du Rite romain promulgué après la réforme de 1969. Il accompagne la chronologie historique sans reconstruire le culte des siècles antérieurs.",
    editionLabel: "Éditions officielles de l’USCCB · 2026–2028",
    today: "Aujourd’hui",
    viewToday: "Afficher aujourd’hui dans le calendrier",
    loading: "Préparation du calendrier liturgique…",
    errorTitle: "Le calendrier n’a pas pu être préparé.",
    errorBody: "Le reste de l’exposition demeure accessible. Essayez de charger de nouveau le calendrier.",
    retry: "Réessayer",
    calendarTitle: "Calendrier mensuel",
    monthLabel: "Mois",
    yearLabel: "Année",
    previousMonth: "Mois précédent",
    nextMonth: "Mois suivant",
    returnToday: "Revenir à aujourd’hui",
    ascensionLabel: "Célébration de l’Ascension",
    ascensionSunday: "Dimanche · majorité des États-Unis",
    ascensionThursday: "Jeudi · cinq provinces",
    ascensionSundayNote: "Célébration dominicale dans la plupart des provinces ecclésiastiques des États-Unis.",
    ascensionThursdayNote: "Célébration le jeudi à Boston, Hartford, New York, Omaha et Philadelphie.",
    dayDetails: "Jour sélectionné",
    rank: "Rang",
    season: "Temps",
    color: "Couleur",
    sundayCycle: "Cycle dominical",
    weekdayCycle: "Cycle férial",
    psalterWeek: "Psautier",
    lectionary: "Lectionnaire",
    officialReadings: "Ouvrir les lectures officielles de l’USCCB",
    annualCalendar: "Ouvrir le calendrier annuel de l’USCCB",
    holyDay: "Fête d’obligation",
    optionalCelebrations: "Autres célébrations permises",
    relatedArchive: "Notices historiques associées",
    timelineRecord: "Notice chronologique",
    saintProfile: "Profil du saint",
    sourcesNote: "Les célébrations et les cycles sont calculés d’après le calendrier romain moderne des États-Unis ; les numéros du Lectionnaire proviennent des calendriers annuels officiels de l’USCCB. Les textes des lectures restent sur le site de l’USCCB.",
  },
  pt: {
    sectionKicker: "Ano litúrgico · Rito romano moderno",
    sectionTitle: "O ano da Igreja, dia após dia",
    sectionBody: "Percorra por mês o calendário católico romano dos Estados Unidos. Cada data apresenta a celebração, a categoria, o tempo, a cor litúrgica, a referência do Lecionário e o ciclo de oração.",
    scopeLabel: "Escopo do calendário",
    scopeTitle: "Calendário Romano Geral + próprio dos Estados Unidos",
    scopeBody: "Este é o calendário atual do Rito romano promulgado após a reforma de 1969. Ele acompanha a cronologia histórica, mas não reconstrói o culto dos séculos anteriores.",
    editionLabel: "Edições oficiais da USCCB · 2026–2028",
    today: "Hoje",
    viewToday: "Ver hoje no calendário",
    loading: "Preparando o calendário litúrgico…",
    errorTitle: "Não foi possível preparar o calendário.",
    errorBody: "O restante da exposição continua disponível. Tente carregar o calendário novamente.",
    retry: "Tentar novamente",
    calendarTitle: "Calendário mensal",
    monthLabel: "Mês",
    yearLabel: "Ano",
    previousMonth: "Mês anterior",
    nextMonth: "Mês seguinte",
    returnToday: "Voltar para hoje",
    ascensionLabel: "Celebração da Ascensão",
    ascensionSunday: "Domingo · maioria dos EUA",
    ascensionThursday: "Quinta-feira · cinco províncias",
    ascensionSundayNote: "Celebração dominical na maioria das províncias eclesiásticas dos Estados Unidos.",
    ascensionThursdayNote: "Celebração na quinta-feira em Boston, Hartford, Nova York, Omaha e Filadélfia.",
    dayDetails: "Dia selecionado",
    rank: "Categoria",
    season: "Tempo",
    color: "Cor",
    sundayCycle: "Ciclo dominical",
    weekdayCycle: "Ciclo ferial",
    psalterWeek: "Saltério",
    lectionary: "Lecionário",
    officialReadings: "Abrir as leituras oficiais da USCCB",
    annualCalendar: "Abrir o calendário anual da USCCB",
    holyDay: "Dia santo de preceito",
    optionalCelebrations: "Outras celebrações permitidas",
    relatedArchive: "Registros históricos relacionados",
    timelineRecord: "Registro cronológico",
    saintProfile: "Perfil do santo",
    sourcesNote: "As celebrações e os ciclos são calculados a partir do calendário romano moderno dos Estados Unidos; os números do Lecionário vêm dos calendários anuais oficiais da USCCB. Os textos das leituras permanecem no site da USCCB.",
  },
};

export const liturgicalLabels: Record<Language, LiturgicalLabels> = {
  en: {
    ranks: { SOLEMNITY: "Solemnity", SUNDAY: "Sunday", FEAST: "Feast", MEMORIAL: "Memorial", OPTIONAL_MEMORIAL: "Optional Memorial", WEEKDAY: "Weekday" },
    seasons: { ADVENT: "Advent", CHRISTMAS_TIME: "Christmas", LENT: "Lent", PASCHAL_TRIDUUM: "Paschal Triduum", EASTER_TIME: "Easter", ORDINARY_TIME: "Ordinary Time" },
    colors: { WHITE: "White", GOLD: "Gold", RED: "Red", GREEN: "Green", PURPLE: "Violet", ROSE: "Rose", BLACK: "Black" },
    sundayCycles: { YEAR_A: "Year A", YEAR_B: "Year B", YEAR_C: "Year C" },
    weekdayCycles: { YEAR_1: "Cycle I", YEAR_2: "Cycle II" },
    psalterWeeks: { WEEK_1: "Week I", WEEK_2: "Week II", WEEK_3: "Week III", WEEK_4: "Week IV" },
  },
  es: {
    ranks: { SOLEMNITY: "Solemnidad", SUNDAY: "Domingo", FEAST: "Fiesta", MEMORIAL: "Memoria", OPTIONAL_MEMORIAL: "Memoria libre", WEEKDAY: "Feria" },
    seasons: { ADVENT: "Adviento", CHRISTMAS_TIME: "Navidad", LENT: "Cuaresma", PASCHAL_TRIDUUM: "Triduo Pascual", EASTER_TIME: "Pascua", ORDINARY_TIME: "Tiempo Ordinario" },
    colors: { WHITE: "Blanco", GOLD: "Dorado", RED: "Rojo", GREEN: "Verde", PURPLE: "Morado", ROSE: "Rosa", BLACK: "Negro" },
    sundayCycles: { YEAR_A: "Año A", YEAR_B: "Año B", YEAR_C: "Año C" },
    weekdayCycles: { YEAR_1: "Ciclo I", YEAR_2: "Ciclo II" },
    psalterWeeks: { WEEK_1: "Semana I", WEEK_2: "Semana II", WEEK_3: "Semana III", WEEK_4: "Semana IV" },
  },
  fr: {
    ranks: { SOLEMNITY: "Solennité", SUNDAY: "Dimanche", FEAST: "Fête", MEMORIAL: "Mémoire", OPTIONAL_MEMORIAL: "Mémoire facultative", WEEKDAY: "Férie" },
    seasons: { ADVENT: "Avent", CHRISTMAS_TIME: "Noël", LENT: "Carême", PASCHAL_TRIDUUM: "Triduum pascal", EASTER_TIME: "Pâques", ORDINARY_TIME: "Temps ordinaire" },
    colors: { WHITE: "Blanc", GOLD: "Or", RED: "Rouge", GREEN: "Vert", PURPLE: "Violet", ROSE: "Rose", BLACK: "Noir" },
    sundayCycles: { YEAR_A: "Année A", YEAR_B: "Année B", YEAR_C: "Année C" },
    weekdayCycles: { YEAR_1: "Année impaire", YEAR_2: "Année paire" },
    psalterWeeks: { WEEK_1: "Semaine I", WEEK_2: "Semaine II", WEEK_3: "Semaine III", WEEK_4: "Semaine IV" },
  },
  pt: {
    ranks: { SOLEMNITY: "Solenidade", SUNDAY: "Domingo", FEAST: "Festa", MEMORIAL: "Memória", OPTIONAL_MEMORIAL: "Memória facultativa", WEEKDAY: "Dia de semana" },
    seasons: { ADVENT: "Advento", CHRISTMAS_TIME: "Natal", LENT: "Quaresma", PASCHAL_TRIDUUM: "Tríduo Pascal", EASTER_TIME: "Páscoa", ORDINARY_TIME: "Tempo Comum" },
    colors: { WHITE: "Branco", GOLD: "Dourado", RED: "Vermelho", GREEN: "Verde", PURPLE: "Roxo", ROSE: "Rosa", BLACK: "Preto" },
    sundayCycles: { YEAR_A: "Ano A", YEAR_B: "Ano B", YEAR_C: "Ano C" },
    weekdayCycles: { YEAR_1: "Ciclo I", YEAR_2: "Ciclo II" },
    psalterWeeks: { WEEK_1: "Semana I", WEEK_2: "Semana II", WEEK_3: "Semana III", WEEK_4: "Semana IV" },
  },
};

export const calendarLocales: Record<Language, string> = {
  en: "en-US",
  es: "es-US",
  fr: "fr-FR",
  pt: "pt-BR",
};

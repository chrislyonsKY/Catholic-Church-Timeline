import type { AtlasPlace, LocalizedText, SourceObject } from "../types";

function text(en: string, es: string, fr: string, pt: string): LocalizedText {
  return { en, es, fr, pt };
}

const accuracyNotes: Record<AtlasPlace["accuracy"], LocalizedText> = {
  site: text(
    "The marker identifies a documented site, not a reconstructed historical boundary.",
    "El marcador identifica un sitio documentado, no una frontera histórica reconstruida.",
    "Le repère identifie un site documenté, non une frontière historique reconstituée.",
    "O marcador identifica um local documentado, não uma fronteira histórica reconstruída.",
  ),
  city: text(
    "The marker identifies the historical city named by the record; it does not imply exact venue precision.",
    "El marcador identifica la ciudad histórica citada por el registro; no implica precisión del lugar exacto.",
    "Le repère identifie la ville historique citée par la notice, sans prétendre localiser le lieu exact.",
    "O marcador identifica a cidade histórica citada pelo registro, sem afirmar precisão do local exato.",
  ),
  region: text(
    "The marker is a regional orientation point because the historical activity extended beyond one documented site.",
    "El marcador es un punto de orientación regional porque la actividad histórica se extendió más allá de un solo sitio documentado.",
    "Le repère sert d’orientation régionale, l’activité historique ayant dépassé un seul site documenté.",
    "O marcador é um ponto de orientação regional, pois a atividade histórica ultrapassou um único local documentado.",
  ),
};

function place(
  id: string,
  name: LocalizedText,
  region: LocalizedText,
  longitude: number,
  latitude: number,
  accuracy: AtlasPlace["accuracy"],
  eventIds: string[],
): AtlasPlace {
  return { id, name, region, longitude, latitude, accuracy, eventIds, note: accuracyNotes[accuracy] };
}

export const atlasPlaces: AtlasPlace[] = [
  place("jerusalem", text("Jerusalem", "Jerusalén", "Jérusalem", "Jerusalém"), text("Judea · present-day Jerusalem", "Judea · Jerusalén actual", "Judée · Jérusalem actuelle", "Judeia · Jerusalém atual"), 35.2137, 31.7683, "city", ["pentecost", "stephen-martyr", "jerusalem-council"]),
  place("damascus", text("Damascus", "Damasco", "Damas", "Damasco"), text("Syria", "Siria", "Syrie", "Síria"), 36.2765, 33.5138, "city", ["paul-conversion"]),
  place("rome", text("Rome", "Roma", "Rome", "Roma"), text("Italy", "Italia", "Italie", "Itália"), 12.4964, 41.9028, "city", ["peter-paul-martyrdom", "clement-letter", "ignatius-antioch", "gregory-great", "great-schism", "francis", "lateran-four", "dominicans-approved", "western-schism", "jesuits", "gregorian-calendar", "charlemagne-crowned"]),
  place("antioch", text("Antioch", "Antioquía", "Antioche", "Antioquia"), text("Present-day Antakya, Türkiye", "Actual Antakya, Turquía", "Actuelle Antakya, Türkiye", "Atual Antakya, Turquia"), 36.1604, 36.2021, "city", ["ignatius-antioch"]),
  place("lyon", text("Lyon", "Lyon", "Lyon", "Lyon"), text("Gaul · present-day France", "Galia · Francia actual", "Gaule · France actuelle", "Gália · França atual"), 4.8357, 45.764, "city", ["irenaeus"]),
  place("carthage", text("Carthage", "Cartago", "Carthage", "Cartago"), text("Roman Africa · present-day Tunisia", "África romana · Túnez actual", "Afrique romaine · Tunisie actuelle", "África romana · Tunísia atual"), 10.3308, 36.8528, "site", ["perpetua-felicity"]),
  place("nicomedia", text("Nicomedia", "Nicomedia", "Nicomédie", "Nicomédia"), text("Present-day İzmit, Türkiye", "Actual İzmit, Turquía", "Actuelle İzmit, Türkiye", "Atual İzmit, Turquia"), 29.9169, 40.7654, "city", ["diocletian-persecution"]),
  place("milan", text("Milan", "Milán", "Milan", "Milão"), text("Italy", "Italia", "Italie", "Itália"), 9.19, 45.4642, "city", ["edict-milan"]),
  place("nicaea", text("Nicaea", "Nicea", "Nicée", "Niceia"), text("Present-day İznik, Türkiye", "Actual İznik, Turquía", "Actuelle İznik, Türkiye", "Atual İznik, Turquia"), 29.7214, 40.4297, "city", ["nicaea", "nicaea-two"]),
  place("constantinople", text("Constantinople", "Constantinopla", "Constantinople", "Constantinopla"), text("Present-day Istanbul, Türkiye", "Actual Estambul, Turquía", "Actuelle Istanbul, Türkiye", "Atual Istambul, Turquia"), 28.9784, 41.0082, "city", ["constantinople", "great-schism"]),
  place("hippo", text("Hippo Regius", "Hipona", "Hippone", "Hipona"), text("Present-day Annaba, Algeria", "Actual Annaba, Argelia", "Actuelle Annaba, Algérie", "Atual Annaba, Argélia"), 7.7667, 36.8833, "site", ["augustine-hippo"]),
  place("bethlehem", text("Bethlehem", "Belén", "Bethléem", "Belém"), text("Judea · present-day West Bank", "Judea · actual Cisjordania", "Judée · Cisjordanie actuelle", "Judeia · atual Cisjordânia"), 35.2024, 31.7054, "city", ["vulgate"]),
  place("ephesus", text("Ephesus", "Éfeso", "Éphèse", "Éfeso"), text("Present-day Selçuk, Türkiye", "Actual Selçuk, Turquía", "Actuelle Selçuk, Türkiye", "Atual Selçuk, Turquia"), 27.341, 37.939, "site", ["ephesus"]),
  place("armagh", text("Armagh", "Armagh", "Armagh", "Armagh"), text("Ireland", "Irlanda", "Irlande", "Irlanda"), -6.6546, 54.3503, "region", ["patrick-ireland"]),
  place("chalcedon", text("Chalcedon", "Calcedonia", "Chalcédoine", "Calcedônia"), text("Present-day Kadıköy, Istanbul", "Actual Kadıköy, Estambul", "Actuelle Kadıköy, Istanbul", "Atual Kadıköy, Istambul"), 29.0277, 40.9917, "city", ["chalcedon"]),
  place("monte-cassino", text("Monte Cassino", "Montecasino", "Mont-Cassin", "Monte Cassino"), text("Italy", "Italia", "Italie", "Itália"), 13.8134, 41.49, "site", ["benedict-rule"]),
  place("moravia", text("Great Moravia", "Gran Moravia", "Grande-Moravie", "Grande Morávia"), text("Central Europe · regional orientation", "Europa central · orientación regional", "Europe centrale · repère régional", "Europa Central · orientação regional"), 17.093, 49.19, "region", ["cyril-methodius"]),
  place("cluny", text("Cluny", "Cluny", "Cluny", "Cluny"), text("Burgundy · present-day France", "Borgoña · Francia actual", "Bourgogne · France actuelle", "Borgonha · França atual"), 4.6586, 46.4345, "site", ["cluny"]),
  place("avignon", text("Avignon", "Aviñón", "Avignon", "Avinhão"), text("France", "Francia", "France", "França"), 4.8055, 43.9493, "city", ["avignon-papacy", "western-schism"]),
  place("clermont", text("Clermont", "Clermont", "Clermont", "Clermont"), text("Present-day Clermont-Ferrand, France", "Actual Clermont-Ferrand, Francia", "Actuelle Clermont-Ferrand, France", "Atual Clermont-Ferrand, França"), 3.087, 45.7772, "city", ["first-crusade"]),
  place("assisi", text("Assisi", "Asís", "Assise", "Assis"), text("Italy", "Italia", "Italie", "Itália"), 12.6196, 43.0707, "city", ["francis"]),
  place("fossanova", text("Fossanova Abbey", "Abadía de Fossanova", "Abbaye de Fossanova", "Abadia de Fossanova"), text("Italy", "Italia", "Italie", "Itália"), 13.1987, 41.4388, "site", ["aquinas"]),
  place("wittenberg", text("Wittenberg", "Wittenberg", "Wittenberg", "Wittenberg"), text("Present-day Germany", "Alemania actual", "Allemagne actuelle", "Alemanha atual"), 12.6488, 51.8667, "city", ["reformation"]),
  place("tepeyac", text("Tepeyac", "Tepeyac", "Tepeyac", "Tepeyac"), text("Present-day Mexico City", "Actual Ciudad de México", "Actuelle Mexico", "Atual Cidade do México"), -99.1177, 19.4849, "site", ["guadalupe"]),
  place("trent", text("Trent", "Trento", "Trente", "Trento"), text("Present-day Trento, Italy", "Actual Trento, Italia", "Actuelle Trente, Italie", "Atual Trento, Itália"), 11.1211, 46.0748, "city", ["trent"]),
  place("avila", text("Ávila", "Ávila", "Ávila", "Ávila"), text("Spain", "España", "Espagne", "Espanha"), -4.6969, 40.6565, "city", ["teresa-reform"]),
  place("folleville", text("Folleville", "Folleville", "Folleville", "Folleville"), text("Picardy, France", "Picardía, Francia", "Picardie, France", "Picardia, França"), 2.3637, 49.6758, "region", ["vincent-charity"]),
  place("vatican-site", text("Vatican site, Rome", "Sitio del Vaticano, Roma", "Site du Vatican, Rome", "Local do Vaticano, Roma"), text("Present-day Vatican City", "Actual Ciudad del Vaticano", "Actuelle Cité du Vatican", "Atual Cidade do Vaticano"), 12.4534, 41.9029, "site", ["vatican-one", "immaculate-conception", "rerum-novarum", "lateran-treaty", "assumption-defined", "vatican-two", "john-paul-two", "catechism", "benedict-sixteen", "francis-pontificate", "leo-fourteen"]),
  place("lourdes", text("Lourdes", "Lourdes", "Lourdes", "Lourdes"), text("France", "Francia", "France", "França"), -0.0583, 43.0948, "site", ["lourdes"]),
  place("fatima", text("Fátima", "Fátima", "Fátima", "Fátima"), text("Portugal", "Portugal", "Portugal", "Portugal"), -8.6719, 39.6317, "site", ["fatima"]),
];

export const sourceObjects: SourceObject[] = [
  {
    id: "codex-vaticanus",
    title: text("Codex Vaticanus", "Códice Vaticano", "Codex Vaticanus", "Códice Vaticano"),
    dateLabel: text("4th century", "Siglo IV", "IVe siècle", "Século IV"),
    repository: text("Vatican Apostolic Library · Vat.gr.1209", "Biblioteca Apostólica Vaticana · Vat.gr.1209", "Bibliothèque apostolique vaticane · Vat.gr.1209", "Biblioteca Apostólica Vaticana · Vat.gr.1209"),
    description: text("A major Greek biblical manuscript, presented here as a material witness to the scriptural world of the fourth-century Church.", "Un importante manuscrito bíblico griego, presentado como testimonio material del mundo bíblico de la Iglesia del siglo IV.", "Un important manuscrit biblique grec, présenté comme témoin matériel du monde scripturaire de l’Église du IVe siècle.", "Um importante manuscrito bíblico grego, apresentado como testemunho material do mundo bíblico da Igreja do século IV."),
    relationshipNote: text("Contextual witness: it is not a record of the Council of Nicaea and no causal link is claimed.", "Testimonio contextual: no es un registro del Concilio de Nicea ni se afirma un vínculo causal.", "Témoin contextuel : ce n’est pas un acte du concile de Nicée et aucun lien causal n’est affirmé.", "Testemunho contextual: não é um registro do Concílio de Niceia e nenhuma ligação causal é afirmada."),
    startYear: 300,
    endYear: 399,
    relatedEventIds: ["nicaea", "vulgate"],
    manifestUrl: "https://digi.vatlib.it/iiif/MSS_Vat.gr.1209/manifest.json",
    canvasLabel: text("Selected folio · manuscript page 117", "Folio seleccionado · página 117", "Folio choisi · page 117", "Fólio selecionado · página 117"),
    imageService: "https://digi.vatlib.it/iiifimage/MSS_Vat.gr.1209/Vat.gr.1209_0121_pa_0117.jp2",
    objectUrl: "https://digi.vatlib.it/view/MSS_Vat.gr.1209",
    rights: "Images Copyright Biblioteca Apostolica Vaticana",
  },
  {
    id: "gelasian-sacramentary",
    title: text("Gelasian Sacramentary", "Sacramentario Gelasiano", "Sacramentaire gélasien", "Sacramentário Gelasiano"),
    dateLabel: text("c. 8th century", "c. siglo VIII", "v. VIIIe siècle", "c. século VIII"),
    repository: text("Vatican Apostolic Library · Barb.lat.1200", "Biblioteca Apostólica Vaticana · Barb.lat.1200", "Bibliothèque apostolique vaticane · Barb.lat.1200", "Biblioteca Apostólica Vaticana · Barb.lat.1200"),
    description: text("A Latin liturgical manuscript that opens a window onto the transmission and use of early medieval worship texts.", "Un manuscrito litúrgico latino que muestra la transmisión y el uso de textos de culto altomedievales.", "Un manuscrit liturgique latin qui éclaire la transmission et l’usage des textes du culte au haut Moyen Âge.", "Um manuscrito litúrgico latino que revela a transmissão e o uso de textos de culto no início da Idade Média."),
    relationshipNote: text("Contextual witness to early medieval liturgical culture; its traditional title does not establish personal authorship by Pope Gelasius I.", "Testimonio contextual de la cultura litúrgica altomedieval; su título tradicional no establece autoría personal del papa Gelasio I.", "Témoin contextuel de la culture liturgique du haut Moyen Âge ; son titre traditionnel n’établit pas une rédaction personnelle par le pape Gélase Ier.", "Testemunho contextual da cultura litúrgica medieval inicial; seu título tradicional não estabelece autoria pessoal do papa Gelásio I."),
    startYear: 700,
    endYear: 799,
    relatedEventIds: ["gregory-great", "nicaea-two", "charlemagne-crowned"],
    manifestUrl: "https://digi.vatlib.it/iiif/MSS_Barb.lat.1200/manifest.json",
    canvasLabel: text("Selected folio · manuscript page 56", "Folio seleccionado · página 56", "Folio choisi · page 56", "Fólio selecionado · página 56"),
    imageService: "https://digi.vatlib.it/iiifimage/MSS_Barb.lat.1200/Barb.lat.1200_0081_pa_0056.jp2",
    objectUrl: "https://digi.vatlib.it/view/MSS_Barb.lat.1200",
    rights: "Images Copyright Biblioteca Apostolica Vaticana",
  },
  {
    id: "menologion-basil-ii",
    title: text("Menologion of Basil II", "Menologio de Basilio II", "Ménologe de Basile II", "Menológio de Basílio II"),
    dateLabel: text("c. AD 1000", "c. 1000 d. C.", "v. 1000 apr. J.-C.", "c. 1000 d.C."),
    repository: text("Vatican Apostolic Library · Vat.gr.1613", "Biblioteca Apostólica Vaticana · Vat.gr.1613", "Bibliothèque apostolique vaticane · Vat.gr.1613", "Biblioteca Apostólica Vaticana · Vat.gr.1613"),
    description: text("An illuminated Byzantine cycle of saints and feasts, pairing Greek text with gold-ground scenes of witness and worship.", "Un ciclo bizantino iluminado de santos y fiestas que combina texto griego con escenas doradas de testimonio y culto.", "Un cycle byzantin enluminé de saints et de fêtes, associant texte grec et scènes sur fond d’or de témoignage et de culte.", "Um ciclo bizantino iluminado de santos e festas, unindo texto grego a cenas douradas de testemunho e culto."),
    relationshipNote: text("Contextual witness to Byzantine Christian culture before 1054; it does not document the later East–West rupture.", "Testimonio contextual de la cultura cristiana bizantina anterior a 1054; no documenta la posterior ruptura entre Oriente y Occidente.", "Témoin contextuel de la culture chrétienne byzantine avant 1054 ; il ne documente pas la rupture ultérieure entre Orient et Occident.", "Testemunho contextual da cultura cristã bizantina anterior a 1054; não documenta a ruptura posterior entre Oriente e Ocidente."),
    startYear: 976,
    endYear: 1025,
    relatedEventIds: ["great-schism"],
    manifestUrl: "https://digi.vatlib.it/iiif/MSS_Vat.gr.1613/manifest.json",
    canvasLabel: text("Selected folio · manuscript page 59", "Folio seleccionado · página 59", "Folio choisi · page 59", "Fólio selecionado · página 59"),
    imageService: "https://digi.vatlib.it/iiifimage/MSS_Vat.gr.1613/Vat.gr.1613_0081_pa_0059.jp2",
    objectUrl: "https://digi.vatlib.it/view/MSS_Vat.gr.1613",
    rights: "Images Copyright Biblioteca Apostolica Vaticana",
  },
  {
    id: "urbino-dante",
    title: text("Urbino Dante", "Dante de Urbino", "Dante d’Urbin", "Dante de Urbino"),
    dateLabel: text("15th century", "Siglo XV", "XVe siècle", "Século XV"),
    repository: text("Vatican Apostolic Library · Urb.lat.365", "Biblioteca Apostólica Vaticana · Urb.lat.365", "Bibliothèque apostolique vaticane · Urb.lat.365", "Biblioteca Apostólica Vaticana · Urb.lat.365"),
    description: text("A Renaissance manuscript of Dante’s Commedia, evidence for the literary and theological imagination inherited from the medieval Latin West.", "Un manuscrito renacentista de la Comedia de Dante, testimonio de la imaginación literaria y teológica heredada del Occidente latino medieval.", "Un manuscrit renaissant de la Comédie de Dante, témoin de l’imaginaire littéraire et théologique hérité de l’Occident latin médiéval.", "Um manuscrito renascentista da Comédia de Dante, testemunho da imaginação literária e teológica herdada do Ocidente latino medieval."),
    relationshipNote: text("Cultural context rather than a direct source for a single timeline event.", "Contexto cultural, no una fuente directa de un único evento cronológico.", "Contexte culturel plutôt que source directe d’un événement précis de la frise.", "Contexto cultural, não uma fonte direta de um único evento da cronologia."),
    startYear: 1470,
    endYear: 1499,
    relatedEventIds: ["western-schism", "reformation"],
    manifestUrl: "https://digi.vatlib.it/iiif/MSS_Urb.lat.365/manifest.json",
    canvasLabel: text("Selected folio · 38 recto", "Folio seleccionado · 38 recto", "Folio choisi · 38 recto", "Fólio selecionado · 38 reto"),
    imageService: "https://digi.vatlib.it/iiifimage/MSS_Urb.lat.365/Urb.lat.365_0081_fa_0038r.jp2",
    objectUrl: "https://digi.vatlib.it/view/MSS_Urb.lat.365",
    rights: "Images Copyright Biblioteca Apostolica Vaticana",
  },
];

export function placesForEvent(eventId: string): AtlasPlace[] {
  return atlasPlaces.filter((item) => item.eventIds.includes(eventId));
}

export function sourcesForEvent(eventId: string): SourceObject[] {
  return sourceObjects.filter((item) => item.relatedEventIds.includes(eventId));
}

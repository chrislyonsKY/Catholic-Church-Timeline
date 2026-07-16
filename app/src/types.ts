export type Language = "en" | "es" | "fr" | "pt";

export type LocalizedText = Record<Language, string>;

export const categoryIds = [
  "apostles",
  "saints",
  "popes",
  "councils",
  "turning-points",
  "documents",
] as const;

export type CategoryId = (typeof categoryIds)[number];

export const eraIds = [
  "apostolic",
  "imperial",
  "medieval",
  "reformation",
  "modern",
  "contemporary",
] as const;

export type EraId = (typeof eraIds)[number];

export const saintPeriodIds = ["early", "founders", "medieval", "renewal", "modern"] as const;

export type SaintPeriodId = (typeof saintPeriodIds)[number];

export interface TimelineEvent {
  id: string;
  year: number;
  yearLabel: LocalizedText;
  title: LocalizedText;
  summary: LocalizedText;
  detail: LocalizedText;
  people: Record<Language, string[]>;
  category: CategoryId;
  era: EraId;
  source?: string;
}

export interface Apostle {
  id: string;
  mark: string;
  name: LocalizedText;
  note: LocalizedText;
  reference: string;
  relatedEventId?: string;
}

export interface Saint {
  id: string;
  name: LocalizedText;
  dates: LocalizedText;
  place: LocalizedText;
  note: LocalizedText;
  period: SaintPeriodId;
  relatedEventId?: string;
}

export interface Era {
  id: EraId;
  number: string;
  years: LocalizedText;
  title: LocalizedText;
  thesis: LocalizedText;
}

export type PlaceAccuracy = "site" | "city" | "region";

export interface AtlasPlace {
  id: string;
  name: LocalizedText;
  region: LocalizedText;
  longitude: number;
  latitude: number;
  accuracy: PlaceAccuracy;
  eventIds: string[];
  note: LocalizedText;
}

export interface SourceObject {
  id: string;
  title: LocalizedText;
  dateLabel: LocalizedText;
  repository: LocalizedText;
  description: LocalizedText;
  relationshipNote: LocalizedText;
  startYear: number;
  endYear: number;
  relatedEventIds: string[];
  manifestUrl: string;
  canvasLabel: LocalizedText;
  imageService: string;
  objectUrl: string;
  rights: string;
}

export type KnowledgeNodeType = "event" | "person" | "era" | "source";

export interface KnowledgeNode {
  id: string;
  type: KnowledgeNodeType;
  label: string;
  year?: number;
  eventId?: string;
  sourceId?: string;
  eraId?: EraId;
  evidence: string;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  relation: "names" | "belongs-to" | "witnessed-by";
}

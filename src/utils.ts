import type { Language, LocalizedText } from "./types";

export function localize(value: LocalizedText, language: Language): string {
  return value[language];
}

export function normalizeSearch(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function formatCount(value: number): string {
  return String(value).padStart(2, "0");
}

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

export function getCentury(year: number): number {
  return Math.max(1, Math.ceil(year / 100));
}

export function buildPageUrl(parameters: Record<string, string | null>, hash = ""): string {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(parameters)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  if (hash) url.hash = hash;
  return url.toString();
}

export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

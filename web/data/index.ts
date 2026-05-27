import type { Content, Language, Chapter, Person, Place, Memory } from "./types";
import { english } from "./content.en";
import { french } from "./content.fr";
import { vietnamese } from "./content.vi";

export * from "./types";

export { english, french, vietnamese };

export function getContent(lang: Language): Content {
  switch (lang) {
    case "en": return english;
    case "fr": return french;
    case "vi": return vietnamese;
  }
}

export const START_DATE = new Date("2022-06-09");

export function daysSinceStart(now: Date = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - START_DATE.getTime()) / 86400000));
}

export function chapter(content: Content, id: string): Chapter | undefined {
  return content.chapters.find((c) => c.id === id);
}

export function place(content: Content, id: string): Place | undefined {
  return content.places.find((p) => p.id === id);
}

export function person(content: Content, id: string): Person | undefined {
  return content.people.find((p) => p.id === id);
}

export function memory(content: Content, id: string): Memory | undefined {
  return content.memories.find((m) => m.id === id);
}

export function memoriesByChapter(content: Content, chapterId: string): Memory[] {
  return content.memories.filter((m) => m.chapterId === chapterId);
}

export function favoriteMemories(content: Content, favorites: string[]): Memory[] {
  const set = new Set(favorites);
  return content.memories.filter((m) => m.favorite || set.has(m.id));
}

export function searchMemories(content: Content, query: string): Memory[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  if (q === "favorite" || q === "favoris" || q === "yêu thích") {
    return content.memories.filter((m) => m.favorite);
  }
  return content.memories.filter((m) =>
    m.title.toLowerCase().includes(q) ||
    m.body.toLowerCase().includes(q) ||
    m.tags.some((t) => t.toLowerCase().includes(q)) ||
    content.places.find((p) => p.id === m.placeId)?.label.toLowerCase().includes(q) ||
    String(m.year).includes(q)
  );
}

export const ANNIVERSARY_IDS: string[] = [];

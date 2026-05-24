import { START_DATE } from "@/data";

export function daysSinceStart(now: Date = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - START_DATE.getTime()) / 86400000));
}

export function formatDate(dateStr: string, locale = "en-US"): string {
  return dateStr;
}

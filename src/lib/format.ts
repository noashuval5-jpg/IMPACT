import { TIME_ZONE } from "./week";

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** "dd.mm.yyyy" in Jerusalem for an ISO timestamp. */
export function formatTimestamp(iso: string): string {
  const parts = dateTimeFormatter.formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")}.${get("month")}.${get("year")}`;
}

/** "dd.mm.yyyy" for a "YYYY-MM-DD" calendar date. */
export function formatDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${d}.${m}.${y}`;
}

/** Whole-number percent, 0 when there is nothing to count. */
export function percent(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

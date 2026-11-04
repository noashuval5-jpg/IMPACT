/**
 * Week logic for the program. Pure functions only (no I/O), fully unit tested.
 *
 * A week runs Sunday 00:00 → Saturday 23:59:59 in Asia/Jerusalem.
 * current_week = floor(days since program_start_date / 7) + 1, where "days" are
 * counted between calendar dates in Jerusalem, so daylight-saving changes
 * (23h / 25h days) never shift the result.
 */

export const TIME_ZONE = "Asia/Jerusalem";
export const TOTAL_WEEKS = 10;

export type ProgramStatus =
  | { kind: "not_started" }
  | { kind: "active"; week: number }
  | { kind: "finished" };

export type WeekState = "past" | "current" | "future";

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const jerusalemFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Calendar date ("YYYY-MM-DD") of the given instant, in Jerusalem. */
export function jerusalemDate(now: Date): string {
  const parts = jerusalemFormatter.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function toUtcDay(date: string): number | null {
  const m = DATE_RE.exec(date);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const ms = Date.UTC(y, mo - 1, d);
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== y ||
    check.getUTCMonth() !== mo - 1 ||
    check.getUTCDate() !== d
  ) {
    return null;
  }
  return ms / 86_400_000;
}

/** True when the string is a valid "YYYY-MM-DD" date. */
export function isValidDate(date: string): boolean {
  return toUtcDay(date) !== null;
}

/** True when the date ("YYYY-MM-DD") falls on a Sunday. */
export function isSunday(date: string): boolean {
  const day = toUtcDay(date);
  if (day === null) return false;
  return new Date(day * 86_400_000).getUTCDay() === 0;
}

/** Whole calendar days from `from` to `to` (both "YYYY-MM-DD"). */
export function daysBetween(from: string, to: string): number {
  const a = toUtcDay(from);
  const b = toUtcDay(to);
  if (a === null || b === null) throw new Error("Invalid date");
  return b - a;
}

/** Adds days to a "YYYY-MM-DD" date. */
export function addDays(date: string, days: number): string {
  const d = toUtcDay(date);
  if (d === null) throw new Error("Invalid date");
  return new Date((d + days) * 86_400_000).toISOString().slice(0, 10);
}

/** Status of the program at instant `now`. A missing start date means "not started". */
export function getProgramStatus(
  startDate: string | null | undefined,
  now: Date,
): ProgramStatus {
  if (!startDate || !isValidDate(startDate)) return { kind: "not_started" };
  const days = daysBetween(startDate, jerusalemDate(now));
  if (days < 0) return { kind: "not_started" };
  const week = Math.floor(days / 7) + 1;
  if (week > TOTAL_WEEKS) return { kind: "finished" };
  return { kind: "active", week };
}

/** The current week number, or null when the program is not running. */
export function currentWeek(status: ProgramStatus): number | null {
  return status.kind === "active" ? status.week : null;
}

/**
 * Whether a week is already closed (past), is the current one, or is in the future.
 * A past week that was not marked counts as "not delivered".
 */
export function weekState(week: number, status: ProgramStatus): WeekState {
  if (status.kind === "finished") return "past";
  if (status.kind === "not_started") return "future";
  if (week < status.week) return "past";
  if (week === status.week) return "current";
  return "future";
}

/** Number of weeks that are fully over. */
export function closedWeeks(status: ProgramStatus): number {
  if (status.kind === "finished") return TOTAL_WEEKS;
  if (status.kind === "not_started") return 0;
  return status.week - 1;
}

/** Sunday ("YYYY-MM-DD") on which the given week starts. */
export function weekStartDate(startDate: string, week: number): string {
  return addDays(startDate, (week - 1) * 7);
}

/** Saturday ("YYYY-MM-DD") on which the given week ends. */
export function weekEndDate(startDate: string, week: number): string {
  return addDays(startDate, (week - 1) * 7 + 6);
}

/** All week numbers 1..10. */
export const ALL_WEEKS: readonly number[] = Array.from(
  { length: TOTAL_WEEKS },
  (_, i) => i + 1,
);

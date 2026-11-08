import { isLang, type Lang } from "./i18n/dict";
import { normalizePhone } from "./phone";

/** Pure form validation helpers (unit tested). */

export type CoachInput = { full_name: string; role: string; phone: string; language: Lang };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

function str(formData: FormData, key: string, max: number): string {
  return String(formData.get(key) ?? "")
    .trim()
    .slice(0, max);
}

export function parseCoach(formData: FormData): CoachInput | null {
  const full_name = str(formData, "full_name", 100);
  const role = str(formData, "role", 100);
  const phone = str(formData, "phone", 30);
  const language = formData.get("language");
  if (!full_name || !isLang(language)) return null;
  if (phone) {
    const digits = normalizePhone(phone);
    if (digits.length < 9 || digits.length > 15) return null;
  }
  return { full_name, role, phone, language };
}

export function parseGroup(formData: FormData): { name: string; coach_id: string } | null {
  const name = str(formData, "name", 100);
  const coach_id = String(formData.get("coach_id") ?? "");
  if (!name || !isUuid(coach_id)) return null;
  return { name, coach_id };
}

export const LESSON_TEXT_FIELDS = [
  "title_he",
  "title_ar",
  "briefing_he",
  "briefing_ar",
  "message_he",
  "message_ar",
] as const;

export function parseWeek(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 10 ? n : null;
}

/**
 * A flyer URL is accepted only when it points into our public "flyers" bucket,
 * or to one of the built-in flyers shipped with the app (/flyers/he|ar/week-NN.png).
 */
export function isOurFlyerUrl(url: string, supabaseUrl: string): boolean {
  if (/^\/flyers\/(he|ar)\/week-(0[1-9]|10)\.png$/.test(url)) return true;
  const prefix = `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/flyers/`;
  return url.startsWith(prefix) && !url.includes("..");
}

export const FLYER_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};
export const FLYER_MAX_BYTES = 5 * 1024 * 1024;

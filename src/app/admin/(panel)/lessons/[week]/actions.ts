"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db, FLYERS_BUCKET } from "@/lib/supabase/admin";
import {
  FLYER_MAX_BYTES,
  FLYER_TYPES,
  isOurFlyerUrl,
  LESSON_TEXT_FIELDS,
  parseWeek,
} from "@/lib/validate";

export type SaveState = { status: "idle" | "saved" | "error" };

export async function saveLesson(_prev: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();
  const week = parseWeek(formData.get("week_number"));
  if (!week) return { status: "error" };

  const row: Record<string, string | number | null> = { week_number: week };
  for (const field of LESSON_TEXT_FIELDS) {
    row[field] = String(formData.get(field) ?? "").trim().slice(0, 5000);
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  for (const field of ["flyer_he_url", "flyer_ar_url"] as const) {
    const url = String(formData.get(field) ?? "").trim();
    if (url && !isOurFlyerUrl(url, base)) return { status: "error" };
    row[field] = url || null;
  }
  row.updated_at = new Date().toISOString();

  const { error } = await db().from("lessons").upsert(row, { onConflict: "week_number" });
  if (error) return { status: "error" };
  revalidatePath("/admin/lessons");
  return { status: "saved" };
}

export type UploadTicket =
  | { ok: true; signedUrl: string; publicUrl: string }
  | { ok: false; reason: "type" | "size" | "error" };

/**
 * Returns a one-time signed upload URL so the browser can send the file straight
 * to Storage (Vercel limits request bodies to ~4.5MB). The bucket itself also
 * enforces the 5MB limit and the allowed types.
 */
export async function createFlyerUpload(
  weekValue: number,
  lang: "he" | "ar",
  contentType: string,
  size: number,
): Promise<UploadTicket> {
  await requireAdmin();
  const week = parseWeek(weekValue);
  if (!week || (lang !== "he" && lang !== "ar")) return { ok: false, reason: "error" };
  const ext = FLYER_TYPES[contentType];
  if (!ext) return { ok: false, reason: "type" };
  if (!Number.isFinite(size) || size <= 0 || size > FLYER_MAX_BYTES) {
    return { ok: false, reason: "size" };
  }
  const path = `week-${week}/${lang}-${randomBytes(8).toString("hex")}.${ext}`;
  const bucket = db().storage.from(FLYERS_BUCKET);
  const { data, error } = await bucket.createSignedUploadUrl(path);
  if (error || !data) return { ok: false, reason: "error" };
  const { data: pub } = bucket.getPublicUrl(path);
  return { ok: true, signedUrl: data.signedUrl, publicUrl: pub.publicUrl };
}

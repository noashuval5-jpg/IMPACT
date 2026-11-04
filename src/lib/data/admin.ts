import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/supabase/admin";
import { LESSON_COLUMNS, type Coach, type Completion, type Group, type Lesson } from "@/lib/types";

/** Admin-only reads. Callers must have passed requireAdmin(). */

export async function listCoaches(opts: { activeOnly?: boolean } = {}): Promise<Coach[]> {
  let q = db()
    .from("coaches")
    .select("id,full_name,role,phone,language,token,active,created_at")
    .order("created_at");
  if (opts.activeOnly) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Coach[];
}

export async function listGroups(opts: { activeOnly?: boolean } = {}): Promise<Group[]> {
  let q = db().from("groups").select("id,name,coach_id,active,created_at").order("created_at");
  if (opts.activeOnly) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Group[];
}

export async function listLessons(): Promise<Lesson[]> {
  const { data, error } = await db().from("lessons").select(LESSON_COLUMNS).order("week_number");
  if (error) throw error;
  return (data ?? []) as Lesson[];
}

export async function listCompletions(): Promise<Completion[]> {
  const { data, error } = await db()
    .from("completions")
    .select("id,group_id,coach_id,week_number,completed_at");
  if (error) throw error;
  return (data ?? []) as Completion[];
}

/** Public base URL of the site, used to build coach links. */
export async function siteUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export function coachLink(base: string, token: string): string {
  return `${base}/c/${token}`;
}

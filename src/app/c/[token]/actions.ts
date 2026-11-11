"use server";

import { coachOwnsActiveGroup, findCoachByToken, type PublicCoach } from "@/lib/data/coach";
import { getDict } from "@/lib/i18n/dict";
import { fillTemplate } from "@/lib/phone";
import { getStatus } from "@/lib/data/common";
import { db } from "@/lib/supabase/admin";

export type MarkResult =
  | { ok: true; doneAt: string | null; groupId?: string }
  | { ok: false };

/** Marker the page sends when the coach has no group yet. */
const DEFAULT_GROUP = "default";

/**
 * A coach with no active group gets one automatically ("<name>'s group") the
 * first time they press "done", so the button always works. Admins can rename
 * it on the Groups page. Returns null if the coach already has groups.
 */
async function createDefaultGroup(coach: PublicCoach): Promise<string | null> {
  const { data: existing } = await db()
    .from("groups")
    .select("id")
    .eq("coach_id", coach.id)
    .eq("active", true)
    .limit(1);
  if ((existing ?? []).length > 0) return null;
  const name = fillTemplate(getDict(coach.language).defaultGroupName, { name: coach.full_name });
  const { data, error } = await db()
    .from("groups")
    .insert({ name, coach_id: coach.id })
    .select("id")
    .single();
  if (error || !data) return null;
  return data.id as string;
}

/**
 * Re-checks everything on every call: active coach for the token, the group
 * belongs to this coach and is active, and the program is in an active week.
 * The week is always computed here on the server, never taken from the client.
 */
async function authorize(token: string, groupId: string) {
  if (typeof token !== "string" || typeof groupId !== "string") return null;
  const coach = await findCoachByToken(token);
  if (!coach) return null;
  const { status } = await getStatus();
  if (status.kind !== "active") return null;
  if (groupId === DEFAULT_GROUP) {
    const created = await createDefaultGroup(coach);
    if (!created) return null;
    return { coachId: coach.id, week: status.week, groupId: created };
  }
  if (!(await coachOwnsActiveGroup(coach.id, groupId))) return null;
  return { coachId: coach.id, week: status.week, groupId };
}

export async function markDone(token: string, groupId: string): Promise<MarkResult> {
  try {
    const auth = await authorize(token, groupId);
    if (!auth) return { ok: false };
    const { error } = await db()
      .from("completions")
      .upsert(
        { group_id: auth.groupId, coach_id: auth.coachId, week_number: auth.week },
        { onConflict: "group_id,week_number", ignoreDuplicates: true },
      );
    if (error) return { ok: false };
    const { data, error: err2 } = await db()
      .from("completions")
      .select("completed_at")
      .eq("group_id", auth.groupId)
      .eq("week_number", auth.week)
      .maybeSingle();
    if (err2 || !data) return { ok: false };
    return { ok: true, doneAt: data.completed_at as string, groupId: auth.groupId };
  } catch {
    return { ok: false };
  }
}

export async function undoDone(token: string, groupId: string): Promise<MarkResult> {
  try {
    if (groupId === DEFAULT_GROUP) return { ok: false };
    const auth = await authorize(token, groupId);
    if (!auth) return { ok: false };
    const { error } = await db()
      .from("completions")
      .delete()
      .eq("group_id", auth.groupId)
      .eq("week_number", auth.week);
    if (error) return { ok: false };
    return { ok: true, doneAt: null };
  } catch {
    return { ok: false };
  }
}

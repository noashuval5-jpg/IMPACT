"use server";

import { coachOwnsActiveGroup, findCoachByToken } from "@/lib/data/coach";
import { getStatus } from "@/lib/data/common";
import { db } from "@/lib/supabase/admin";

export type MarkResult = { ok: true; doneAt: string | null } | { ok: false };

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
  if (!(await coachOwnsActiveGroup(coach.id, groupId))) return null;
  return { coachId: coach.id, week: status.week };
}

export async function markDone(token: string, groupId: string): Promise<MarkResult> {
  try {
    const auth = await authorize(token, groupId);
    if (!auth) return { ok: false };
    const { error } = await db()
      .from("completions")
      .upsert(
        { group_id: groupId, coach_id: auth.coachId, week_number: auth.week },
        { onConflict: "group_id,week_number", ignoreDuplicates: true },
      );
    if (error) return { ok: false };
    const { data, error: err2 } = await db()
      .from("completions")
      .select("completed_at")
      .eq("group_id", groupId)
      .eq("week_number", auth.week)
      .maybeSingle();
    if (err2 || !data) return { ok: false };
    return { ok: true, doneAt: data.completed_at as string };
  } catch {
    return { ok: false };
  }
}

export async function undoDone(token: string, groupId: string): Promise<MarkResult> {
  try {
    const auth = await authorize(token, groupId);
    if (!auth) return { ok: false };
    const { error } = await db()
      .from("completions")
      .delete()
      .eq("group_id", groupId)
      .eq("week_number", auth.week);
    if (error) return { ok: false };
    return { ok: true, doneAt: null };
  } catch {
    return { ok: false };
  }
}

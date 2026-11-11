"use server";

import { findCoachByToken, getCoachWeekDone, getOrCreateCoachGroup } from "@/lib/data/coach";
import { getStatus } from "@/lib/data/common";
import { getDict } from "@/lib/i18n/dict";
import { fillTemplate } from "@/lib/phone";
import { db } from "@/lib/supabase/admin";

export type MarkResult = { ok: true; doneAt: string | null } | { ok: false };

/**
 * Re-checks everything on every call: an active coach for the token and an
 * active program week. The week is always computed here on the server,
 * never taken from the client, so only the current week can be marked.
 */
async function authorize(token: string) {
  if (typeof token !== "string") return null;
  const coach = await findCoachByToken(token);
  if (!coach) return null;
  const { status } = await getStatus();
  if (status.kind !== "active") return null;
  return { coach, week: status.week };
}

export async function markDone(token: string): Promise<MarkResult> {
  try {
    const auth = await authorize(token);
    if (!auth) return { ok: false };
    const already = await getCoachWeekDone(auth.coach.id, auth.week);
    if (already) return { ok: true, doneAt: already };
    const groupName = fillTemplate(getDict(auth.coach.language).defaultGroupName, {
      name: auth.coach.full_name,
    });
    const groupId = await getOrCreateCoachGroup(auth.coach, groupName);
    if (!groupId) return { ok: false };
    const { error } = await db()
      .from("completions")
      .upsert(
        { group_id: groupId, coach_id: auth.coach.id, week_number: auth.week },
        { onConflict: "group_id,week_number", ignoreDuplicates: true },
      );
    if (error) return { ok: false };
    const doneAt = await getCoachWeekDone(auth.coach.id, auth.week);
    return doneAt ? { ok: true, doneAt } : { ok: false };
  } catch {
    return { ok: false };
  }
}

/** Undo is only possible for the current week (the server decides which week that is). */
export async function undoDone(token: string): Promise<MarkResult> {
  try {
    const auth = await authorize(token);
    if (!auth) return { ok: false };
    const { error } = await db()
      .from("completions")
      .delete()
      .eq("coach_id", auth.coach.id)
      .eq("week_number", auth.week);
    if (error) return { ok: false };
    return { ok: true, doneAt: null };
  } catch {
    return { ok: false };
  }
}

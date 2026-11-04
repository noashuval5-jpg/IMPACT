import "server-only";
import type { Lang } from "@/lib/i18n/dict";
import { db } from "@/lib/supabase/admin";
import { looksLikeToken } from "@/lib/token";

/** What the coach page is allowed to know about the coach. Never the phone. */
export type PublicCoach = { id: string; full_name: string; language: Lang };

export type CoachGroup = { id: string; name: string; doneAt: string | null };

/** Active coach for a token, or null. Never returns phone or token. */
export async function findCoachByToken(token: string): Promise<PublicCoach | null> {
  if (!looksLikeToken(token)) return null;
  const { data, error } = await db()
    .from("coaches")
    .select("id,full_name,language")
    .eq("token", token)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return (data as PublicCoach | null) ?? null;
}

/** The coach's active groups with their completion for `week`. */
export async function getCoachGroups(coachId: string, week: number): Promise<CoachGroup[]> {
  const { data: groups, error } = await db()
    .from("groups")
    .select("id,name")
    .eq("coach_id", coachId)
    .eq("active", true)
    .order("created_at");
  if (error) throw error;
  const list = (groups ?? []) as { id: string; name: string }[];
  if (list.length === 0) return [];

  const { data: done, error: err2 } = await db()
    .from("completions")
    .select("group_id,completed_at")
    .eq("week_number", week)
    .in(
      "group_id",
      list.map((g) => g.id),
    );
  if (err2) throw err2;
  const doneMap = new Map(
    ((done ?? []) as { group_id: string; completed_at: string }[]).map((c) => [
      c.group_id,
      c.completed_at,
    ]),
  );
  return list.map((g) => ({ id: g.id, name: g.name, doneAt: doneMap.get(g.id) ?? null }));
}

/** True when the group is active and belongs to the coach. */
export async function coachOwnsActiveGroup(coachId: string, groupId: string): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(groupId)) return false;
  const { data, error } = await db()
    .from("groups")
    .select("id")
    .eq("id", groupId)
    .eq("coach_id", coachId)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}

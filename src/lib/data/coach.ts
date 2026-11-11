import "server-only";
import type { Lang } from "@/lib/i18n/dict";
import { db } from "@/lib/supabase/admin";
import { looksLikeToken } from "@/lib/token";

/** What the coach page is allowed to know about the coach. Never the phone. */
export type PublicCoach = { id: string; full_name: string; language: Lang };

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

/** When the coach marked `week` as delivered (any of their groups), or null. */
export async function getCoachWeekDone(coachId: string, week: number): Promise<string | null> {
  const { data, error } = await db()
    .from("completions")
    .select("completed_at")
    .eq("coach_id", coachId)
    .eq("week_number", week)
    .order("completed_at")
    .limit(1);
  if (error) throw error;
  return ((data ?? [])[0]?.completed_at as string | undefined) ?? null;
}

/**
 * MVP: groups are hidden. Each coach uses one internal group; it is created
 * the first time the coach marks a week as done.
 */
export async function getOrCreateCoachGroup(coach: PublicCoach, name: string): Promise<string | null> {
  const { data: existing, error } = await db()
    .from("groups")
    .select("id")
    .eq("coach_id", coach.id)
    .eq("active", true)
    .order("created_at")
    .limit(1);
  if (error) return null;
  const found = (existing ?? [])[0]?.id as string | undefined;
  if (found) return found;
  const { data, error: err2 } = await db()
    .from("groups")
    .insert({ name, coach_id: coach.id })
    .select("id")
    .single();
  if (err2 || !data) return null;
  return data.id as string;
}

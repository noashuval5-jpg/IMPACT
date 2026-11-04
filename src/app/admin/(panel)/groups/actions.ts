"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/supabase/admin";
import { isUuid, parseGroup } from "@/lib/validate";

export type ActionResult = { ok: boolean };

async function activeCoachExists(coachId: string): Promise<boolean> {
  const { data } = await db()
    .from("coaches")
    .select("id")
    .eq("id", coachId)
    .eq("active", true)
    .maybeSingle();
  return data !== null;
}

export async function createGroup(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const input = parseGroup(formData);
  if (!input || !(await activeCoachExists(input.coach_id))) return { ok: false };
  const { error } = await db().from("groups").insert(input);
  if (error) return { ok: false };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function updateGroup(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = formData.get("id");
  const input = parseGroup(formData);
  if (!isUuid(id) || !input || !(await activeCoachExists(input.coach_id))) return { ok: false };
  const { error } = await db().from("groups").update(input).eq("id", id).eq("active", true);
  if (error) return { ok: false };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function deactivateGroup(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isUuid(id)) return { ok: false };
  const { error } = await db().from("groups").update({ active: false }).eq("id", id);
  if (error) return { ok: false };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

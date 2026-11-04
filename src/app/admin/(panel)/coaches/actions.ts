"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/supabase/admin";
import { generateToken } from "@/lib/token";
import { isUuid, parseCoach } from "@/lib/validate";

export type ActionResult = { ok: boolean };

export async function createCoach(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const input = parseCoach(formData);
  if (!input) return { ok: false };
  const { error } = await db()
    .from("coaches")
    .insert({ ...input, token: generateToken() });
  if (error) return { ok: false };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function updateCoach(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = formData.get("id");
  const input = parseCoach(formData);
  if (!isUuid(id) || !input) return { ok: false };
  const { error } = await db().from("coaches").update(input).eq("id", id).eq("active", true);
  if (error) return { ok: false };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** Soft delete. The coach's groups are deactivated too, so they leave the tracking. */
export async function deactivateCoach(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isUuid(id)) return { ok: false };
  const { error } = await db().from("coaches").update({ active: false }).eq("id", id);
  if (error) return { ok: false };
  const { error: err2 } = await db().from("groups").update({ active: false }).eq("coach_id", id);
  if (err2) return { ok: false };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** New token: the old personal link stops working immediately. */
export async function regenerateToken(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isUuid(id)) return { ok: false };
  const { error } = await db()
    .from("coaches")
    .update({ token: generateToken() })
    .eq("id", id)
    .eq("active", true);
  if (error) return { ok: false };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

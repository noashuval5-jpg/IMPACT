"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/supabase/admin";
import { isSunday } from "@/lib/week";

export type SettingsState = { status: "idle" | "saved" | "notSunday" | "error" };

export async function saveSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireAdmin();
  const date = String(formData.get("program_start_date") ?? "");
  if (!isSunday(date)) return { status: "notSunday" };
  const { error } = await db()
    .from("settings")
    .upsert({ id: 1, program_start_date: date }, { onConflict: "id" });
  if (error) return { status: "error" };
  revalidatePath("/", "layout");
  return { status: "saved" };
}

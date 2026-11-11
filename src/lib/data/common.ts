import "server-only";
import { db } from "@/lib/supabase/admin";
import { LESSON_COLUMNS, type Lesson } from "@/lib/types";
import { getProgramStatus, startDateToSave, type ProgramStatus } from "@/lib/week";

export async function getStartDate(): Promise<string | null> {
  const { data, error } = await db()
    .from("settings")
    .select("program_start_date")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return (data?.program_start_date as string | null | undefined) ?? null;
}

export async function getStatus(now: Date = new Date()): Promise<{
  startDate: string | null;
  status: ProgramStatus;
}> {
  let startDate = await getStartDate();
  // No start date to manage: the program starts automatically in the current week.
  const toSave = startDateToSave(startDate, now);
  if (toSave) {
    const { error } = await db()
      .from("settings")
      .upsert({ id: 1, program_start_date: toSave }, { onConflict: "id" });
    if (error) throw error;
    startDate = toSave;
  }
  return { startDate, status: getProgramStatus(startDate, now) };
}

export async function getLesson(week: number): Promise<Lesson | null> {
  const { data, error } = await db()
    .from("lessons")
    .select(LESSON_COLUMNS)
    .eq("week_number", week)
    .maybeSingle();
  if (error) throw error;
  return (data as Lesson | null) ?? null;
}

/** True when a lesson has any content in at least one language. */
export function lessonHasContent(lesson: Lesson | null): lesson is Lesson {
  if (!lesson) return false;
  return [lesson.title_he, lesson.title_ar, lesson.briefing_he, lesson.briefing_ar].some(
    (v) => v.trim().length > 0,
  );
}

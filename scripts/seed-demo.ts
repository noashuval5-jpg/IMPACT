/**
 * npm run seed:demo — fills the database with clearly fake demo data.
 * Every demo row has is_demo = true, so `npm run seed:clear` removes exactly these rows.
 */
import { generateToken } from "../src/lib/token";
import {
  addDays,
  closedWeeks,
  daysBetween,
  getProgramStatus,
  jerusalemDate,
  weekStartDate,
} from "../src/lib/week";
import { confirm, connect, fail } from "./_shared";

async function main() {
  const { supabase, url } = connect();
  await confirm(`This adds DEMO data to: ${url}`);

  const { data: already, error: checkErr } = await supabase
    .from("coaches")
    .select("id")
    .eq("is_demo", true)
    .limit(1);
  if (checkErr) fail("Could not read coaches", checkErr);
  if ((already ?? []).length > 0) fail("Demo data already exists. Run `npm run seed:clear` first.");

  // Start date: keep the existing one; if none, start 3 weeks ago (so this is week 4).
  const { data: settings } = await supabase
    .from("settings")
    .select("program_start_date")
    .eq("id", 1)
    .maybeSingle();
  let startDate = (settings?.program_start_date as string | null | undefined) ?? null;
  if (!startDate) {
    const today = jerusalemDate(new Date());
    const dow = (daysBetween("2026-01-04", today) % 7 + 7) % 7; // 2026-01-04 is a Sunday
    startDate = addDays(today, -dow - 21);
    const { error } = await supabase
      .from("settings")
      .upsert({ id: 1, program_start_date: startDate }, { onConflict: "id" });
    if (error) fail("Could not set the start date", error);
    console.log(`Program start date set to ${startDate}`);
  }
  const status = getProgramStatus(startDate, new Date());

  // Coaches
  const coachRows = Array.from({ length: 10 }, (_, i) => ({
    full_name: `מאמן דמו ${i + 1}`,
    role: i % 2 === 0 ? "מאמן דמו – כדורגל" : "מדריך דמו – חוג",
    phone: `000000000${i}`,
    language: i % 2 === 0 ? "ar" : "he",
    token: generateToken(),
    is_demo: true,
  }));
  const { data: coaches, error: coachErr } = await supabase
    .from("coaches")
    .insert(coachRows)
    .select("id,full_name");
  if (coachErr || !coaches) fail("Could not create coaches", coachErr);

  // Groups: coaches 1-4 get two groups, the rest one → 14 groups.
  const groupRows = coaches.flatMap((c, i) =>
    Array.from({ length: i < 4 ? 2 : 1 }, (_, k) => ({
      name: `קבוצת דמו ${i + 1}${i < 4 ? (k === 0 ? "א" : "ב") : ""}`,
      coach_id: c.id as string,
      is_demo: true,
    })),
  );
  const { data: groups, error: groupErr } = await supabase
    .from("groups")
    .insert(groupRows)
    .select("id,coach_id");
  if (groupErr || !groups) fail("Could not create groups", groupErr);

  // Lessons 1-3, only where no lesson exists yet (never overwrite real content).
  const { data: existing } = await supabase.from("lessons").select("week_number");
  const taken = new Set((existing ?? []).map((l) => l.week_number as number));
  const lessons = [1, 2, 3]
    .filter((w) => !taken.has(w))
    .map((w) => ({
      week_number: w,
      title_he: `[דמו] תדריך לדוגמה – שבוע ${w}`,
      title_ar: `[تجريبي] إرشاد تجريبي – الأسبوع ${w}`,
      briefing_he: `זהו תוכן דמו בלבד לשבוע ${w}.\nכאן יופיע התדריך האמיתי שהמאמן מעביר בסוף האימון.`,
      briefing_ar: `هذا محتوى تجريبي فقط للأسبوع ${w}.\nهنا سيظهر الإرشاد الحقيقي الذي يقدّمه المدرب في نهاية التدريب.`,
      message_he: `[דמו] הורים יקרים, זו הודעת דמו לשבוע ${w}.`,
      message_ar: `[تجريبي] أهلنا الأعزاء، هذه رسالة تجريبية للأسبوع ${w}.`,
      is_demo: true,
    }));
  if (lessons.length > 0) {
    const { error } = await supabase.from("lessons").insert(lessons);
    if (error) fail("Could not create lessons", error);
  }

  // Completions: most deliver, coaches 8-9 miss often, coach 10 never delivers.
  const lastPast = closedWeeks(status);
  const current = status.kind === "active" ? status.week : null;
  const coachIndex = new Map(coaches.map((c, i) => [c.id as string, i]));
  const completions: Record<string, unknown>[] = [];
  groups.forEach((g, gi) => {
    const ci = coachIndex.get(g.coach_id as string) ?? 0;
    if (ci === 9) return; // never
    const weeks = Array.from({ length: lastPast }, (_, i) => i + 1);
    if (current && ci < 5) weeks.push(current); // some already marked this week
    for (const w of weeks) {
      const roll = (gi * 7 + w * 13 + ci * 5) % 10;
      const delivers = ci >= 7 ? roll < 4 : roll < 9;
      if (!delivers) continue;
      completions.push({
        group_id: g.id,
        coach_id: g.coach_id,
        week_number: w,
        completed_at: `${addDays(weekStartDate(startDate, w), 1 + (roll % 4))}T16:30:00Z`,
      });
    }
  });
  if (completions.length > 0) {
    const { error } = await supabase.from("completions").insert(completions);
    if (error) fail("Could not create completions", error);
  }

  console.log(
    `Done: ${coaches.length} coaches, ${groups.length} groups, ${lessons.length} lessons, ${completions.length} completions.`,
  );
}

void main();

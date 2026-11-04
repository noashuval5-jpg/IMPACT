/**
 * npm run seed:clear — removes ONLY demo rows (is_demo = true) and their completions.
 * Real coaches, groups, lessons and completions are never touched.
 */
import { confirm, connect, fail } from "./_shared";

async function main() {
  const { supabase, url } = connect();
  await confirm(`This deletes DEMO data (is_demo = true) from: ${url}`);

  const { data: demoCoaches, error } = await supabase
    .from("coaches")
    .select("id")
    .eq("is_demo", true);
  if (error) fail("Could not read coaches", error);
  const ids = (demoCoaches ?? []).map((c) => c.id as string);

  if (ids.length > 0) {
    const { error: e1 } = await supabase.from("completions").delete().in("coach_id", ids);
    if (e1) fail("Could not delete completions", e1);
  }
  const { data: demoGroups } = await supabase.from("groups").select("id").eq("is_demo", true);
  const groupIds = (demoGroups ?? []).map((g) => g.id as string);
  if (groupIds.length > 0) {
    const { error: e2 } = await supabase.from("completions").delete().in("group_id", groupIds);
    if (e2) fail("Could not delete completions", e2);
  }
  for (const table of ["groups", "coaches", "lessons"] as const) {
    const { error: e } = await supabase.from(table).delete().eq("is_demo", true);
    if (e) fail(`Could not delete demo ${table}`, e);
  }
  console.log(
    `Removed demo data (${ids.length} coaches). The program start date in settings was left as is.`,
  );
}

void main();

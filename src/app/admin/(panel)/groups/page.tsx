import { requireAdmin } from "@/lib/auth";
import { listCoaches, listGroups } from "@/lib/data/admin";
import { getI18n } from "@/lib/i18n/server";
import { GroupsManager } from "./GroupsManager";

export default async function GroupsPage() {
  await requireAdmin();
  const { t } = await getI18n("he");
  const [coaches, groups] = await Promise.all([
    listCoaches({ activeOnly: true }),
    listGroups({ activeOnly: true }),
  ]);
  const coachOptions = coaches.map((c) => ({ id: c.id, name: c.full_name }));
  const names = new Map(coachOptions.map((c) => [c.id, c.name]));
  const rows = groups.map((g) => ({
    id: g.id,
    name: g.name,
    coach_id: g.coach_id,
    coachName: names.get(g.coach_id) ?? "—",
  }));

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">{t.groups}</h1>
      <GroupsManager t={t} rows={rows} coaches={coachOptions} />
    </div>
  );
}

import { ProgramStatusLine } from "@/components/ProgramStatusLine";
import { requireAdmin } from "@/lib/auth";
import { getStatus } from "@/lib/data/common";
import { getI18n } from "@/lib/i18n/server";

export default async function DashboardPage() {
  await requireAdmin();
  const { t } = await getI18n("he");
  const { startDate, status } = await getStatus();
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">{t.dashboard}</h1>
      <ProgramStatusLine t={t} status={status} startDate={startDate} />
    </div>
  );
}

import { ProgramStatusLine } from "@/components/ProgramStatusLine";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { getStatus } from "@/lib/data/common";
import { getI18n } from "@/lib/i18n/server";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  await requireAdmin();
  const { t } = await getI18n("he");
  const { startDate, status } = await getStatus();
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">{t.settings}</h1>
      <Card>
        <div className="mb-4">
          <ProgramStatusLine t={t} status={status} startDate={startDate} />
        </div>
        <SettingsForm t={t} startDate={startDate} />
      </Card>
    </div>
  );
}

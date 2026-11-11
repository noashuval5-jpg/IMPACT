import { requireAdmin } from "@/lib/auth";
import { coachLink, listCoaches, siteUrl } from "@/lib/data/admin";
import { getDict } from "@/lib/i18n/dict";
import { getI18n } from "@/lib/i18n/server";
import { fillTemplate, waLink } from "@/lib/phone";
import { CoachesManager, type CoachRow } from "./CoachesManager";

export default async function CoachesPage() {
  await requireAdmin();
  const { t } = await getI18n("he");
  const [coaches, base] = await Promise.all([listCoaches({ activeOnly: true }), siteUrl()]);

  const rows: CoachRow[] = coaches.map((c) => {
    const link = coachLink(base, c.token);
    // The welcome message goes to the coach, so it is written in the coach's language.
    const welcome = fillTemplate(getDict(c.language).welcomeMessage, {
      name: c.full_name,
      link,
    });
    return {
      id: c.id,
      full_name: c.full_name,
      role: c.role,
      phone: c.phone,
      language: c.language,
      link,
      welcomeHref: c.phone ? waLink(c.phone, welcome) : null,
    };
  });

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">{t.coaches}</h1>
      <CoachesManager t={t} rows={rows} />
    </div>
  );
}

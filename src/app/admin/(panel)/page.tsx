import { ProgramStatusLine } from "@/components/ProgramStatusLine";
import { Matrix, NeverBadge } from "@/components/stats/Matrix";
import { WeeklyChart } from "@/components/stats/WeeklyChart";
import { btn, Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { coachLink, siteUrl } from "@/lib/data/admin";
import { loadStats } from "@/lib/data/stats";
import { getDict } from "@/lib/i18n/dict";
import { getI18n } from "@/lib/i18n/server";
import { fillTemplate, waLink } from "@/lib/phone";

function StatCard({
  label,
  value,
  sub,
  tone = "brand",
  children,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "brand" | "ok" | "bad";
  children?: React.ReactNode;
}) {
  const color = tone === "ok" ? "text-ok" : tone === "bad" ? "text-bad" : "text-brand";
  return (
    <Card>
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className={`mt-1 text-3xl font-bold tabular-nums ${color}`}>{value}</p>
      {sub ? <p className="mt-1 text-sm text-muted">{sub}</p> : null}
      {children}
    </Card>
  );
}

export default async function DashboardPage() {
  await requireAdmin();
  const { t } = await getI18n("he");
  const [{ stats, status, startDate, coaches }, base] = await Promise.all([
    loadStats(),
    siteUrl(),
  ]);
  const coachById = new Map(coaches.map((c) => [c.id, c]));
  const never = stats.coaches.filter((c) => c.never);
  const neverIds = new Set(never.map((c) => c.coachId));
  const pending = stats.coaches.filter((c) => c.pendingGroups.length > 0);

  return (
    <div className="grid min-w-0 gap-5">
      <div>
        <h1 className="text-2xl font-bold">{t.dashboard}</h1>
        <ProgramStatusLine t={t} status={status} startDate={startDate} />
      </div>

      {status.kind === "active" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label={t.groupsDelivered}
            value={`${stats.current.groupsPct}%`}
            sub={fillTemplate(t.doneOutOf, {
              done: stats.current.groupsDone,
              total: stats.current.groupsTotal,
            })}
            tone={stats.current.groupsPct >= 80 ? "ok" : "brand"}
          />
          <StatCard
            label={t.coachesDelivered}
            value={String(stats.current.coachesDelivered)}
            sub={fillTemplate(t.totalCoaches, { n: stats.current.coachesTotal })}
          />
          <StatCard
            label={t.coachesNever}
            value={String(stats.neverCount)}
            tone={stats.neverCount > 0 ? "bad" : "ok"}
          >
            {never.length > 0 ? (
              <ul className="mt-2 grid gap-1 text-sm">
                {never.map((c) => (
                  <li key={c.coachId}>
                    {c.name}
                    <NeverBadge t={t} />
                  </li>
                ))}
              </ul>
            ) : null}
          </StatCard>
        </div>
      ) : null}

      {status.kind === "active" ? (
        <Card title={t.notDeliveredThisWeek}>
          {pending.length === 0 ? (
            <p className="text-ok">✓ {t.everyoneDelivered}</p>
          ) : (
            <ul className="divide-y divide-line">
              {pending.map((c) => {
                const coach = coachById.get(c.coachId);
                const reminder =
                  coach && coach.phone
                    ? waLink(
                        coach.phone,
                        fillTemplate(getDict(coach.language).reminderMessage, {
                          name: coach.full_name,
                          link: coachLink(base, coach.token),
                        }),
                      )
                    : null;
                return (
                  <li
                    key={c.coachId}
                    className="flex flex-wrap items-center justify-between gap-2 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {c.name}
                        {c.never ? <NeverBadge t={t} /> : null}
                      </p>
                      <p className="text-sm text-muted">
                        {t.pendingGroups}: {c.pendingGroups.join(", ")}
                      </p>
                    </div>
                    {reminder ? (
                      <a
                        href={reminder}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={btn.whatsapp + " min-h-11 px-4 text-sm"}
                      >
                        {t.sendReminder}
                      </a>
                    ) : (
                      <span className="text-sm text-muted">{t.noPhone}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      ) : null}

      {stats.weekly.length > 0 ? (
        <Card title={t.completionByWeek}>
          <WeeklyChart t={t} weekly={stats.weekly} />
        </Card>
      ) : null}

      <Card title={t.weeklyTracking}>
        <Matrix t={t} rows={stats.rows} neverIds={neverIds} />
      </Card>
    </div>
  );
}

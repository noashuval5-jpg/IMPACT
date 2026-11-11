import { ProgramStatusLine } from "@/components/ProgramStatusLine";
import { Matrix, NeverBadge } from "@/components/stats/Matrix";
import { WeeklyChart } from "@/components/stats/WeeklyChart";
import { AlertIcon, ChartIcon, CheckCircleIcon, GridIcon, UsersIcon, WhatsAppIcon } from "@/components/icons";
import { Hero } from "@/components/Hero";
import { btn, Card, type Accent } from "@/components/ui";
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
  accent,
  icon,
  children,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: Accent;
  icon: React.ReactNode;
  children?: React.ReactNode;
}) {
  const bubble: Record<Accent, string> = {
    sky: "bg-sky text-ink",
    lime: "bg-lime text-ink",
    sun: "bg-sun text-ink",
    grape: "bg-grape text-white",
    flame: "bg-flame text-ink",
  };
  return (
    <Card accent={accent}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted">{label}</p>
          <p className="mt-1 text-4xl font-extrabold tabular-nums text-ink">{value}</p>
          {sub ? <p className="mt-1 text-sm text-muted">{sub}</p> : null}
        </div>
        <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bubble[accent]}`}>
          {icon}
        </span>
      </div>
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
  const pending = stats.coaches.filter((c) => c.pendingThisWeek);

  return (
    <div className="grid min-w-0 gap-5">
      <Hero
        title={t.dashboard}
        subtitle={
          <ProgramStatusLine t={t} status={status} startDate={startDate} className="font-semibold text-ink" />
        }
      />

      {status.kind === "active" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label={t.coachesDelivered}
            value={`${stats.current.pct}%`}
            sub={fillTemplate(t.doneOutOf, {
              done: stats.current.delivered,
              total: stats.current.total,
            })}
            accent="lime"
            icon={<CheckCircleIcon className="h-6 w-6" />}
          />
          <StatCard
            label={t.notDeliveredThisWeek}
            value={String(pending.length)}
            sub={fillTemplate(t.totalCoaches, { n: stats.current.total })}
            accent="sun"
            icon={<UsersIcon className="h-6 w-6" />}
          />
          <StatCard
            label={t.coachesNever}
            value={String(stats.neverCount)}
            accent="grape"
            icon={<AlertIcon className="h-6 w-6" />}
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
        <Card title={t.notDeliveredThisWeek} icon={<UsersIcon />} accent="flame">
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
                    </div>
                    {reminder ? (
                      <a
                        href={reminder}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={btn.whatsapp + " min-h-11 px-4 text-sm"}
                      >
                        <WhatsAppIcon />
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
        <Card title={t.completionByWeek} icon={<ChartIcon />} accent="sky">
          <WeeklyChart t={t} weekly={stats.weekly} />
        </Card>
      ) : null}

      <Card title={t.weeklyTracking} icon={<GridIcon />} accent="lime">
        <Matrix t={t} rows={stats.rows} neverIds={neverIds} />
      </Card>
    </div>
  );
}

import { Logo } from "@/components/Logo";
import { ProgramStatusLine } from "@/components/ProgramStatusLine";
import { Matrix, NeverBadge } from "@/components/stats/Matrix";
import { WeeklyChart } from "@/components/stats/WeeklyChart";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { loadStats } from "@/lib/data/stats";
import { formatTimestamp } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { fillTemplate } from "@/lib/phone";
import { PrintButton } from "./PrintButton";

export default async function ReportPage() {
  await requireAdmin();
  const { t } = await getI18n("he");
  const { stats, status, startDate } = await loadStats();
  const neverIds = new Set(stats.coaches.filter((c) => c.never).map((c) => c.coachId));

  return (
    <article className="mx-auto grid min-w-0 max-w-4xl gap-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo className="h-12 w-12" />
          <div>
            <h1 className="text-2xl font-bold">{t.reportTitle}</h1>
            <p className="text-muted">
              {t.appName} · {t.townName}
            </p>
          </div>
        </div>
        <PrintButton label={t.saveAsPdf} />
      </header>

      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <ProgramStatusLine t={t} status={status} startDate={startDate} />
        <p className="text-muted">
          {fillTemplate(t.generatedOn, { date: formatTimestamp(new Date().toISOString()) })}
        </p>
      </div>

      <Card>
        <p className="text-sm font-medium text-muted">{t.overallCompletion}</p>
        <p className="mt-1 text-4xl font-bold text-brand tabular-nums">{stats.overall.pct}%</p>
        <p className="mt-1 text-sm text-muted">
          {fillTemplate(t.doneOutOf, { done: stats.overall.done, total: stats.overall.counted })}
        </p>
      </Card>

      {stats.weekly.length > 0 ? (
        <Card title={t.completionByWeek}>
          <WeeklyChart t={t} weekly={stats.weekly} />
        </Card>
      ) : null}

      <Card title={t.perCoach}>
        {stats.coaches.length === 0 ? (
          <p className="text-muted">{t.noData}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="py-2 text-start font-medium">{t.coach}</th>
                <th className="py-2 text-start font-medium">{t.legendDone}</th>
                <th className="w-2/5 py-2 text-start font-medium">{t.deliveryRate}</th>
              </tr>
            </thead>
            <tbody>
              {stats.coaches.map((c) => (
                <tr key={c.coachId} className="border-b border-line last:border-0">
                  <td className="py-2">
                    {c.name}
                    {c.never ? <NeverBadge t={t} /> : null}
                  </td>
                  <td className="py-2 tabular-nums">
                    {fillTemplate(t.doneOutOf, { done: c.done, total: c.counted })}
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-page">
                        <div
                          className={`h-full rounded-full ${c.rate >= 80 ? "bg-lime" : c.rate >= 50 ? "bg-sky" : "bg-flame"}`}
                          style={{ width: `${c.rate}%` }}
                        />
                      </div>
                      <span className="w-10 text-end font-semibold tabular-nums">{c.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card title={t.weeklyTracking}>
        <Matrix t={t} rows={stats.rows} neverIds={neverIds} />
      </Card>

      <p className="text-center text-sm text-muted">{t.tagline}</p>
    </article>
  );
}

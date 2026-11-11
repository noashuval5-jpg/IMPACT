import type { Dict } from "@/lib/i18n/dict";
import { fillTemplate } from "@/lib/phone";
import { ALL_WEEKS } from "@/lib/week";

/** Plain CSS bar chart: completion % per week. Future weeks are shown as empty slots. */
export function WeeklyChart({
  t,
  weekly,
}: {
  t: Dict;
  weekly: { week: number; done: number; total: number; pct: number }[];
}) {
  const byWeek = new Map(weekly.map((w) => [w.week, w]));
  return (
    <figure>
      <div
        className="flex h-48 items-end gap-1.5 border-b border-line sm:gap-3"
        role="img"
        aria-label={t.completionByWeek}
      >
        {ALL_WEEKS.map((w) => {
          const item = byWeek.get(w);
          const pct = item?.pct ?? 0;
          const tone = pct >= 80 ? "bg-lime" : pct >= 50 ? "bg-sky" : "bg-flame";
          return (
            <div key={w} className="flex h-full flex-1 flex-col items-center justify-end">
              {item ? (
                <>
                  <span className="mb-1 text-xs font-semibold tabular-nums">{pct}%</span>
                  <div
                    className={`w-full max-w-10 rounded-t-xl ${tone} shadow-[inset_0_-6px_0_0_rgb(0_0_0/0.08)] transition-all`}
                    style={{ height: `${Math.max(pct, 2)}%` }}
                    title={`${fillTemplate(t.week, { n: w })}: ${fillTemplate(t.doneOutOf, {
                      done: item.done,
                      total: item.total,
                    })}`}
                  />
                </>
              ) : (
                <div className="h-1 w-full max-w-10 rounded-t-md bg-line" />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-1.5 sm:gap-3">
        {ALL_WEEKS.map((w) => (
          <span key={w} className="flex-1 text-center text-xs text-muted tabular-nums">
            {w}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">{t.completionByWeek}</figcaption>
    </figure>
  );
}

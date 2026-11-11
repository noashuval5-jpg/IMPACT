import Link from "next/link";
import type { Dict } from "@/lib/i18n/dict";
import { fillTemplate } from "@/lib/phone";
import { ALL_WEEKS } from "@/lib/week";

/** Ten big week buttons. The current week is marked; the selected one is filled. */
export function WeekPicker({
  t,
  token,
  selected,
  current,
}: {
  t: Dict;
  token: string;
  selected: number;
  current: number | null;
}) {
  return (
    <nav aria-label={t.allWeeks} className="grid gap-2">
      <p className="text-sm font-medium text-muted">{t.allWeeks}</p>
      <ul className="grid grid-cols-5 gap-2">
        {ALL_WEEKS.map((w) => {
          const isSelected = w === selected;
          const isCurrent = w === current;
          return (
            <li key={w}>
              <Link
                href={w === current ? `/c/${token}` : `/c/${token}?week=${w}`}
                aria-current={isSelected ? "page" : undefined}
                aria-label={
                  fillTemplate(t.week, { n: w }) + (isCurrent ? ` (${t.currentWeekBadge})` : "")
                }
                className={`relative flex min-h-12 items-center justify-center rounded-xl border text-lg font-bold tabular-nums ${
                  isSelected
                    ? "border-brand bg-brand text-white"
                    : isCurrent
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-line bg-white text-ink hover:bg-brand-soft"
                }`}
              >
                {w}
                {isCurrent ? (
                  <span
                    aria-hidden="true"
                    className={`absolute top-1.5 end-1.5 h-2 w-2 rounded-full ${isSelected ? "bg-white" : "bg-brand"}`}
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

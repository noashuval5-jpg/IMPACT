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
                className={`relative flex min-h-12 items-center justify-center rounded-2xl border-2 text-lg transition font-bold tabular-nums ${
                  isSelected
                    ? "border-sky bg-sky text-ink shadow-[0_3px_0_0_#2a9cc0]"
                    : isCurrent
                      ? "border-sun bg-warn-soft text-ink"
                      : "border-line bg-white text-ink hover:border-sky hover:bg-brand-soft"
                }`}
              >
                {w}
                {isCurrent ? (
                  <span
                    aria-hidden="true"
                    className={"absolute top-1.5 end-1.5 h-2.5 w-2.5 rounded-full bg-grape ring-2 ring-white"}
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

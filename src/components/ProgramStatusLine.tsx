import { formatDate } from "@/lib/format";
import type { Dict } from "@/lib/i18n/dict";
import { fillTemplate } from "@/lib/phone";
import { weekEndDate, weekStartDate, type ProgramStatus } from "@/lib/week";

/** One line: "Week 3 of 10 · 01.11.2026 to 07.11.2026" / not started / finished. */
export function ProgramStatusLine({
  t,
  status,
  startDate,
  className = "text-muted",
}: {
  t: Dict;
  status: ProgramStatus;
  startDate: string | null;
  className?: string;
}) {
  if (!startDate || status.kind === "not_started") {
    return <p className={className}>{t.notStarted}</p>;
  }
  if (status.kind === "finished") return <p className={className}>{t.finished}</p>;
  return (
    <p className={className}>
      {fillTemplate(t.weekOfTotal, { n: status.week })} ·{" "}
      {fillTemplate(t.weekRange, {
        from: formatDate(weekStartDate(startDate, status.week)),
        to: formatDate(weekEndDate(startDate, status.week)),
      })}
    </p>
  );
}

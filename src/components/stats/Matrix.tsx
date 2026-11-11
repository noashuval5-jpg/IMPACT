import type { Dict } from "@/lib/i18n/dict";
import { fillTemplate } from "@/lib/phone";
import type { CellState, MatrixRow } from "@/lib/stats";
import { ALL_WEEKS } from "@/lib/week";

const CELL: Record<CellState, { cls: string; mark: string }> = {
  done: { cls: "bg-ok-soft text-ok", mark: "✓" },
  missed: { cls: "bg-bad-soft text-bad", mark: "✗" },
  pending: { cls: "bg-warn-soft text-warn", mark: "•" },
  future: { cls: "bg-page text-muted/50", mark: "" },
};

function label(t: Dict, state: CellState): string {
  return state === "done"
    ? t.legendDone
    : state === "missed"
      ? t.legendMissed
      : state === "pending"
        ? t.legendPending
        : t.legendFuture;
}

export function Legend({ t }: { t: Dict }) {
  return (
    <ul className="flex flex-wrap gap-3 text-sm">
      {(Object.keys(CELL) as CellState[]).map((s) => (
        <li key={s} className="flex items-center gap-1.5">
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-md font-bold ${CELL[s].cls}`}
            aria-hidden="true"
          >
            {CELL[s].mark}
          </span>
          {label(t, s)}
        </li>
      ))}
    </ul>
  );
}

export function NeverBadge({ t }: { t: Dict }) {
  return (
    <span className="ms-1 inline-flex items-center rounded-full bg-bad px-2 py-0.5 text-[11px] font-bold text-white">
      {t.never}
    </span>
  );
}

export function Matrix({
  t,
  rows,
  neverIds = new Set<string>(),
}: {
  t: Dict;
  rows: MatrixRow[];
  neverIds?: Set<string>;
}) {
  if (rows.length === 0) return <p className="text-muted">{t.noData}</p>;
  return (
    <div className="grid min-w-0 gap-3">
      <div className="relative min-w-0 overflow-x-auto">
        <table className="w-full border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th className="sticky start-0 bg-white px-2 text-start font-medium text-muted">
                {t.coaches}
              </th>
              {ALL_WEEKS.map((w) => (
                <th key={w} className="w-9 min-w-9 text-center font-medium text-muted tabular-nums">
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.coachId}>
                <th scope="row" className="sticky start-0 bg-white px-2 py-1 text-start font-normal">
                  <span className="block max-w-48 truncate font-semibold">
                    {r.coachName}
                    {neverIds.has(r.coachId) ? <NeverBadge t={t} /> : null}
                  </span>
                </th>
                {r.cells.map((cell, i) => (
                  <td
                    key={i}
                    className={`h-9 rounded-md text-center font-bold ${CELL[cell].cls}`}
                    title={`${fillTemplate(t.week, { n: i + 1 })}: ${label(t, cell)}`}
                  >
                    <span aria-hidden="true">{CELL[cell].mark}</span>
                    <span className="sr-only">{label(t, cell)}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Legend t={t} />
    </div>
  );
}

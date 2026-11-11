/**
 * Dashboard / report calculations. Pure functions, unit tested.
 *
 * MVP: tracking is per coach (groups are hidden). A coach "delivered" a week
 * when they have at least one completion for that week.
 *
 * A cell is one (coach, week):
 *   done    – delivered
 *   missed  – the week is over and nothing was marked
 *   pending – the current week, not marked yet
 *   future  – the week has not started
 * Rates count past cells plus current-week cells that are already done,
 * so a coach is not penalised before the week is over.
 */
import { percent } from "./format";
import { ALL_WEEKS, closedWeeks, TOTAL_WEEKS, weekState, type ProgramStatus } from "./week";

export type CellState = "done" | "missed" | "pending" | "future";

export type StatsCoach = { id: string; full_name: string };
export type StatsCompletion = { coach_id: string; week_number: number };

export type MatrixRow = {
  coachId: string;
  coachName: string;
  cells: CellState[]; // index 0 = week 1
};

export type CoachStats = {
  coachId: string;
  name: string;
  done: number;
  counted: number;
  rate: number;
  never: boolean;
  pendingThisWeek: boolean;
};

export type Stats = {
  rows: MatrixRow[];
  coaches: CoachStats[];
  weekly: { week: number; done: number; total: number; pct: number }[];
  current: {
    week: number | null;
    delivered: number;
    total: number;
    pct: number;
  };
  neverCount: number;
  overall: { done: number; counted: number; pct: number };
};

export function cellState(done: boolean, week: number, status: ProgramStatus): CellState {
  if (done) return "done";
  const state = weekState(week, status);
  if (state === "past") return "missed";
  if (state === "current") return "pending";
  return "future";
}

/** Counted in rates: past weeks, plus the current week once it is done. */
function isCounted(cell: CellState): boolean {
  return cell === "done" || cell === "missed";
}

export function computeStats(
  coaches: StatsCoach[],
  completions: StatsCompletion[],
  status: ProgramStatus,
): Stats {
  const doneSet = new Set(completions.map((c) => `${c.coach_id}:${c.week_number}`));

  const rows: MatrixRow[] = coaches
    .map((c) => ({
      coachId: c.id,
      coachName: c.full_name,
      cells: ALL_WEEKS.map((w) => cellState(doneSet.has(`${c.id}:${w}`), w, status)),
    }))
    .sort((a, b) => a.coachName.localeCompare(b.coachName, "he"));

  const current = status.kind === "active" ? status.week : null;
  const lastWeek = status.kind === "finished" ? TOTAL_WEEKS : (current ?? 0);

  const weekly = ALL_WEEKS.filter((w) => w <= lastWeek).map((w) => {
    const done = rows.filter((r) => r.cells[w - 1] === "done").length;
    return { week: w, done, total: rows.length, pct: percent(done, rows.length) };
  });

  // "Never": zero completions after at least one full week has passed.
  const fullWeekPassed = closedWeeks(status) >= 1;

  const coachStats: CoachStats[] = rows.map((r) => {
    const done = r.cells.filter((x) => x === "done").length;
    const counted = r.cells.filter(isCounted).length;
    return {
      coachId: r.coachId,
      name: r.coachName,
      done,
      counted,
      rate: percent(done, counted),
      never: fullWeekPassed && done === 0,
      pendingThisWeek: current !== null && r.cells[current - 1] === "pending",
    };
  });

  const delivered =
    current === null ? 0 : rows.filter((r) => r.cells[current - 1] === "done").length;

  const allCells = rows.flatMap((r) => r.cells);
  const overallDone = allCells.filter((x) => x === "done").length;
  const overallCounted = allCells.filter(isCounted).length;

  return {
    rows,
    coaches: coachStats,
    weekly,
    current: {
      week: current,
      delivered,
      total: rows.length,
      pct: percent(delivered, rows.length),
    },
    neverCount: coachStats.filter((c) => c.never).length,
    overall: { done: overallDone, counted: overallCounted, pct: percent(overallDone, overallCounted) },
  };
}

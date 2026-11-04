/**
 * Dashboard / report calculations. Pure functions, unit tested.
 *
 * A cell is one (group, week):
 *   done    – a completion exists
 *   missed  – the week is over and there is no completion
 *   pending – the current week, not marked yet
 *   future  – the week has not started
 * Rates count past cells plus current-week cells that are already done,
 * so a coach is not penalised before the week is over.
 */
import { percent } from "./format";
import { ALL_WEEKS, closedWeeks, TOTAL_WEEKS, weekState, type ProgramStatus } from "./week";

export type CellState = "done" | "missed" | "pending" | "future";

export type StatsCoach = { id: string; full_name: string };
export type StatsGroup = { id: string; name: string; coach_id: string };
export type StatsCompletion = { group_id: string; coach_id: string; week_number: number };

export type MatrixRow = {
  groupId: string;
  groupName: string;
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
  pendingGroups: string[]; // current week, not marked
};

export type Stats = {
  rows: MatrixRow[];
  coaches: CoachStats[];
  weekly: { week: number; done: number; total: number; pct: number }[];
  current: {
    week: number | null;
    groupsDone: number;
    groupsTotal: number;
    groupsPct: number;
    coachesDelivered: number;
    coachesTotal: number;
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
  groups: StatsGroup[],
  completions: StatsCompletion[],
  status: ProgramStatus,
): Stats {
  const coachName = new Map(coaches.map((c) => [c.id, c.full_name]));
  const activeGroups = groups.filter((g) => coachName.has(g.coach_id));
  const doneSet = new Set(completions.map((c) => `${c.group_id}:${c.week_number}`));

  const rows: MatrixRow[] = activeGroups
    .map((g) => ({
      groupId: g.id,
      groupName: g.name,
      coachId: g.coach_id,
      coachName: coachName.get(g.coach_id) ?? "",
      cells: ALL_WEEKS.map((w) => cellState(doneSet.has(`${g.id}:${w}`), w, status)),
    }))
    .sort(
      (a, b) =>
        a.coachName.localeCompare(b.coachName, "he") || a.groupName.localeCompare(b.groupName, "he"),
    );

  const current = status.kind === "active" ? status.week : null;
  const lastWeek = status.kind === "finished" ? TOTAL_WEEKS : (current ?? 0);

  const weekly = ALL_WEEKS.filter((w) => w <= lastWeek).map((w) => {
    const done = rows.filter((r) => r.cells[w - 1] === "done").length;
    return { week: w, done, total: rows.length, pct: percent(done, rows.length) };
  });

  // "Never": zero completions at all (any group, ever) after at least one full week.
  const coachesWithAny = new Set(completions.map((c) => c.coach_id));
  const fullWeekPassed = closedWeeks(status) >= 1;

  const coachStats: CoachStats[] = coaches
    .map((c) => {
      const mine = rows.filter((r) => r.coachId === c.id);
      const cells = mine.flatMap((r) => r.cells);
      const done = cells.filter((x) => x === "done").length;
      const counted = cells.filter(isCounted).length;
      return {
        coachId: c.id,
        name: c.full_name,
        done,
        counted,
        rate: percent(done, counted),
        never: fullWeekPassed && !coachesWithAny.has(c.id),
        pendingGroups:
          current === null
            ? []
            : mine.filter((r) => r.cells[current - 1] === "pending").map((r) => r.groupName),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "he"));

  const groupsDone = current === null ? 0 : rows.filter((r) => r.cells[current - 1] === "done").length;
  const coachesWithGroups = coachStats.filter((c) => rows.some((r) => r.coachId === c.coachId));
  const coachesDelivered =
    current === null
      ? 0
      : coachesWithGroups.filter((c) =>
          rows.some((r) => r.coachId === c.coachId && r.cells[current - 1] === "done"),
        ).length;

  const allCells = rows.flatMap((r) => r.cells);
  const overallDone = allCells.filter((x) => x === "done").length;
  const overallCounted = allCells.filter(isCounted).length;

  return {
    rows,
    coaches: coachStats,
    weekly,
    current: {
      week: current,
      groupsDone,
      groupsTotal: rows.length,
      groupsPct: percent(groupsDone, rows.length),
      coachesDelivered,
      coachesTotal: coachesWithGroups.length,
    },
    neverCount: coachStats.filter((c) => c.never).length,
    overall: { done: overallDone, counted: overallCounted, pct: percent(overallDone, overallCounted) },
  };
}

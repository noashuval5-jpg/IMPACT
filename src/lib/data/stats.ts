import "server-only";
import { computeStats, type Stats } from "@/lib/stats";
import type { Coach } from "@/lib/types";
import type { ProgramStatus } from "@/lib/week";
import { listCoaches, listCompletions } from "./admin";
import { getStatus } from "./common";

/** Loads everything the dashboard and report need. Admin only. */
export async function loadStats(): Promise<{
  stats: Stats;
  status: ProgramStatus;
  startDate: string | null;
  coaches: Coach[];
}> {
  const [coaches, completions, { status, startDate }] = await Promise.all([
    listCoaches({ activeOnly: true }),
    listCompletions(),
    getStatus(),
  ]);
  return { stats: computeStats(coaches, completions, status), status, startDate, coaches };
}

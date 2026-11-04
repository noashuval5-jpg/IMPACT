import { describe, expect, it } from "vitest";
import { cellState, computeStats } from "./stats";

const coaches = [
  { id: "a", full_name: "אבי" },
  { id: "b", full_name: "בסאם" },
  { id: "c", full_name: "גלית" }, // never delivers
];
const groups = [
  { id: "g1", name: "קבוצה 1", coach_id: "a" },
  { id: "g2", name: "קבוצה 2", coach_id: "a" },
  { id: "g3", name: "קבוצה 3", coach_id: "b" },
  { id: "g4", name: "קבוצה 4", coach_id: "c" },
  { id: "gx", name: "של מאמן לא פעיל", coach_id: "zzz" },
];
const completions = [
  { group_id: "g1", coach_id: "a", week_number: 1 },
  { group_id: "g1", coach_id: "a", week_number: 2 },
  { group_id: "g1", coach_id: "a", week_number: 3 },
  { group_id: "g2", coach_id: "a", week_number: 1 },
  { group_id: "g3", coach_id: "b", week_number: 2 },
];

describe("cellState", () => {
  it("classifies cells", () => {
    const s = { kind: "active", week: 3 } as const;
    expect(cellState(true, 5, s)).toBe("done");
    expect(cellState(false, 2, s)).toBe("missed");
    expect(cellState(false, 3, s)).toBe("pending");
    expect(cellState(false, 4, s)).toBe("future");
  });
});

describe("computeStats", () => {
  const stats = computeStats(coaches, groups, completions, { kind: "active", week: 3 });

  it("ignores groups of inactive coaches", () => {
    expect(stats.rows.map((r) => r.groupId)).not.toContain("gx");
    expect(stats.rows).toHaveLength(4);
  });

  it("summarises the current week", () => {
    expect(stats.current).toEqual({
      week: 3,
      groupsDone: 1,
      groupsTotal: 4,
      groupsPct: 25,
      coachesDelivered: 1,
      coachesTotal: 3,
    });
  });

  it("gives weekly percentages up to the current week", () => {
    expect(stats.weekly.map((w) => w.pct)).toEqual([50, 50, 25]);
  });

  it("flags coaches who never delivered after a full week", () => {
    expect(stats.coaches.find((c) => c.coachId === "c")?.never).toBe(true);
    expect(stats.coaches.find((c) => c.coachId === "b")?.never).toBe(false);
    expect(stats.neverCount).toBe(1);
  });

  it("does not flag anyone during week 1", () => {
    const s = computeStats(coaches, groups, [], { kind: "active", week: 1 });
    expect(s.neverCount).toBe(0);
  });

  it("computes per-coach rates without penalising the open week", () => {
    const a = stats.coaches.find((c) => c.coachId === "a");
    // g1: w1 w2 w3 done; g2: w1 done, w2 missed, w3 pending (not counted)
    expect(a).toMatchObject({ done: 4, counted: 5, rate: 80, pendingGroups: ["קבוצה 2"] });
  });

  it("lists pending groups for the reminder list", () => {
    expect(stats.coaches.find((c) => c.coachId === "b")?.pendingGroups).toEqual(["קבוצה 3"]);
  });

  it("handles not started and finished", () => {
    const ns = computeStats(coaches, groups, [], { kind: "not_started" });
    expect(ns.weekly).toEqual([]);
    expect(ns.current.week).toBeNull();
    const fin = computeStats(coaches, groups, completions, { kind: "finished" });
    expect(fin.weekly).toHaveLength(10);
    expect(fin.rows[0]?.cells[9]).toBe("missed");
    expect(fin.overall.counted).toBe(40);
  });
});

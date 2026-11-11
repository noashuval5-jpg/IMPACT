import { describe, expect, it } from "vitest";
import { cellState, computeStats } from "./stats";

const coaches = [
  { id: "a", full_name: "אבי" },
  { id: "b", full_name: "בסאם" },
  { id: "c", full_name: "גלית" }, // never delivers
];
const completions = [
  { coach_id: "a", week_number: 1 },
  { coach_id: "a", week_number: 2 },
  { coach_id: "a", week_number: 3 },
  { coach_id: "a", week_number: 3 }, // duplicate (old data with two groups) counts once
  { coach_id: "b", week_number: 2 },
  { coach_id: "zzz", week_number: 1 }, // inactive coach, ignored
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
  const stats = computeStats(coaches, completions, { kind: "active", week: 3 });

  it("has one row per active coach", () => {
    expect(stats.rows.map((r) => r.coachId)).toEqual(["a", "b", "c"]);
  });

  it("summarises the current week", () => {
    expect(stats.current).toEqual({ week: 3, delivered: 1, total: 3, pct: 33 });
  });

  it("gives weekly percentages up to the current week", () => {
    expect(stats.weekly.map((w) => w.pct)).toEqual([33, 67, 33]);
  });

  it("flags coaches who never delivered after a full week", () => {
    expect(stats.coaches.find((c) => c.coachId === "c")?.never).toBe(true);
    expect(stats.coaches.find((c) => c.coachId === "b")?.never).toBe(false);
    expect(stats.neverCount).toBe(1);
  });

  it("does not flag anyone during week 1", () => {
    expect(computeStats(coaches, [], { kind: "active", week: 1 }).neverCount).toBe(0);
  });

  it("computes per-coach rates without penalising the open week", () => {
    expect(stats.coaches.find((c) => c.coachId === "a")).toMatchObject({
      done: 3,
      counted: 3,
      rate: 100,
      pendingThisWeek: false,
    });
    // b: w1 missed, w2 done, w3 pending (not counted)
    expect(stats.coaches.find((c) => c.coachId === "b")).toMatchObject({
      done: 1,
      counted: 2,
      rate: 50,
      pendingThisWeek: true,
    });
  });

  it("handles not started and finished", () => {
    const ns = computeStats(coaches, [], { kind: "not_started" });
    expect(ns.weekly).toEqual([]);
    expect(ns.current.week).toBeNull();
    const fin = computeStats(coaches, completions, { kind: "finished" });
    expect(fin.weekly).toHaveLength(10);
    expect(fin.rows[0]?.cells[9]).toBe("missed");
    expect(fin.overall.counted).toBe(30);
  });
});

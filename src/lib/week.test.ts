import { describe, expect, it } from "vitest";
import {
  closedWeeks,
  currentSunday,
  startDateToSave,
  getProgramStatus,
  isSunday,
  jerusalemDate,
  weekEndDate,
  weekStartDate,
  weekState,
} from "./week";

// Program starts Sunday 2026-03-01.
const START = "2026-03-01";

describe("jerusalemDate", () => {
  it("uses Jerusalem time, not UTC", () => {
    // 2026-03-07 22:30 UTC = 2026-03-08 00:30 in Jerusalem (UTC+2 in winter)
    expect(jerusalemDate(new Date("2026-03-07T22:30:00Z"))).toBe("2026-03-08");
    expect(jerusalemDate(new Date("2026-03-07T21:30:00Z"))).toBe("2026-03-07");
  });
});

describe("isSunday", () => {
  it("detects Sundays", () => {
    expect(isSunday("2026-03-01")).toBe(true);
    expect(isSunday("2026-03-07")).toBe(false);
    expect(isSunday("2026-02-30")).toBe(false);
    expect(isSunday("nonsense")).toBe(false);
  });
});

describe("getProgramStatus", () => {
  it("is week 1 on the start Sunday at midnight Jerusalem", () => {
    // 2026-03-01 00:00 Jerusalem = 2026-02-28 22:00 UTC
    expect(getProgramStatus(START, new Date("2026-02-28T22:00:00Z"))).toEqual({
      kind: "active",
      week: 1,
    });
  });

  it("is not started one minute before the start", () => {
    expect(getProgramStatus(START, new Date("2026-02-28T21:59:00Z"))).toEqual({
      kind: "not_started",
    });
  });

  it("stays in week 1 on Saturday 23:59 and moves to week 2 on Sunday 00:00", () => {
    // Saturday 2026-03-07 23:59 Jerusalem = 21:59 UTC
    expect(getProgramStatus(START, new Date("2026-03-07T21:59:00Z"))).toEqual({
      kind: "active",
      week: 1,
    });
    // Sunday 2026-03-08 00:00 Jerusalem = 2026-03-07 22:00 UTC
    expect(getProgramStatus(START, new Date("2026-03-07T22:00:00Z"))).toEqual({
      kind: "active",
      week: 2,
    });
  });

  it("is not started when the start date is in the future", () => {
    expect(getProgramStatus("2027-01-03", new Date("2026-11-04T12:00:00Z"))).toEqual({
      kind: "not_started",
    });
  });

  it("is not started without a start date", () => {
    expect(getProgramStatus(null, new Date())).toEqual({ kind: "not_started" });
  });

  it("moves from week 10 to finished", () => {
    // Week 10 = 2026-05-03 .. 2026-05-09 (Israel is UTC+3 in May)
    // Saturday 2026-05-09 23:59 Jerusalem = 20:59 UTC
    expect(getProgramStatus(START, new Date("2026-05-09T20:59:00Z"))).toEqual({
      kind: "active",
      week: 10,
    });
    // Sunday 2026-05-10 00:00 Jerusalem = 2026-05-09 21:00 UTC → week 11 = finished
    expect(getProgramStatus(START, new Date("2026-05-09T21:00:00Z"))).toEqual({
      kind: "finished",
    });
  });

  it("handles the spring DST switch (Israel, Friday 2026-03-27)", () => {
    // Week 4 = 2026-03-22 .. 2026-03-28; clocks jump forward inside it.
    // Saturday 2026-03-28 23:59 Jerusalem (UTC+3) = 20:59 UTC
    expect(getProgramStatus(START, new Date("2026-03-28T20:59:00Z"))).toEqual({
      kind: "active",
      week: 4,
    });
    // Sunday 2026-03-29 00:00 Jerusalem (UTC+3) = 2026-03-28 21:00 UTC
    expect(getProgramStatus(START, new Date("2026-03-28T21:00:00Z"))).toEqual({
      kind: "active",
      week: 5,
    });
  });

  it("handles the autumn DST switch (Israel, Sunday 2026-10-25)", () => {
    const start = "2026-10-18";
    // Saturday 2026-10-24 23:59 Jerusalem (UTC+3) = 20:59 UTC → still week 1
    expect(getProgramStatus(start, new Date("2026-10-24T20:59:00Z"))).toEqual({
      kind: "active",
      week: 1,
    });
    // Sunday 2026-10-25 00:00 Jerusalem (still UTC+3) = 2026-10-24 21:00 UTC → week 2
    expect(getProgramStatus(start, new Date("2026-10-24T21:00:00Z"))).toEqual({
      kind: "active",
      week: 2,
    });
    // Saturday 2026-10-31 23:59 Jerusalem (now UTC+2) = 21:59 UTC → still week 2
    expect(getProgramStatus(start, new Date("2026-10-31T21:59:00Z"))).toEqual({
      kind: "active",
      week: 2,
    });
    // Sunday 2026-11-01 00:00 Jerusalem (UTC+2) = 2026-10-31 22:00 UTC → week 3
    expect(getProgramStatus(start, new Date("2026-10-31T22:00:00Z"))).toEqual({
      kind: "active",
      week: 3,
    });
  });
});

describe("currentSunday / startDateToSave", () => {
  it("finds the Sunday of the Jerusalem week", () => {
    // Wednesday 2026-11-11 noon
    expect(currentSunday(new Date("2026-11-11T10:00:00Z"))).toBe("2026-11-08");
    // Saturday 23:30 Jerusalem is still the previous week
    expect(currentSunday(new Date("2026-11-14T21:30:00Z"))).toBe("2026-11-08");
    // Sunday 00:30 Jerusalem starts a new week
    expect(currentSunday(new Date("2026-11-14T22:30:00Z"))).toBe("2026-11-15");
  });

  it("starts the program this week when no date or a future date is stored", () => {
    const now = new Date("2026-11-11T10:00:00Z");
    expect(startDateToSave(null, now)).toBe("2026-11-08");
    expect(startDateToSave("2026-12-06", now)).toBe("2026-11-08");
    expect(startDateToSave("2026-11-01", now)).toBeNull();
    expect(startDateToSave("2026-11-08", now)).toBeNull();
  });
});

describe("weekState / closedWeeks", () => {
  it("classifies weeks during the program", () => {
    const status = { kind: "active", week: 3 } as const;
    expect(weekState(2, status)).toBe("past");
    expect(weekState(3, status)).toBe("current");
    expect(weekState(4, status)).toBe("future");
    expect(closedWeeks(status)).toBe(2);
  });

  it("treats all weeks as past when finished and future when not started", () => {
    expect(weekState(10, { kind: "finished" })).toBe("past");
    expect(closedWeeks({ kind: "finished" })).toBe(10);
    expect(weekState(1, { kind: "not_started" })).toBe("future");
    expect(closedWeeks({ kind: "not_started" })).toBe(0);
  });
});

describe("week dates", () => {
  it("gives Sunday start and Saturday end", () => {
    expect(weekStartDate(START, 1)).toBe("2026-03-01");
    expect(weekEndDate(START, 1)).toBe("2026-03-07");
    expect(weekStartDate(START, 10)).toBe("2026-05-03");
    expect(weekEndDate(START, 10)).toBe("2026-05-09");
  });
});

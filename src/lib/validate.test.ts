import { describe, expect, it } from "vitest";
import { isOurFlyerUrl, isUuid, parseCoach, parseGroup, parseWeek } from "./validate";

function fd(values: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(values)) f.set(k, v);
  return f;
}

describe("parseCoach", () => {
  it("accepts valid input and trims", () => {
    expect(
      parseCoach(fd({ full_name: "  דנה ", role: "מאמנת", phone: "050-1234567", language: "he" })),
    ).toEqual({ full_name: "דנה", role: "מאמנת", phone: "050-1234567", language: "he" });
  });
  it("rejects missing name, bad language, bad phone", () => {
    expect(parseCoach(fd({ full_name: "", language: "he" }))).toBeNull();
    expect(parseCoach(fd({ full_name: "x", language: "en" }))).toBeNull();
    expect(parseCoach(fd({ full_name: "x", language: "ar", phone: "123" }))).toBeNull();
  });
  it("allows an empty phone", () => {
    expect(parseCoach(fd({ full_name: "x", language: "ar", phone: "" }))?.phone).toBe("");
  });
});

describe("parseGroup", () => {
  it("needs a name and a coach id", () => {
    const id = "123e4567-e89b-12d3-a456-426614174000";
    expect(parseGroup(fd({ name: "א", coach_id: id }))).toEqual({ name: "א", coach_id: id });
    expect(parseGroup(fd({ name: "א", coach_id: "nope" }))).toBeNull();
    expect(isUuid(id)).toBe(true);
  });
});

describe("parseWeek / isOurFlyerUrl", () => {
  it("accepts weeks 1..10 only", () => {
    expect(parseWeek("1")).toBe(1);
    expect(parseWeek("10")).toBe(10);
    expect(parseWeek("11")).toBeNull();
    expect(parseWeek("2.5")).toBeNull();
  });
  it("accepts only our bucket", () => {
    const base = "https://abc.supabase.co";
    expect(isOurFlyerUrl(`${base}/storage/v1/object/public/flyers/week-1/he.png`, base)).toBe(true);
    expect(isOurFlyerUrl("https://evil.example/flyers/x.png", base)).toBe(false);
    expect(isOurFlyerUrl("/flyers/he/week-01.png", base)).toBe(true);
    expect(isOurFlyerUrl("/flyers/ar/week-10.png", base)).toBe(true);
    expect(isOurFlyerUrl("/flyers/../secret.png", base)).toBe(false);
    expect(isOurFlyerUrl("//evil.example/flyers/he/week-01.png", base)).toBe(false);
  });
});

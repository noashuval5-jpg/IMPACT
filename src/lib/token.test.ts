import { describe, expect, it } from "vitest";
import { generateToken, looksLikeToken } from "./token";

describe("token", () => {
  it("is long, URL-safe and unique", () => {
    const a = generateToken();
    const b = generateToken();
    expect(a.length).toBeGreaterThanOrEqual(32);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(a).not.toBe(b);
    expect(looksLikeToken(a)).toBe(true);
  });

  it("rejects bad shapes", () => {
    expect(looksLikeToken("short")).toBe(false);
    expect(looksLikeToken("a".repeat(40) + "/")).toBe(false);
  });
});

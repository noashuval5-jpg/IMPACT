import { describe, expect, it } from "vitest";
import { fillTemplate, normalizePhone, waLink, waShareLink } from "./phone";

describe("normalizePhone", () => {
  it("turns a local Israeli number into 972 format", () => {
    expect(normalizePhone("050-123-4567")).toBe("972501234567");
    expect(normalizePhone("0501234567")).toBe("972501234567");
  });

  it("strips spaces, dashes, plus and brackets", () => {
    expect(normalizePhone("+972 (50) 123 4567")).toBe("972501234567");
  });

  it("keeps an international number as is", () => {
    expect(normalizePhone("972501234567")).toBe("972501234567");
  });

  it("returns an empty string for empty input", () => {
    expect(normalizePhone("  ")).toBe("");
  });
});

describe("waLink", () => {
  it("builds a wa.me link with encoded text", () => {
    expect(waLink("050-1234567", "שלום & ברוכים")).toBe(
      `https://wa.me/972501234567?text=${encodeURIComponent("שלום & ברוכים")}`,
    );
  });

  it("encodes newlines and Arabic text", () => {
    const text = "مرحبًا\nhttps://example.com/c/abc?x=1";
    const link = waLink("0501234567", text);
    expect(link.startsWith("https://wa.me/972501234567?text=")).toBe(true);
    expect(decodeURIComponent(link.split("?text=")[1] ?? "")).toBe(text);
    expect(link).not.toContain("\n");
  });
});

describe("waShareLink", () => {
  it("builds a share link without a recipient", () => {
    expect(waShareLink("hi there")).toBe("https://wa.me/?text=hi%20there");
  });
});

describe("fillTemplate", () => {
  it("replaces placeholders", () => {
    expect(fillTemplate("שלום {name}: {link}", { name: "דנה", link: "x" })).toBe(
      "שלום דנה: x",
    );
  });

  it("leaves unknown placeholders", () => {
    expect(fillTemplate("{a} {b}", { a: 1 })).toBe("1 {b}");
  });
});

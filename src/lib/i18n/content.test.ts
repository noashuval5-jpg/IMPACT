import { describe, expect, it } from "vitest";
import { pickLang } from "./content";

describe("pickLang", () => {
  it("uses the chosen language", () => {
    expect(pickLang("ar", "עב", "عر")).toBe("عر");
    expect(pickLang("he", "עב", "عر")).toBe("עב");
  });

  it("falls back to the other language when empty", () => {
    expect(pickLang("ar", "עב", "  ")).toBe("עב");
    expect(pickLang("he", null, "عر")).toBe("عر");
    expect(pickLang("he", null, null)).toBe("");
  });
});

import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases, trims, hyphenates", () => {
    expect(slugify("  Hello, DeFi World! ")).toBe("hello-defi-world");
  });
  it("collapses repeated separators", () => {
    expect(slugify("a   --  b")).toBe("a-b");
  });
  it("strips emoji and punctuation", () => {
    expect(slugify("ve(3,3) 🚀 forks")).toBe("ve33-forks");
  });
  it("folds diacritics", () => {
    expect(slugify("Résumé café")).toBe("resume-cafe");
  });
  it("truncates to 80 chars with no trailing hyphen", () => {
    const s = slugify("word ".repeat(40));
    expect(s.length).toBeLessThanOrEqual(80);
    expect(s.endsWith("-")).toBe(false);
  });
});

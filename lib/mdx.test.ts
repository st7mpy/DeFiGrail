import { describe, expect, it } from "vitest";
import { frontmatterSchema, loadTopics, getTopic } from "./mdx";

describe("frontmatterSchema", () => {
  const valid = {
    title: "Uniswap v2", slug: "uniswap-v2", era: "v0", track: "foundations",
    order: 1, prereqs: [], related: ["impermanent-loss"],
    tradfiAnchor: "Continuous-quote market maker",
    summary: "Constant-product AMM (x·y=k) — the passive market maker every DEX descends from.",
    significance: 24,
  };
  it("accepts a valid topic", () => expect(frontmatterSchema.parse(valid).slug).toBe("uniswap-v2"));
  it("rejects bad era", () => expect(() => frontmatterSchema.parse({ ...valid, era: "v9" })).toThrow());
  it("rejects bad slug chars", () => expect(() => frontmatterSchema.parse({ ...valid, slug: "Uni Swap!" })).toThrow());
});

describe("loadTopics", () => {
  it("loads seeded topics with bodies", () => {
    const topics = loadTopics();
    expect(topics.length).toBeGreaterThan(0);
    const uni = getTopic("uniswap-v2");
    expect(uni?.meta.era).toBe("v0");
    expect(uni?.body).toContain("x · y = k");
  });
  it("every prereq/related slug resolves", () => {
    const slugs = new Set(loadTopics().map(t => t.meta.slug));
    for (const t of loadTopics())
      for (const p of [...t.meta.prereqs, ...t.meta.related])
        expect(slugs.has(p), `${t.meta.slug} → ${p}`).toBe(true);
  });
});

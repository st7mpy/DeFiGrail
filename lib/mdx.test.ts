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
  it("defaults isNew to false when omitted", () => {
    expect(frontmatterSchema.parse(valid).isNew).toBe(false);
  });
  it("accepts isNew: true", () => {
    expect(frontmatterSchema.parse({ ...valid, isNew: true }).isNew).toBe(true);
  });
  it("defaults sources to an empty array when omitted", () => {
    expect(frontmatterSchema.parse(valid).sources).toEqual([]);
  });
  it("accepts a well-formed sources array", () => {
    const parsed = frontmatterSchema.parse({
      ...valid,
      sources: [{ label: "Uniswap v2 Core whitepaper", url: "https://uniswap.org/whitepaper.pdf" }],
    });
    expect(parsed.sources[0].label).toBe("Uniswap v2 Core whitepaper");
  });
  it("rejects a source with a non-URL", () => {
    expect(() =>
      frontmatterSchema.parse({ ...valid, sources: [{ label: "x", url: "not-a-url" }] })
    ).toThrow();
  });
  it("accepts an ISO lastVerified date", () => {
    expect(frontmatterSchema.parse({ ...valid, lastVerified: "2026-09-06" }).lastVerified).toBe("2026-09-06");
  });
  it("rejects a non-ISO lastVerified date", () => {
    expect(() => frontmatterSchema.parse({ ...valid, lastVerified: "Sept 2026" })).toThrow();
  });
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

import { describe, expect, it } from "vitest";
import { tradfiIndex } from "./tradfi";
import { loadTopics } from "./mdx";

describe("tradfiIndex", () => {
  const index = tradfiIndex();

  it("returns at least one entry", () => {
    expect(index.length).toBeGreaterThan(0);
  });

  it("skips topics with no tradfiAnchor", () => {
    const withAnchor = loadTopics().filter((t) => (t.meta.tradfiAnchor ?? "").trim() !== "").length;
    const listed = index.reduce((n, e) => n + e.topics.length, 0);
    expect(listed).toBe(withAnchor);
  });

  it("is sorted alphabetically by anchor", () => {
    const anchors = index.map((e) => e.anchor);
    expect(anchors).toEqual([...anchors].sort((a, b) => a.localeCompare(b)));
  });

  it("groups topics that share an anchor into one entry", () => {
    const anchors = index.map((e) => e.anchor);
    expect(new Set(anchors).size).toBe(anchors.length);
  });

  it("every listed topic carries a slug, name and summary", () => {
    for (const entry of index)
      for (const t of entry.topics) {
        expect(t.slug).toMatch(/^[a-z0-9-]+$/);
        expect(t.name.length).toBeGreaterThan(0);
        expect(t.summary.length).toBeGreaterThan(0);
      }
  });
});

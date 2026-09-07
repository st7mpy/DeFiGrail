import { describe, expect, it } from "vitest";
import { tradfiIndex } from "./tradfi";
import { loadTopics } from "./mdx";

describe("tradfiIndex", () => {
  const index = tradfiIndex();

  it("returns at least one entry", () => {
    expect(index.length).toBeGreaterThan(0);
  });

  it("lists one entry per anchor, skipping topics with none", () => {
    const expected = loadTopics().reduce(
      (n, t) =>
        n +
        [t.meta.tradfiAnchor ?? "", ...t.meta.tradfiAlso].filter((a) => a.trim() !== "").length,
      0
    );
    const listed = index.reduce((n, e) => n + e.topics.length, 0);
    expect(listed).toBe(expected);
  });

  it("surfaces a topic under each of its extra anchors", () => {
    const multi = loadTopics().find((t) => t.meta.tradfiAlso.length > 0);
    expect(multi, "no topic uses tradfiAlso").toBeDefined();
    for (const anchor of multi!.meta.tradfiAlso) {
      const entry = index.find((e) => e.anchor === anchor);
      expect(entry, anchor).toBeDefined();
      expect(entry!.topics.map((t) => t.slug)).toContain(multi!.meta.slug);
    }
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

import { describe, expect, it } from "vitest";
import { extractHeadings } from "./headings";
import { loadTopics, getTopic } from "./mdx";

describe("extractHeadings", () => {
  it("pulls h2s with slugified ids", () => {
    const h = extractHeadings("## 01 · Concept — what problem does it solve?\n\ntext\n\n## 02 · Mechanics");
    expect(h.map((x) => x.label)).toEqual(["01 · Concept — what problem does it solve?", "02 · Mechanics"]);
    expect(h[0].id).toBe("01-concept-what-problem-does-it-solve");
    expect(h[1].id).toBe("02-mechanics");
  });

  it("ignores headings inside fenced code", () => {
    expect(extractHeadings("## Real\n\n```text\n## Not a heading\n```")).toHaveLength(1);
  });

  it("does not treat h1 or h4 as sections", () => {
    expect(extractHeadings("# Title\n#### Deep")).toHaveLength(0);
  });

  it("drops duplicate ids rather than emitting two identical anchors", () => {
    expect(extractHeadings("## Same\n\n## Same")).toHaveLength(1);
  });

  it("finds sections in every real topic", () => {
    for (const t of loadTopics()) {
      expect(extractHeadings(t.body).length, t.meta.slug).toBeGreaterThan(0);
    }
  });

  it("matches the four-part structure on uniswap-v2", () => {
    expect(extractHeadings(getTopic("uniswap-v2")!.body)).toHaveLength(4);
  });
});

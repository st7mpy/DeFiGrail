import { describe, expect, it } from "vitest";
import { stripMdx, searchDocs } from "./search-index";

describe("stripMdx", () => {
  it("drops fenced code blocks entirely", () => {
    expect(stripMdx("before\n\n```text\nP(i) = 1.0001\n```\n\nafter")).toBe("before after");
  });
  it("drops JSX tags but keeps their inner text", () => {
    expect(stripMdx('<Caveat kind="misuse">not free</Caveat>')).toBe("not free");
  });
  it("drops self-closing chart elements", () => {
    expect(stripMdx("text <RangeLiquidity /> more")).toBe("text more");
  });
  it("reduces a link to its label", () => {
    expect(stripMdx("see [Impermanent Loss](/learn/impermanent-loss) for more")).toBe(
      "see Impermanent Loss for more"
    );
  });
  it("drops heading and emphasis marks", () => {
    expect(stripMdx("## 01 · Concept\n\n**Ticks:** price space")).toBe("01 · Concept Ticks: price space");
  });
  it("keeps hyphenated words intact", () => {
    expect(stripMdx("a mint-burn spiral")).toBe("a mint-burn spiral");
  });
});

describe("searchDocs", () => {
  const docs = searchDocs();
  it("returns one doc per topic", () => {
    expect(docs.length).toBeGreaterThanOrEqual(50);
  });
  it("carries searchable body text", () => {
    const uni = docs.find((d) => d.slug === "uniswap-v2");
    expect(uni?.text.toLowerCase()).toContain("constant");
  });
  it("contains no markdown fences in the text", () => {
    for (const d of docs) expect(d.text).not.toContain("```");
  });
});

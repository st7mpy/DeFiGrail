import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import remarkStringify from "remark-stringify";
import { remarkGlossary, type GlossaryEntry } from "./glossary-remark";

async function run(md: string, terms: GlossaryEntry[] = [{ term: "flash loan", def: "x" }]) {
  const f = await unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkGlossary, { terms })
    .use(remarkStringify)
    .process(md);
  return String(f);
}

describe("remarkGlossary", () => {
  it("wraps first occurrence in GlossaryTerm jsx", async () => {
    const out = await run("A flash loan is atomic.");
    expect(out).toContain('<GlossaryTerm term="flash loan">');
    expect(out).toContain("flash loan</GlossaryTerm>");
  });

  it("only wraps the first occurrence per document", async () => {
    const out = await run("flash loan here, then a flash loan there");
    expect(out.match(/<GlossaryTerm/g)?.length).toBe(1);
  });

  it("never wraps inside code or headings", async () => {
    const out = await run("# flash loan\n\n`flash loan`");
    expect(out).not.toContain("GlossaryTerm");
  });

  it("never wraps bold text nested inside a heading", async () => {
    const out = await run("# A **flash loan** primer");
    expect(out).not.toContain("GlossaryTerm");
  });

  it("matches aliases case-insensitively to the canonical term", async () => {
    const out = await run("Every Liquidity Provider earns fees.", [
      { term: "LP", aliases: ["liquidity provider"], def: "x" },
    ]);
    expect(out).toContain('<GlossaryTerm term="LP">');
    expect(out).toContain("Liquidity Provider</GlossaryTerm>");
  });

  it("respects word boundaries (no substring matches)", async () => {
    const out = await run("Please help me.", [{ term: "LP", def: "x" }]);
    expect(out).not.toContain("GlossaryTerm");
  });
});

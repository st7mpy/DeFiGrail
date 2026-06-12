import { visit, SKIP } from "unist-util-visit";
import type { Root, Text } from "mdast";

export type GlossaryEntry = { term: string; aliases?: string[]; def: string };

const FORBIDDEN_ANCESTORS = ["heading", "link", "mdxJsxTextElement", "mdxJsxFlowElement"] as const;

export function remarkGlossary({ terms }: { terms: GlossaryEntry[] }) {
  // longest alias first so "liquidity provider" wins over "LP" when both could match
  const all = terms
    .flatMap(t => [t.term, ...(t.aliases ?? [])].map(a => ({ alias: a.toLowerCase(), canonical: t.term })))
    .sort((a, b) => b.alias.length - a.alias.length);

  return (tree: Root) => {
    // pre-pass: collect text nodes under ancestors we must never link inside,
    // including nested cases like bold-inside-heading
    const forbidden = new Set<Text>();
    for (const type of FORBIDDEN_ANCESTORS) {
      visit(tree, type, (node) => {
        visit(node, "text", (t) => {
          forbidden.add(t as Text);
        });
      });
    }

    const seen = new Set<string>();
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || index === undefined || forbidden.has(node)) return;
      const p = parent as { type: string; children: unknown[] };
      if ((FORBIDDEN_ANCESTORS as readonly string[]).includes(p.type)) return;
      for (const { alias, canonical } of all) {
        if (seen.has(canonical)) continue;
        // word-boundary match so "lp" never matches inside "help"
        const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(`(?<![a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, "i");
        const m = re.exec(node.value);
        if (!m) continue;
        const i = m.index;
        const before = node.value.slice(0, i);
        const hit = node.value.slice(i, i + m[0].length);
        const after = node.value.slice(i + m[0].length);
        const jsx = {
          type: "mdxJsxTextElement",
          name: "GlossaryTerm",
          attributes: [{ type: "mdxJsxAttribute", name: "term", value: canonical }],
          children: [{ type: "text", value: hit }],
        };
        const repl: unknown[] = [];
        if (before) repl.push({ type: "text", value: before });
        repl.push(jsx);
        if (after) repl.push({ type: "text", value: after });
        p.children.splice(index, 1, ...repl);
        seen.add(canonical);
        return [SKIP, index + repl.length];
      }
    });
  };
}

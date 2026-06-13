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

      // Find the EARLIEST-positioned unseen match in this node so that two
      // different terms sharing one text node are both linked in document
      // order (ties broken by longest alias, e.g. "liquidity provider" > "LP").
      let best: { i: number; len: number; canonical: string } | null = null;
      for (const { alias, canonical } of all) {
        if (seen.has(canonical)) continue;
        // word-boundary match so "lp" never matches inside "help"
        const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(`(?<![a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, "i");
        const m = re.exec(node.value);
        if (!m) continue;
        if (!best || m.index < best.i || (m.index === best.i && m[0].length > best.len)) {
          best = { i: m.index, len: m[0].length, canonical };
        }
      }
      if (!best) return;

      const before = node.value.slice(0, best.i);
      const hit = node.value.slice(best.i, best.i + best.len);
      const after = node.value.slice(best.i + best.len);
      const jsx = {
        type: "mdxJsxTextElement",
        name: "GlossaryTerm",
        attributes: [{ type: "mdxJsxAttribute", name: "term", value: best.canonical }],
        children: [{ type: "text", value: hit }],
      };
      // `before` holds no unseen-term match (we picked the earliest), so it is
      // safe to skip. Resume ON the `after` node so remaining terms there are
      // still linked.
      const repl: unknown[] = [];
      if (before) repl.push({ type: "text", value: before });
      repl.push(jsx);
      if (after) repl.push({ type: "text", value: after });
      p.children.splice(index, 1, ...repl);
      seen.add(best.canonical);
      // index of the trailing `after` node, if any, so visit re-scans it
      return [SKIP, after ? index + repl.length - 1 : index + repl.length];
    });
  };
}

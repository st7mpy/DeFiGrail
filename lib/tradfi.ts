import { loadTopics } from "@/lib/mdx";

export type TradfiEntry = {
  anchor: string;
  topics: { slug: string; name: string; summary: string }[];
};

/**
 * The reverse index: TradFi instrument or desk → the DeFi topics that map to it.
 * Topics with no tradfiAnchor are omitted entirely rather than bucketed under
 * an "Other" heading — an empty anchor is missing metadata, not a category.
 *
 * Sourced from loadTopics() rather than topicCards(): the latter is guarded by
 * `import "server-only"` and cannot be imported from a vitest test.
 */
export function tradfiIndex(): TradfiEntry[] {
  const byAnchor = new Map<string, TradfiEntry["topics"]>();
  for (const t of loadTopics()) {
    const anchor = (t.meta.tradfiAnchor ?? "").trim();
    if (!anchor) continue;
    const bucket = byAnchor.get(anchor) ?? [];
    bucket.push({ slug: t.meta.slug, name: t.meta.title, summary: t.meta.summary });
    byAnchor.set(anchor, bucket);
  }
  return [...byAnchor.entries()]
    .map(([anchor, topics]) => ({ anchor, topics }))
    .sort((a, b) => a.anchor.localeCompare(b.anchor));
}

import { slugify } from "@/lib/slug";

export type Heading = { id: string; label: string; level: 2 | 3 };

/**
 * Pull the h2/h3 headings out of an MDX body for the section rail.
 * Fenced code is stripped first so a `# comment` inside a block is not mistaken
 * for a heading. Ids are slugified from the raw text, and the same slugify()
 * runs in the MDX `h2`/`h3` renderer, so the anchors always agree.
 */
export function extractHeadings(body: string): Heading[] {
  const prose = body.replace(/```[\s\S]*?```/g, "");
  const out: Heading[] = [];
  const seen = new Set<string>();
  for (const m of prose.matchAll(/^(#{2,3})\s+(.+?)\s*$/gm)) {
    const label = m[2].replace(/[*_`]/g, "").trim();
    const id = slugify(label);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, label, level: m[1].length === 2 ? 2 : 3 });
  }
  return out;
}

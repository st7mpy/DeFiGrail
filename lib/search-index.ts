import { loadTopics } from "@/lib/mdx";

export type SearchDoc = {
  slug: string;
  name: string;
  era: string;
  tradfi: string;
  summary: string;
  text: string;
};

/** Reduce an MDX body to plain searchable prose. */
export function stripMdx(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, " ")            // fenced code
    .replace(/<[^>]+>/g, " ")                    // JSX tags, self-closing included
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")   // links and images → their label
    .replace(/[#*_`>|]+/g, " ")                  // leftover markdown punctuation
    .replace(/\s+/g, " ")
    .trim();
}

export function searchDocs(): SearchDoc[] {
  return loadTopics().map((t) => ({
    slug: t.meta.slug,
    name: t.meta.title,
    era: t.meta.era,
    tradfi: t.meta.tradfiAnchor ?? "",
    summary: t.meta.summary,
    text: stripMdx(t.body),
  }));
}

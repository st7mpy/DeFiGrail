import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const TOPICS_DIR = path.join(process.cwd(), "content", "topics");

export const ERAS = ["v0", "v1", "v2", "esoteric", "infra", "ref"] as const;

export const frontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  era: z.enum(ERAS),
  track: z.string().min(1),
  order: z.number().int().positive(),
  prereqs: z.array(z.string()).default([]),
  related: z.array(z.string()).default([]),
  tradfiAnchor: z.string().optional(),
  summary: z.string().min(10).max(300),
  significance: z.number().int().min(8).max(30).default(14),
});

export type TopicMeta = z.infer<typeof frontmatterSchema>;
export type Topic = { meta: TopicMeta; body: string };

let cache: Topic[] | null = null;

export function loadTopics(): Topic[] {
  if (cache) return cache;
  cache = fs.readdirSync(TOPICS_DIR).filter(f => f.endsWith(".mdx")).map(f => {
    const raw = fs.readFileSync(path.join(TOPICS_DIR, f), "utf8");
    const { data, content } = matter(raw);
    const meta = frontmatterSchema.parse(data); // throws → build fails (spec §8)
    if (`${meta.slug}.mdx` !== f) throw new Error(`slug/filename mismatch in ${f}`);
    return { meta, body: content };
  }).sort((a, b) => a.meta.order - b.meta.order);
  return cache;
}

export const getTopic = (slug: string) => loadTopics().find(t => t.meta.slug === slug);

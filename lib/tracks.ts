import tracksJson from "@/content/tracks.json";
import { loadTopics, getTopic } from "@/lib/mdx";
import type { Topic } from "@/lib/mdx";

/** Raw shape from tracks.json */
export type TrackDef = { label: string; era: string; topics: string[] };

/** Typed record of all raw track definitions */
export const TRACKS: Record<string, TrackDef> = tracksJson;

/** A joined track — topic slugs resolved to full Topic objects */
export type Track = {
  key: string;
  label: string;
  era: string;
  topics: Topic[];
};

/**
 * Returns a Track with fully joined Topic objects (in tracks.json order),
 * or undefined if the key doesn't exist.
 */
export function getTrack(key: string): Track | undefined {
  const def = TRACKS[key];
  if (!def) return undefined;
  const topics = def.topics
    .map(slug => getTopic(slug))
    .filter((t): t is Topic => t !== undefined);
  return { key, label: def.label, era: def.era, topics };
}

/**
 * Given a topic slug, finds its track and returns {slug, title} of the next
 * topic in that track's ordered list, or null if it's the last (or not found).
 */
export function nextInTrack(slug: string): { slug: string; title: string } | null {
  for (const [key, def] of Object.entries(TRACKS)) {
    const idx = def.topics.indexOf(slug);
    if (idx === -1) continue;
    const nextSlug = def.topics[idx + 1];
    if (!nextSlug) return null;
    const next = getTopic(nextSlug);
    if (!next) return null;
    return { slug: next.meta.slug, title: next.meta.title };
  }
  return null;
}

// Eager-load to warm the mdx cache (no-op after first call)
loadTopics();

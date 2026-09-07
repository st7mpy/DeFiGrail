import tracksJson from "@/content/tracks.json";
import { loadTopics, getTopic } from "@/lib/mdx";

/** Raw shape from tracks.json */
export type TrackDef = { label: string; era: string; topics: string[] };

/** Typed record of all raw track definitions */
export const TRACKS: Record<string, TrackDef> = tracksJson;

/**
 * Given a topic slug, finds its track and returns {slug, title} of the next
 * topic in that track's ordered list, or null if it's the last (or not found).
 */
export function nextInTrack(slug: string): { slug: string; title: string } | null {
  for (const def of Object.values(TRACKS)) {
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

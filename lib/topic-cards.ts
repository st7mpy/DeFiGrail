import "server-only";
import { loadTopics } from "@/lib/mdx";
import tracksJson from "@/content/tracks.json";

const TRACK_BLURBS: Record<string, string> = {
  foundations: "The first primitives — AMMs, CDPs, money markets.",
  composability: "Protocols built on protocols; emissions and forks.",
  frontier: "Concentrated liquidity, POL, tokenized yield.",
  esoteric: "IL math, zero-coupon bonds, MEV, shared collateral.",
  infrastructure: "How the bots that trade this actually get built.",
};

// Lightweight, body-free topic summary for cards, graph nodes, and search.
export type TopicCard = {
  slug: string;
  name: string;
  era: string;
  track: string;
  order: number;
  significance: number;
  tradfi: string;
  tagline: string;
  summary: string;
  prereqs: string[];
  related: string[];
  isNew: boolean;
};

export function topicCards(): TopicCard[] {
  return loadTopics().map((t) => ({
    slug: t.meta.slug,
    name: t.meta.title,
    era: t.meta.era,
    track: t.meta.track,
    order: t.meta.order,
    significance: t.meta.significance,
    tradfi: t.meta.tradfiAnchor ?? "",
    tagline: t.meta.summary,
    summary: t.meta.summary,
    prereqs: t.meta.prereqs,
    related: t.meta.related,
    isNew: t.meta.isNew,
  }));
}

export type TrackView = { id: string; name: string; blurb: string; topics: TopicCard[] };

const TRACKS_DEF = tracksJson as Record<string, { label: string; era: string; topics: string[] }>;

export function trackViews(): TrackView[] {
  const byId = new Map(topicCards().map((t) => [t.slug, t]));
  return Object.entries(TRACKS_DEF).map(([id, def]) => ({
    id,
    name: def.label,
    blurb: TRACK_BLURBS[id] ?? "",
    topics: def.topics.map((s) => byId.get(s)).filter((t): t is TopicCard => !!t),
  }));
}

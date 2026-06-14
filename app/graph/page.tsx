import type { Metadata } from "next";
import ProtocolGraph, { type GraphNode } from "@/components/graph/ProtocolGraph";
import { topicCards } from "@/lib/topic-cards";

export const metadata: Metadata = { title: "Knowledge graph" };

export default function GraphPage() {
  const nodes: GraphNode[] = topicCards().map((t) => ({
    id: t.slug,
    era: t.era,
    name: t.name,
    tagline: t.tagline,
    tradfi: t.tradfi,
    // union of prereqs + related for a denser, more useful map
    connects: Array.from(new Set([...t.prereqs, ...t.related])),
    significance: t.significance,
  }));
  return <ProtocolGraph nodes={nodes} />;
}

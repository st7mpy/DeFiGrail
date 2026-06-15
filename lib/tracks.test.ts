import { describe, expect, it } from "vitest";
import { getTrack, nextInTrack, TRACKS } from "./tracks";

describe("TRACKS", () => {
  it("exposes all 10 tracks", () => {
    expect(Object.keys(TRACKS)).toHaveLength(10);
    expect(Object.keys(TRACKS)).toEqual(
      expect.arrayContaining([
        "foundations", "lending", "liquidity", "stablecoins", "composability",
        "frontier", "staking", "derivatives", "esoteric", "infrastructure",
      ])
    );
  });
});

describe("getTrack", () => {
  it("returns a track object with label for foundations", () => {
    const track = getTrack("foundations");
    expect(track).toBeDefined();
    expect(track!.label).toBe("Foundations");
  });

  it("returns topics array of Topic objects in tracks.json order", () => {
    const track = getTrack("foundations");
    expect(track).toBeDefined();
    const topics = track!.topics;
    expect(topics).toHaveLength(5);
    expect(topics[0].meta.slug).toBe("uniswap-v2");
  });

  it("all topics in foundations have meta and body", () => {
    const track = getTrack("foundations");
    for (const t of track!.topics) {
      expect(t.meta).toBeDefined();
      expect(t.body).toBeDefined();
    }
  });

  it("returns undefined for unknown track", () => {
    expect(getTrack("nonexistent")).toBeUndefined();
  });
});

describe("nextInTrack", () => {
  it("returns the next topic meta for uniswap-v2 (foundations[0])", () => {
    const next = nextInTrack("uniswap-v2");
    expect(next).not.toBeNull();
    expect(next!.slug).toBe("makerdao");
    expect(next!.title).toBeDefined();
  });

  it("advances within infrastructure: bot-architecture → oracles", () => {
    expect(nextInTrack("bot-architecture")?.slug).toBe("oracles");
  });

  it("returns null for bridges (last in infrastructure)", () => {
    expect(nextInTrack("bridges")).toBeNull();
  });

  it("returns null for tradfi-mapping (last in foundations)", () => {
    expect(nextInTrack("tradfi-mapping")).toBeNull();
  });

  it("returns null for unknown slug", () => {
    expect(nextInTrack("does-not-exist")).toBeNull();
  });
});

describe("guard: every slug in tracks.json resolves to a real topic", () => {
  it("all track topic slugs resolve", () => {
    for (const [trackKey, trackDef] of Object.entries(TRACKS)) {
      for (const slug of trackDef.topics) {
        const track = getTrack(trackKey);
        const found = track?.topics.find(t => t.meta.slug === slug);
        expect(found, `slug "${slug}" in track "${trackKey}" did not resolve to a topic`).toBeDefined();
      }
    }
  });
});

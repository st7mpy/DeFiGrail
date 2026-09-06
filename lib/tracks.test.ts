import { describe, expect, it } from "vitest";
import { nextInTrack, TRACKS } from "./tracks";
import { getTopic } from "./mdx";

describe("TRACKS", () => {
  it("exposes all 12 tracks", () => {
    expect(Object.keys(TRACKS)).toHaveLength(12);
    expect(Object.keys(TRACKS)).toEqual(
      expect.arrayContaining([
        "markets-101", "foundations", "lending", "liquidity", "stablecoins",
        "composability", "frontier", "staking", "derivatives", "ecosystem",
        "esoteric", "infrastructure",
      ])
    );
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
        expect(getTopic(slug), `slug "${slug}" in track "${trackKey}" did not resolve`).toBeDefined();
      }
    }
  });
});

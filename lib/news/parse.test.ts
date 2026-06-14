import { describe, expect, it } from "vitest";
import {
  fmtPrice, fmtTVL, fmtChange, relTime,
  parseCoingecko, parseDefillamaTotal, parseDefillamaChains,
  buildAssets, parseRssItems, asOfUTC,
} from "./parse";

describe("formatters", () => {
  it("fmtPrice: no decimals at/above 100, thousands separators", () => {
    expect(fmtPrice(71240)).toBe("$71,240");
    expect(fmtPrice(3905)).toBe("$3,905");
  });
  it("fmtPrice: 2 decimals below 100", () => {
    expect(fmtPrice(0.42)).toBe("$0.42");
  });
  it("fmtTVL: scales to B and T", () => {
    expect(fmtTVL(112_400_000_000)).toBe("$112.4B");
    expect(fmtTVL(61_200_000_000)).toBe("$61.2B");
    expect(fmtTVL(2_400_000_000_000)).toBe("$2.40T");
  });
  it("fmtChange: sign + one decimal + direction", () => {
    expect(fmtChange(2.1)).toEqual({ chg: "+2.1%", up: true });
    expect(fmtChange(-0.8)).toEqual({ chg: "-0.8%", up: false });
    expect(fmtChange(0)).toEqual({ chg: "+0.0%", up: true });
  });
  it("relTime: minutes / hours / days", () => {
    const now = 10_000_000_000;
    expect(relTime(now - 30 * 60000, now)).toBe("30m ago");
    expect(relTime(now - 2 * 3600_000, now)).toBe("2h ago");
    expect(relTime(now - 3 * 86400_000, now)).toBe("3d ago");
    expect(relTime(now - 10_000, now)).toBe("just now");
  });
  it("asOfUTC formats HH:MM UTC", () => {
    expect(asOfUTC(new Date(Date.UTC(2026, 5, 14, 9, 5)))).toBe("09:05 UTC");
  });
});

describe("parseCoingecko", () => {
  it("extracts btc/eth usd + 24h change", () => {
    const out = parseCoingecko({
      bitcoin: { usd: 71240, usd_24h_change: 2.1 },
      ethereum: { usd: 3905, usd_24h_change: 3.4 },
    });
    expect(out).toEqual({ btc: { usd: 71240, chg: 2.1 }, eth: { usd: 3905, chg: 3.4 } });
  });
  it("tolerates missing fields", () => {
    expect(parseCoingecko({})).toEqual({ btc: { usd: 0, chg: 0 }, eth: { usd: 0, chg: 0 } });
  });
});

describe("parseDefillamaTotal", () => {
  it("uses last point for total and last-vs-prev for change", () => {
    const { total, chgPct } = parseDefillamaTotal([{ date: 1, tvl: 113e9 }, { date: 2, tvl: 112.4e9 }]);
    expect(total).toBe(112.4e9);
    expect(chgPct).toBeCloseTo(((112.4 - 113) / 113) * 100, 4);
  });
  it("handles empty input", () => {
    expect(parseDefillamaTotal([])).toEqual({ total: 0, chgPct: 0 });
  });
});

describe("parseDefillamaChains", () => {
  it("returns top-N by tvl with formatted value + share", () => {
    const rows = parseDefillamaChains(
      [
        { name: "Solana", tvl: 13.8e9 },
        { name: "Ethereum", tvl: 61.2e9 },
        { name: "Base", tvl: 9.1e9 },
      ],
      112.4e9,
      2
    );
    expect(rows.map((r) => r.name)).toEqual(["Ethereum", "Solana"]);
    expect(rows[0].tvl).toBe("$61.2B");
    expect(rows[0].share).toBeCloseTo((61.2 / 112.4) * 100, 3);
  });
});

describe("buildAssets", () => {
  it("produces BTC, ETH, DeFi TVL rows", () => {
    const a = buildAssets({ btc: { usd: 71240, chg: 2.1 }, eth: { usd: 3905, chg: -1.2 } }, 112.4e9, -0.8);
    expect(a.map((x) => x.sym)).toEqual(["BTC", "ETH", "DeFi TVL"]);
    expect(a[0]).toEqual({ sym: "BTC", price: "$71,240", chg: "+2.1%", up: true });
    expect(a[1].up).toBe(false);
    expect(a[2]).toEqual({ sym: "DeFi TVL", price: "$112.4B", chg: "-0.8%", up: false });
  });
});

describe("parseRssItems", () => {
  it("maps title/link/time + carries a sortable ts, skips itemless rows", () => {
    const now = 10_000_000_000;
    const out = parseRssItems(
      [
        { title: "  Pendle ships fixed yield  ", link: "https://x/1", isoDate: new Date(now - 2 * 3600_000).toISOString() },
        { title: "", link: "https://x/2" },
        { link: "https://x/3" },
      ],
      "The Defiant",
      now
    );
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ source: "The Defiant", title: "Pendle ships fixed yield", url: "https://x/1", time: "2h ago" });
    expect(out[0].ts).toBe(now - 2 * 3600_000);
  });
});

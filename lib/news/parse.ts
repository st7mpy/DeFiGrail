// Pure parsers + formatters for the market/news pipeline (unit-tested).
// Network fetching lives in lib/news/index.ts; everything here is deterministic.

export type Asset = { sym: string; price: string; chg: string; up: boolean };
export type ChainRow = { name: string; tvl: string; share: number };
export type Headline = { source: string; title: string; time: string; url: string };

export function fmtPrice(n: number): string {
  const decimals = n >= 100 ? 0 : 2;
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtTVL(n: number): string {
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
  return "$" + Math.round(n).toLocaleString("en-US");
}

export function fmtChange(pct: number): { chg: string; up: boolean } {
  const up = pct >= 0;
  return { chg: (up ? "+" : "") + pct.toFixed(1) + "%", up };
}

export function relTime(when: string | number | Date, now = Date.now()): string {
  const t = when instanceof Date ? when.getTime() : new Date(when).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Math.max(0, now - t);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  const d = Math.floor(h / 24);
  return d + "d ago";
}

type CGShape = Record<string, { usd?: number; usd_24h_change?: number }>;
export function parseCoingecko(j: CGShape) {
  const pick = (id: string) => ({ usd: j?.[id]?.usd ?? 0, chg: j?.[id]?.usd_24h_change ?? 0 });
  return { btc: pick("bitcoin"), eth: pick("ethereum") };
}

export function parseDefillamaTotal(hist: { date: number; tvl: number }[]): { total: number; chgPct: number } {
  if (!Array.isArray(hist) || hist.length === 0) return { total: 0, chgPct: 0 };
  const last = hist[hist.length - 1];
  const prev = hist.length > 1 ? hist[hist.length - 2] : last;
  const total = last.tvl;
  const chgPct = prev.tvl ? ((last.tvl - prev.tvl) / prev.tvl) * 100 : 0;
  return { total, chgPct };
}

export function parseDefillamaChains(chains: { name: string; tvl: number }[], total: number, n = 5): ChainRow[] {
  const top = [...(chains ?? [])].filter((c) => c && typeof c.tvl === "number").sort((a, b) => b.tvl - a.tvl).slice(0, n);
  return top.map((c) => ({ name: c.name, tvl: fmtTVL(c.tvl), share: total > 0 ? (c.tvl / total) * 100 : 0 }));
}

export function buildAssets(
  cg: { btc: { usd: number; chg: number }; eth: { usd: number; chg: number } },
  total: number,
  totalChg: number
): Asset[] {
  const btc = fmtChange(cg.btc.chg), eth = fmtChange(cg.eth.chg), tvl = fmtChange(totalChg);
  return [
    { sym: "BTC", price: fmtPrice(cg.btc.usd), chg: btc.chg, up: btc.up },
    { sym: "ETH", price: fmtPrice(cg.eth.usd), chg: eth.chg, up: eth.up },
    { sym: "DeFi TVL", price: fmtTVL(total), chg: tvl.chg, up: tvl.up },
  ];
}

type RssItem = { title?: string; link?: string; isoDate?: string; pubDate?: string };
export type DatedHeadline = Headline & { ts: number };
export function parseRssItems(items: RssItem[], source: string, now = Date.now()): DatedHeadline[] {
  return (items ?? [])
    .filter((it): it is Required<Pick<RssItem, "title" | "link">> & RssItem => !!it.title && !!it.link)
    .map((it) => {
      const stamp = it.isoDate || it.pubDate || "";
      const ts = stamp ? new Date(stamp).getTime() || 0 : 0;
      return { source, title: it.title.trim(), url: it.link, time: relTime(ts || now, now), ts };
    });
}

export function asOfUTC(now = new Date()): string {
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mm = String(now.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm} UTC`;
}

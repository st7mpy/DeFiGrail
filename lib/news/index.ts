import "server-only";
import Parser from "rss-parser";
import {
  parseCoingecko, parseDefillamaTotal, parseDefillamaChains, buildAssets,
  parseRssItems, asOfUTC, type Asset, type ChainRow, type Headline,
} from "./parse";
import { MARKET, NEWS_ITEMS } from "@/lib/site-data";

const REVALIDATE = 1800; // 30 min — sources update slowly

const RSS_SOURCES = [
  { source: "The Defiant", url: "https://thedefiant.io/api/feed" },
  { source: "Cointelegraph", url: "https://cointelegraph.com/rss" },
  { source: "Decrypt", url: "https://decrypt.co/feed" },
];

export type NewsData = {
  asOf: string;
  assets: Asset[];
  chains: ChainRow[];
  headlines: Headline[];
  degraded: string[];
};

async function getJSON(url: string): Promise<unknown> {
  const r = await fetch(url, {
    next: { revalidate: REVALIDATE },
    headers: { "User-Agent": "DeFiGrail/1.0 (+https://github.com/st7mpy/DeFiGrail)" },
  });
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.json();
}

async function getMarket(): Promise<{ assets: Asset[]; chains: ChainRow[]; ok: boolean }> {
  try {
    const [cgRaw, histRaw, chainsRaw] = await Promise.all([
      getJSON("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true"),
      getJSON("https://api.llama.fi/v2/historicalChainTvl"),
      getJSON("https://api.llama.fi/v2/chains"),
    ]);
    const cg = parseCoingecko(cgRaw as never);
    const { total, chgPct } = parseDefillamaTotal(histRaw as never);
    return { assets: buildAssets(cg, total, chgPct), chains: parseDefillamaChains(chainsRaw as never, total, 5), ok: true };
  } catch {
    return { assets: MARKET.assets, chains: MARKET.chains, ok: false };
  }
}

async function getHeadlines(): Promise<{ headlines: Headline[]; ok: boolean }> {
  try {
    const parser = new Parser({ timeout: 8000, headers: { "User-Agent": "Mozilla/5.0 (compatible; DeFiGrailBot/1.0)" } });
    const now = Date.now();
    const lists = await Promise.allSettled(
      RSS_SOURCES.map((s) => parser.parseURL(s.url).then((f) => parseRssItems(f.items as never, s.source, now)))
    );
    const all = lists.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
    all.sort((a, b) => b.ts - a.ts);
    const headlines = all.slice(0, 18).map(({ ts, ...h }) => { void ts; return h; });
    if (headlines.length === 0) throw new Error("no headlines");
    return { headlines, ok: true };
  } catch {
    return { headlines: NEWS_ITEMS.map((n) => ({ ...n, url: "#" })), ok: false };
  }
}

export async function getNewsData(): Promise<NewsData> {
  const [market, news] = await Promise.all([getMarket(), getHeadlines()]);
  const degraded: string[] = [];
  if (!market.ok) degraded.push("market");
  if (!news.ok) degraded.push("news");
  return { asOf: asOfUTC(), assets: market.assets, chains: market.chains, headlines: news.headlines, degraded };
}

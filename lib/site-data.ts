// Placeholder market/news/featured data for the design checkpoint.
// Replaced by real backends in later plan tasks:
//   MARKET + NEWS_ITEMS  → Tasks 22–24 (DefiLlama/CoinGecko/RSS via cron cache)
//   FEATURED + SUBMISSIONS → Tasks 18–21 (Neon submissions pipeline)

export type MarketAsset = { sym: string; price: string; chg: string; up: boolean };
export type Chain = { name: string; tvl: string; share: number };
export type NewsItem = { source: string; title: string; time: string };
export type Featured = { slug: string; title: string; author: string; date: string; category: string; blurb: string; read: string };
export type Submission = { id: string; title: string; author: string; category: string; status: "pending" | "approved"; date: string; body: string };

export const MARKET = {
  asOf: "14:00 UTC",
  assets: [
    { sym: "BTC", price: "$71,240", chg: "+2.1%", up: true },
    { sym: "ETH", price: "$3,905", chg: "+3.4%", up: true },
    { sym: "DeFi TVL", price: "$112.4B", chg: "-0.8%", up: false },
  ] as MarketAsset[],
  chains: [
    { name: "Ethereum", tvl: "$61.2B", share: 54 },
    { name: "Solana", tvl: "$13.8B", share: 12 },
    { name: "Base", tvl: "$9.1B", share: 8 },
    { name: "Arbitrum", tvl: "$8.4B", share: 7 },
    { name: "BSC", tvl: "$6.7B", share: 6 },
  ] as Chain[],
};

export const NEWS_ITEMS: NewsItem[] = [
  { source: "The Defiant", title: "Pendle launches fixed-yield markets for restaked ETH", time: "2h ago" },
  { source: "Blockworks", title: "Uniswap governance debates v4 hook whitelist for the third time", time: "4h ago" },
  { source: "CoinDesk", title: "DeFi TVL slips below $115B as funding rates cool", time: "5h ago" },
  { source: "The Defiant", title: "A new salmonella-style contract is quietly draining sandwich bots", time: "7h ago" },
  { source: "Blockworks", title: "Aave deploys isolated markets for long-tail collateral", time: "9h ago" },
  { source: "CoinDesk", title: "Olympus treasury crosses $300M, mostly in its own liquidity", time: "11h ago" },
];

export const FEATURED: Featured[] = [
  { slug: "lvr-vs-il", title: "LVR is the number IL was hiding from you", author: "0xMercator", date: "2026-06-08", category: "Esoteric", blurb: "Impermanent loss measures the wrong baseline. Loss-versus-rebalancing prices what arbitrageurs actually take from LPs each block — and it's bigger.", read: "6 min" },
  { slug: "oracle-free-lending", title: "What an oracle-free lending market would actually need", author: "liang.eth", date: "2026-06-05", category: "Modern Frontier", blurb: "Every lending hack of the last cycle traces back to a price feed. A thought experiment on building margin without trusting an oracle.", read: "9 min" },
  { slug: "sandwich-economics", title: "The economics of getting sandwiched (and how to stop)", author: "mempool_maxi", date: "2026-06-02", category: "Esoteric", blurb: "A from-scratch walk through a sandwich bundle, the searcher's P&L, and exactly which slippage setting makes you a target.", read: "7 min" },
];

export const SUBMISSIONS: Submission[] = [
  { id: "s_104", title: "Why ve(3,3) keeps getting forked", author: "curve_curious", category: "Composability", status: "pending", date: "2026-06-11", body: "veTokenomics locks governance power; the (3,3) layer adds a bribe market on top. Together they create a flywheel where emissions follow bribes follow fees. The fork-ability comes from how cleanly the three pieces separate." },
  { id: "s_103", title: "A gentle intro to intent-based trading", author: "intentful", category: "Infrastructure", status: "pending", date: "2026-06-10", body: "Intents flip the model: you sign what you want, solvers compete to deliver it. This note maps intents back to the classic request-for-quote desk and where the analogy breaks." },
  { id: "s_102", title: "Stablecoin trilemma, illustrated", author: "peg_keeper", category: "Foundations", status: "approved", date: "2026-06-07", body: "Decentralization, capital efficiency, stability — pick two. A tour from DAI to algorithmic failures and back." },
];

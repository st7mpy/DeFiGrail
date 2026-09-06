// Placeholder copy for the home featured grid, shown only until the first
// community submission is approved. Real data: Neon submissions.

export type Featured = { slug: string; title: string; author: string; date: string; category: string; blurb: string; read: string };

export const FEATURED: Featured[] = [
  { slug: "lvr-vs-il", title: "LVR is the number IL was hiding from you", author: "0xMercator", date: "2026-06-08", category: "Esoteric", blurb: "Impermanent loss measures the wrong baseline. Loss-versus-rebalancing prices what arbitrageurs actually take from LPs each block — and it's bigger.", read: "6 min" },
  { slug: "oracle-free-lending", title: "What an oracle-free lending market would actually need", author: "liang.eth", date: "2026-06-05", category: "Modern Frontier", blurb: "Every lending hack of the last cycle traces back to a price feed. A thought experiment on building margin without trusting an oracle.", read: "9 min" },
  { slug: "sandwich-economics", title: "The economics of getting sandwiched (and how to stop)", author: "mempool_maxi", date: "2026-06-02", category: "Esoteric", blurb: "A from-scratch walk through a sandwich bundle, the searcher's P&L, and exactly which slippage setting makes you a target.", read: "7 min" },
];

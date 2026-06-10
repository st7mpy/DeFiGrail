# DeFiGrail

**A one-stop platform for learning DeFi — from first principles to the esoteric.**

DeFiGrail turns a dense single-file "DeFi reference terminal" into a full
learning product: structured reading tracks, interactive charts that teach the
math, live market context, and a community pipeline where good explainers get
featured.

> Status: 🏗️ pre-implementation — design approved, spec committed, build starting.

## What's inside

- 📚 **Reading material for every topic** — 11 protocol deep-dives (Uniswap
  v2/v3, MakerDAO, Compound, Aave, Pickle, SushiSwap, OHM, Pendle, Fluid,
  Euler) plus esoteric modules (impermanent loss, MEV, PT/YT as zero-coupon
  bonds, multi-utilization liquidity), each layered as
  *concept → mechanics → formulas → edge cases* with explicit TradFi anchors.
- 🛤️ **Learning tracks & prerequisite chains** — always know what to read next.
- 📈 **Interactive charts** — IL curve with live calculator, kinked interest
  rates, concentrated-liquidity ranges, PT pull-to-par decay.
- 🕸️ **Force-directed protocol graph** — the dependency map of DeFi as a
  navigable site map (raw Canvas, custom physics).
- 📰 **News & market updates** — live TVL, prices, and headlines aggregated
  from DefiLlama, CoinGecko, and crypto RSS, server-cached.
- ✍️ **Submissions** — write an explainer, get featured. Moderated queue,
  sanitized rendering, author credit.
- 🔍 **Search** — `Ctrl+K` command palette over topics, headings, and glossary.
- 🌌 **Ambient terminal aesthetic** — translucent drifting formulas in the
  background; JetBrains Mono + Sora; Bloomberg-terminal-meets-crypto.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database | Neon Postgres + Drizzle ORM |
| Content | MDX in-repo, build-validated frontmatter |
| Styling | Tailwind CSS, dark terminal theme |
| Search | Build-time index → FlexSearch (client) |
| Charts | Hand-rolled SVG components |
| Hosting | Vercel (cron-refreshed news cache, ISR publishing) |

## Design doc

The full approved spec lives at
[`docs/superpowers/specs/2026-06-10-defigrail-design.md`](docs/superpowers/specs/2026-06-10-defigrail-design.md)
— architecture, data model, API surface, error handling, and testing strategy.

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # vitest unit suite
npm run build      # validates all MDX + builds search index
```

Environment (`.env.local`): `DATABASE_URL`, `ADMIN_PASSWORD`, `CRON_SECRET`.

---

*Educational content only — nothing here is financial advice. Protocol
parameters drift; verify before use.*

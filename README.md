# DeFiGrail

**A one-stop platform for learning DeFi — from first principles to the esoteric.**

DeFiGrail turns a dense single-file "DeFi reference terminal" into a full
learning product: structured reading tracks, interactive charts that teach the
math, live market context, and a community pipeline where good explainers get
featured.

> Status: 🚀 **live** — [defigrail.vercel.app](https://defigrail.vercel.app)

## What's inside

- 📚 **Reading material for every topic** — 18 protocol & concept deep-dives
  (Uniswap v2/v3, MakerDAO, Compound, Aave, Pickle, SushiSwap, OHM, Pendle,
  Fluid, Euler) plus esoteric modules (impermanent loss, MEV, PT/YT as
  zero-coupon bonds, multi-utilization liquidity) and a TradFi↔DeFi map — each
  layered *concept → mechanics → formulas → edge cases* with explicit TradFi anchors.
- 🛤️ **Learning tracks & prerequisite chains** — five ordered tracks; always
  know what to read next, with localStorage reading-progress.
- 📈 **Interactive charts** — IL curve with live calculator, kinked interest
  rates, concentrated-liquidity ranges, PT pull-to-par decay.
- 🕸️ **Force-directed protocol graph** — the dependency map of DeFi as a
  navigable site map (raw Canvas, custom physics, click for deep-dive).
- 📰 **Live market & news** — real BTC/ETH prices, total DeFi TVL, top chains,
  and headlines from DefiLlama, CoinGecko, and crypto RSS, ISR-cached with
  graceful per-source fallback.
- ✍️ **Community submissions** — write an explainer, get featured. Honeypot +
  rate-limited intake, password-protected moderation queue, sanitized rendering,
  author credit, on-demand publishing.
- 🔍 **Search** — `⌘K` command palette over topics, TradFi anchors, and glossary.
- 📖 **Glossary** — 41 terms, auto-linked inline on topic pages with hover popovers.
- 🌌 **Paper-terminal aesthetic** — Newsreader serif + JetBrains Mono, monochrome
  with era encoded by glyph shape, and a translucent formula-rain background.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database | Neon Postgres + Drizzle ORM (community submissions) |
| Content | MDX in-repo, build-validated frontmatter |
| Styling | Tailwind CSS v4, "paper terminal" theme |
| Search | Client-side filter over topics + glossary (`⌘K`) |
| Market/news | DefiLlama + CoinGecko + RSS, ISR-cached (30 min) |
| Charts / graph | Hand-rolled SVG + raw Canvas |
| Hosting | Vercel (ISR + on-demand revalidation) |

## Routes

`/` home · `/learn` track browser · `/learn/[slug]` topic · `/graph` ·
`/charts` · `/glossary` · `/news` · `/community` (submit) ·
`/featured/[slug]` (approved pieces) · `/admin` (moderation, Basic-auth).

## Docs

- Spec: [`docs/superpowers/specs/2026-06-10-defigrail-design.md`](docs/superpowers/specs/2026-06-10-defigrail-design.md)
- Plan: [`docs/superpowers/plans/2026-06-10-defigrail-mvp.md`](docs/superpowers/plans/2026-06-10-defigrail-mvp.md)
- Design reference: [`docs/design/defigrail-reference.html`](docs/design/defigrail-reference.html)

## Development

```bash
npm install
npm run dev     # local dev server (http://localhost:3000)
npm test        # vitest unit suite (78 tests)
npm run build   # validates all MDX + type-checks + builds
```

Environment (`.env.local`, see `.env.example`):
`DATABASE_URL` (Neon — set by the Vercel integration), `ADMIN_PASSWORD`
(admin queue), `IP_SALT` (submission rate-limit hashing).

One-time after the DB is connected: hit `GET /api/admin/init-db` with the admin
Basic-auth credentials to create and seed the `submissions` table.

---

*Educational content only — nothing here is financial advice. Protocol
parameters drift; verify before use.*

# DeFiGrail — Design Spec

**Date:** 2026-06-10
**Status:** Approved (design review complete, pre-implementation)
**Repo:** `st7mpy/DeFiGrail` · **Hosting:** Vercel free tier · **Local:** `C:\Users\kotec\OneDrive\Desktop\DeFiGrail`

---

## 1. What & Why

DeFiGrail is a one-stop DeFi learning platform: structured reading material from
first principles to esoteric concepts, interactive charts that teach the math,
live market context, and a community submission pipeline. It evolves the
existing single-file "DeFi Reference Terminal" artifact into a full web product.

**Positioning:** portfolio showpiece now, architected so community features
(accounts, open contributions at scale) can be added without rework.

**Seed content:** the complete reference-site corpus — 11 protocol deep-dives
(Uniswap v2/v3, MakerDAO, Compound, Aave v1, Pickle, SushiSwap, OHM, Pendle,
Fluid, Euler), the TradFi market-making primer, 4 esoteric modules (IL, PT/YT
as zero-coupon bonds, MEV, multi-utilization liquidity), the TradFi⇄DeFi
mapping tables, and the trading-bot architecture progression. Each becomes an
MDX topic page preserving the four-layer pedagogy:
**concept → mechanics → formulas → edge cases**.

### Goals
1. Reading material for every topic, organized into learning tracks
2. Simple interactive charts/graphs (IL curve, rate curves, range liquidity, PT decay)
3. Subtle translucent background animation of drifting numbers/formulas
4. Working submissions section ("get featured") with moderation
5. News section with live market updates
6. Site-wide search
7. Extras (approved in design review): learning paths + prereq chains,
   interactive glossary, force-directed protocol graph, reading progress tracking

### Non-Goals (MVP)
- User accounts / OAuth (admin uses a single password)
- Comments, likes, or any social features
- Paid tiers, newsletters, analytics dashboards
- Mobile apps; the site is responsive web only
- On-chain integration (wallets, live protocol reads)

---

## 2. Stack (Approach A — approved)

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16, App Router, TypeScript | One repo, one deploy; SSG for content, serverless for API |
| Database | Neon Postgres (Vercel Marketplace) + Drizzle ORM | Free tier, SQL, shared by cron + serverless |
| Content | MDX files in repo | Git-versioned, editor-authored, interactive components inline |
| Styling | Tailwind CSS, dark terminal theme | Port of reference-site aesthetic (JetBrains Mono + Sora) |
| Charts | Custom SVG React components | <150 lines each, on-brand, no chart-lib dependency |
| Search | Build-time index → FlexSearch client-side | Instant-as-you-type, zero server cost |
| News refresh | Vercel Cron → API route | Hourly, guarded by `CRON_SECRET` |
| Admin auth | HTTP Basic via middleware, `ADMIN_PASSWORD` env | No accounts in MVP |
| CI | GitHub Actions + Vercel preview deploys | typecheck, lint, tests, full build per PR |

---

## 3. Architecture

Three surface types in one Next.js app:

1. **Static (build time):** all `/learn` topic pages compiled from MDX; search
   index generated from the same source. SEO-ready, free to serve.
2. **Dynamic (serverless):** submissions API, news aggregation + cache, admin
   review actions. Approved articles served with ISR — `revalidatePath` on
   approval means publish-without-redeploy.
3. **Client interactivity:** charts, force graph, glossary popovers, search
   palette, progress tracking, ambient background.

**Key boundary:** authored content (git/MDX, trusted, full component access)
and community content (DB, untrusted, sanitized markdown only) are separate
pipelines rendering through the same article layout. This line is what makes
accepting stranger content safe.

### Directory layout

```
DeFiGrail/
├── app/
│   ├── page.tsx                  # landing: hero, graph, tracks
│   ├── learn/[slug]/page.tsx     # topic pages (SSG from MDX)
│   ├── featured/page.tsx         # approved community articles index
│   ├── featured/[slug]/page.tsx  # article page (ISR from DB)
│   ├── news/page.tsx             # market strip + headlines
│   ├── submit/page.tsx           # submission form + live preview
│   ├── admin/page.tsx            # moderation queue (basic-auth)
│   └── api/
│       ├── submissions/route.ts  # POST: create pending submission
│       ├── news/route.ts         # GET: cached aggregate
│       ├── news/refresh/route.ts # POST: cron-triggered refetch
│       └── admin/review/route.ts # POST: approve/reject
├── content/
│   ├── topics/*.mdx              # seeded from reference site
│   ├── tracks.json               # ordered learning paths
│   └── glossary.json             # term → definition
├── components/
│   ├── charts/                   # ILCurve, KinkedRate, RangeLiquidity, PTDecay
│   ├── graph/                    # force-directed canvas graph
│   ├── ambient/                  # background number-rain canvas
│   ├── glossary/                 # term popover
│   └── search/                   # Ctrl+K palette
├── lib/
│   ├── db/                       # drizzle schema + queries
│   ├── news/                     # per-source fetchers + aggregate
│   ├── mdx.ts                    # content loading, frontmatter validation
│   └── sanitize.ts               # community markdown schema
├── scripts/build-search-index.ts
├── drizzle/                      # migrations
└── docs/superpowers/specs/       # this document
```

---

## 4. Content Model

### MDX frontmatter (validated at build; bad frontmatter fails the build)

```yaml
title: "Uniswap v2"
slug: "uniswap-v2"
era: "v0"                  # v0 | v1 | v2 | esoteric | infra
track: "foundations"       # key into tracks.json
order: 1
prereqs: []                # slugs; rendered as breadcrumb chain
related: ["uniswap-v3", "impermanent-loss"]
tradfiAnchor: "Continuous-quote market maker"
summary: "Constant-product AMM (x·y=k)..."   # graph tooltip + search + SEO
significance: 24           # graph node radius
```

- `tracks.json`: 5 tracks — Foundations, Composability, Modern Frontier,
  Esoteric, Infrastructure (the trading-bot material).
- `glossary.json`: ~40 terms at launch. A remark plugin wraps the **first**
  occurrence of each term per page in a `<GlossaryTerm>` popover.
- The protocol graph's nodes/edges derive from frontmatter (`era`,
  `significance`, `prereqs`, `related`) — no hand-maintained graph data.

---

## 5. Data Model (Postgres via Drizzle)

```
submissions
  id            uuid PK default gen_random_uuid()
  title         text NOT NULL
  author_name   text NOT NULL
  author_contact text NOT NULL          -- email, never displayed
  author_link   text                    -- optional, displayed
  category      text NOT NULL           -- era/topic tag
  body_md       text NOT NULL           -- ≤ 50 KB
  status        text NOT NULL default 'pending'  -- pending|approved|rejected
  slug          text UNIQUE             -- set on approval
  created_at    timestamptz default now()
  reviewed_at   timestamptz

news_cache
  source        text PK                 -- 'defillama' | 'coingecko' | 'rss'
  payload       jsonb NOT NULL
  fetched_at    timestamptz NOT NULL
```

One `submissions` table covers the whole lifecycle: `approved` **is**
published. No separate articles table to keep in sync.

---

## 6. API Surface

| Route | Method | Behavior |
|---|---|---|
| `/api/submissions` | POST | Zod-validate; honeypot field (silent fake success on trip); IP rate limit 3/hr (DB count); insert `pending` |
| `/api/news` | GET | Serve cached aggregate; if any source > 30 min stale, refresh that source in background |
| `/api/news/refresh` | POST | Vercel Cron hourly; `Authorization: Bearer CRON_SECRET`; refetch all sources, upsert `news_cache` |
| `/api/admin/review` | POST | Behind admin middleware; approve → generate slug + `revalidatePath('/featured')`; reject → status only |

**News sources (all free, no keys):** DefiLlama (total + per-chain TVL),
CoinGecko simple-price (BTC, ETH, stables), RSS headlines (The Defiant,
CoinDesk, Blockworks; top ~15 deduped). Aggregate shape:
`{ prices, tvl, headlines[], fetched_at }` per source.

**Admin middleware:** HTTP Basic against `ADMIN_PASSWORD` on `/admin` and
`/api/admin/*`.

---

## 7. Pages & Features

- **`/` Landing** — terminal hero (formula ticker, stat chips), interactive
  protocol graph as site map, track cards with progress bars.
- **`/learn/[slug]`** — prereq-chain breadcrumbs (auto from frontmatter);
  four-layer article body; embedded charts where they teach (IL curve with
  live calculator, kinked-rate curve, concentrated-liquidity ranges, PT
  pull-to-par decay); glossary popovers; mark-as-read + next-in-track footer.
- **`/news`** — market strip (BTC/ETH, total TVL, movers) + headlines grouped
  by source, each timestamped; visible "data as of HH:MM" stamp.
- **`/submit`** — title/author/contact/category/markdown body with live
  preview using the publication renderer (true WYSIWYG); success state sets
  review expectations.
- **`/featured`, `/featured/[slug]`** — approved articles, author-credited,
  same article layout as topics.
- **`/admin`** — pending queue, full preview, one-click approve/reject.
- **Search** — `Ctrl+K` palette everywhere; FlexSearch over titles, headings,
  body text, glossary; index lazy-loads on first open; results grouped
  Topic / Glossary / Featured.
- **Ambient background** — fixed canvas behind content: drifting translucent
  numbers + formula fragments, 4–6% opacity, ≤60 particles, slow upward
  drift; disabled under `prefers-reduced-motion`; paused when tab hidden.
- **Progress** — localStorage via small context provider; per-track
  percentage; no server round-trips.

---

## 8. Error Handling

- **Upstream API failure:** serve last cache with honest timestamp; sources
  degrade independently; cold-start shows "market data warming up" card.
- **Submissions:** inline Zod field errors; 429 with friendly copy on rate
  limit; honeypot returns fake success; 50 KB body cap.
- **Malicious markdown:** rehype-sanitize strict schema (no raw HTML, no
  scripts, no iframes); XSS payload corpus in unit tests.
- **Content errors:** frontmatter/MDX validation fails the CI build —
  broken content cannot deploy.
- **Routes:** `error.tsx` + `not-found.tsx` per route group, terminal-themed.

## 9. Testing

| Layer | Tool | Coverage |
|---|---|---|
| Unit | Vitest | chart math (IL values vs known table), slug gen, zod schemas, rate limiter, news parsers (fixtures), sanitizer (XSS corpus) |
| Component | Testing Library | form validation states, glossary popover, search results |
| E2E | Playwright (3 flows) | submit→approve→live; Ctrl+K search→topic; topic renders chain+chart |
| CI | GitHub Actions | typecheck + lint + unit + full build on PR; Vercel preview per branch |

## 10. Future (Community Phase — not in MVP)

Accounts (NextAuth) layering onto existing tables; submission status page for
authors; reactions; curator roles; newsletter. The DB/API boundary was chosen
so none of these require schema rework.

## 11. Known Corrections Carried Forward

The source context doc's IL formula (`2√P − 1 − P`) is wrong; the platform
uses the correct divergence-loss formula **IL = 2√P/(1+P) − 1** everywhere
(content, chart, calculator, tests assert the known reference values).

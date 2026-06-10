# DeFiGrail MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build DeFiGrail — a DeFi learning platform with MDX learning tracks, interactive charts, live news, community submissions, search, and the terminal aesthetic — per the approved spec at `docs/superpowers/specs/2026-06-10-defigrail-design.md`.

**Architecture:** One Next.js 16 (App Router, TypeScript) app on Vercel. Static MDX content + build-time search index; Neon Postgres (Drizzle) for submissions + news cache; serverless API routes; Vercel Cron for news refresh. Trusted MDX and untrusted community markdown are separate render pipelines.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, gray-matter + next-mdx-remote (RSC), Drizzle ORM + @neondatabase/serverless, zod, unified/rehype-sanitize, FlexSearch, rss-parser, Vitest + Testing Library, Playwright.

**Source material:** All seed content prose, formulas, and the canvas-physics reference implementation live in `C:\Users\kotec\Downloads\defi_reference_site.html` ("REF" below). The IL formula is `IL = 2√P/(1+P) − 1` everywhere (the older context doc's formula is wrong — do not use it).

**Conventions for every task:** work on `main`, commit after each green test cycle. Run all commands from repo root (`C:\Users\kotec\OneDrive\Desktop\DeFiGrail`). `npm test` = vitest run. Expected-output lines describe the essential signal, not byte-exact text.

---

## Phase Overview

| Phase | Delivers (deployable after each) | Tasks |
|---|---|---|
| 0 | Scaffold, theme, CI, first Vercel deploy | 1–3 |
| 1 | Content pipeline: MDX topics, tracks, prereq chains, glossary | 4–8 |
| 2 | Interactivity: charts, ambient background, protocol graph, progress | 9–13 |
| 3 | Search: build-time index + Ctrl+K palette | 14–15 |
| 4 | DB, submissions, admin, featured articles | 16–21 |
| 5 | News: fetchers, cache, cron, /news page | 22–24 |
| 6 | Landing page, error surfaces, E2E, launch checklist | 25–27 |

## File Structure (target)

```
app/                    layout.tsx, page.tsx, globals.css
  learn/[slug]/page.tsx     featured/page.tsx, featured/[slug]/page.tsx
  news/page.tsx             submit/page.tsx        admin/page.tsx
  api/submissions/route.ts  api/news/route.ts
  api/news/refresh/route.ts api/admin/review/route.ts
components/
  charts/ILCurve.tsx KinkedRate.tsx RangeLiquidity.tsx PTDecay.tsx Axes.tsx
  graph/ProtocolGraph.tsx   ambient/AmbientField.tsx
  glossary/GlossaryTerm.tsx search/SearchPalette.tsx
  progress/{ProgressProvider,MarkAsRead,TrackProgress}.tsx
  PrereqChain.tsx TopicCard.tsx SiteNav.tsx
content/topics/*.mdx  content/tracks.json  content/glossary.json
lib/
  mdx.ts          load/validate topics          defi-math.ts   chart math
  slug.ts         slugify                        sanitize.ts    community md
  db/{index,schema}.ts                           ratelimit.ts
  news/{defillama,coingecko,rss,aggregate}.ts    glossary-remark.ts
scripts/build-search-index.ts
middleware.ts  vercel.json  drizzle.config.ts  vitest.config.ts
.github/workflows/ci.yml
tests/fixtures/*.json  e2e/*.spec.ts
```

---

# Phase 0 — Scaffold & Deploy Pipeline

### Task 1: Scaffold Next.js app with Tailwind and test tooling

**Files:** Create: entire Next.js scaffold; Modify: `package.json`; Create: `vitest.config.ts`, `vitest.setup.ts`

- [ ] **Step 1: Scaffold (in the existing repo — answer "No" to src dir, "Yes" to App Router, TS, Tailwind, ESLint)**

```bash
npx create-next-app@latest . --typescript --eslint --tailwind --app --no-src-dir --import-alias "@/*"
```

If it balks at the non-empty dir (README, docs, .gitignore exist), scaffold to `../defigrail-tmp` and move everything except README.md/.gitignore/docs into the repo, merging .gitignore entries.

- [ ] **Step 2: Install runtime + dev dependencies**

```bash
npm i gray-matter next-mdx-remote remark-gfm zod drizzle-orm @neondatabase/serverless flexsearch rss-parser unified remark-parse remark-rehype rehype-sanitize rehype-stringify
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @types/node drizzle-kit tsx @playwright/test
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["lib/**/*.test.{ts,tsx}", "components/**/*.test.{ts,tsx}", "app/**/*.test.{ts,tsx}"],
  },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

Create `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`, `"e2e": "playwright test"`.

- [ ] **Step 4: Verify the toolchain**

Run: `npm test` → Expected: "No test files found" (exit 0 with passWithNoTests? add `passWithNoTests: true` to the test config block — do it now).
Run: `npm run dev` briefly → Expected: localhost:3000 renders the default page. Stop it.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js 16 + Tailwind + Vitest toolchain"
```

### Task 2: Terminal theme tokens, fonts, base layout

**Files:** Modify: `app/globals.css`, `app/layout.tsx`; Create: `components/SiteNav.tsx`

- [ ] **Step 1: Replace `app/globals.css` with the design tokens (port of REF palette)**

```css
@import "tailwindcss";

@theme {
  --color-bg: #070b10;       --color-bg2: #0b1117;
  --color-panel: #0f161e;    --color-card: #121a24;
  --color-card2: #16202b;    --color-line: #1d2936;
  --color-line2: #2b3a4c;    --color-txt: #d8e1ea;
  --color-dim: #8aa0b4;      --color-faint: #5b7186;
  --color-v0: #3ce882;       --color-v1: #ffb454;
  --color-v2: #5cb2ff;       --color-esoteric: #c792ea;
  --color-ref: #4dd6c1;      --color-infra: #ff6e6e;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --font-sans: "Sora", system-ui, sans-serif;
}

body { background: var(--color-bg); color: var(--color-txt); font-family: var(--font-sans); }
::selection { background: rgba(92, 178, 255, 0.28); }
```

- [ ] **Step 2: `app/layout.tsx` — fonts via `next/font/google`, nav, metadata**

```tsx
import type { Metadata } from "next";
import { JetBrains_Mono, Sora } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: { default: "DeFiGrail — Learn DeFi from first principles", template: "%s · DeFiGrail" },
  description: "A one-stop DeFi learning platform: structured tracks, interactive charts, live market context.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${mono.variable}`}>
      <body>
        <SiteNav />
        <main className="mx-auto max-w-6xl px-6 pb-20">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: `components/SiteNav.tsx` — sticky terminal tabs (server component)**

```tsx
import Link from "next/link";

const TABS = [
  { href: "/", label: "HOME", color: "var(--color-v0)" },
  { href: "/learn/uniswap-v2", label: "LEARN", color: "var(--color-v2)" },
  { href: "/news", label: "NEWS", color: "var(--color-ref)" },
  { href: "/featured", label: "FEATURED", color: "var(--color-v1)" },
  { href: "/submit", label: "SUBMIT", color: "var(--color-esoteric)" },
];

export default function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 flex h-13 items-center gap-1 border-b border-line bg-bg/90 px-5 backdrop-blur font-mono text-xs tracking-wider">
      <Link href="/" className="mr-5 flex items-center gap-2 font-bold">
        <span className="h-2 w-2 rounded-xs bg-v0 shadow-[0_0_10px_var(--color-v0)]" />
        DEFI/GRAIL <span className="font-normal text-faint">EDU TERMINAL</span>
      </Link>
      {TABS.map(t => (
        <Link key={t.href} href={t.href} className="px-3 py-2 text-dim hover:text-txt" style={{ borderBottom: `2px solid transparent` }}>
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: t.color }} />
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Visual check** — `npm run dev`, confirm dark bg, mono nav, fonts load. Stop server.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: terminal theme tokens, fonts, sticky nav"`

### Task 3: CI workflow + Vercel project

**Files:** Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the workflow**

```yaml
name: CI
on: { push: { branches: [main] }, pull_request: {} }
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

- [ ] **Step 2: Commit + push, verify CI green** — `git add -A && git commit -m "ci: typecheck, lint, test, build on push/PR" && git push`. Check: `gh run watch` → Expected: ✓ verify.
- [ ] **Step 3: Connect Vercel** — `npx vercel link` (create project `defigrail`, scope st7mpy), then `npx vercel deploy --prod` once to verify the pipeline. From then on, pushes to `main` auto-deploy via the Vercel GitHub app (`npx vercel git connect`).

---

# Phase 1 — Content Pipeline

### Task 4: Topic loader with validated frontmatter (TDD)

**Files:** Create: `lib/mdx.ts`, `lib/mdx.test.ts`, `content/topics/uniswap-v2.mdx`, `content/tracks.json`

- [ ] **Step 1: Write failing tests `lib/mdx.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { frontmatterSchema, loadTopics, getTopic } from "./mdx";

describe("frontmatterSchema", () => {
  const valid = {
    title: "Uniswap v2", slug: "uniswap-v2", era: "v0", track: "foundations",
    order: 1, prereqs: [], related: ["impermanent-loss"],
    tradfiAnchor: "Continuous-quote market maker",
    summary: "Constant-product AMM (x·y=k) — the passive market maker every DEX descends from.",
    significance: 24,
  };
  it("accepts a valid topic", () => expect(frontmatterSchema.parse(valid).slug).toBe("uniswap-v2"));
  it("rejects bad era", () => expect(() => frontmatterSchema.parse({ ...valid, era: "v9" })).toThrow());
  it("rejects bad slug chars", () => expect(() => frontmatterSchema.parse({ ...valid, slug: "Uni Swap!" })).toThrow());
});

describe("loadTopics", () => {
  it("loads seeded topics with bodies", () => {
    const topics = loadTopics();
    expect(topics.length).toBeGreaterThan(0);
    const uni = getTopic("uniswap-v2");
    expect(uni?.meta.era).toBe("v0");
    expect(uni?.body).toContain("x · y = k");
  });
  it("every prereq/related slug resolves", () => {
    const slugs = new Set(loadTopics().map(t => t.meta.slug));
    for (const t of loadTopics())
      for (const p of [...t.meta.prereqs, ...t.meta.related])
        expect(slugs.has(p), `${t.meta.slug} → ${p}`).toBe(true);
  });
});
```

- [ ] **Step 2: Run** `npm test` → Expected: FAIL (module `./mdx` not found).
- [ ] **Step 3: Implement `lib/mdx.ts`**

```ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const TOPICS_DIR = path.join(process.cwd(), "content", "topics");

export const ERAS = ["v0", "v1", "v2", "esoteric", "infra", "ref"] as const;

export const frontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  era: z.enum(ERAS),
  track: z.string().min(1),
  order: z.number().int().positive(),
  prereqs: z.array(z.string()).default([]),
  related: z.array(z.string()).default([]),
  tradfiAnchor: z.string().optional(),
  summary: z.string().min(10).max(300),
  significance: z.number().int().min(8).max(30).default(14),
});

export type TopicMeta = z.infer<typeof frontmatterSchema>;
export type Topic = { meta: TopicMeta; body: string };

let cache: Topic[] | null = null;

export function loadTopics(): Topic[] {
  if (cache) return cache;
  cache = fs.readdirSync(TOPICS_DIR).filter(f => f.endsWith(".mdx")).map(f => {
    const raw = fs.readFileSync(path.join(TOPICS_DIR, f), "utf8");
    const { data, content } = matter(raw);
    const meta = frontmatterSchema.parse(data); // throws → build fails (spec §8)
    if (`${meta.slug}.mdx` !== f) throw new Error(`slug/filename mismatch in ${f}`);
    return { meta, body: content };
  }).sort((a, b) => a.meta.order - b.meta.order);
  return cache;
}

export const getTopic = (slug: string) => loadTopics().find(t => t.meta.slug === slug);
```

- [ ] **Step 4: Seed `content/topics/uniswap-v2.mdx`** — frontmatter exactly as in the test's `valid` object (YAML form), body ported from REF's `#uniswap-v2` card. Structure every topic identically — this file is the template for all later ports:

```mdx
---
title: "Uniswap v2"
slug: "uniswap-v2"
era: "v0"
track: "foundations"
order: 1
prereqs: []
related: ["impermanent-loss"]
tradfiAnchor: "Continuous-quote market maker"
summary: "Constant-product AMM (x·y=k) — the passive market maker every DEX descends from."
significance: 24
---

## 01 · Concept — what problem does it solve?

Order books need active market makers posting quotes. On-chain, every quote
update costs gas... [port REF #uniswap-v2 block 01 prose verbatim]

## 02 · Mechanics

- **Pool:** reserves *x* and *y*; every swap preserves `x · y = k` (after the 0.30% fee)...
[port REF block 02 bullets]

## 03 · Formulas

```text
x · y = k
Δy = ( y · Δx · 997 ) / ( x · 1000 + Δx · 997 )
s₀ = √(Δx·Δy) − 1000
```

## 04 · Edge cases & risks

- **Impermanent loss** — see [Impermanent Loss](/learn/impermanent-loss)...
[port REF block 04 bullets]
```

Also create `content/tracks.json`:

```json
{
  "foundations":   { "label": "Foundations",      "era": "v0",       "topics": ["uniswap-v2", "makerdao", "compound", "aave-v1", "tradfi-mapping"] },
  "composability": { "label": "Composability",    "era": "v1",       "topics": ["pickle-finance", "sushiswap"] },
  "frontier":      { "label": "Modern Frontier",  "era": "v2",       "topics": ["uniswap-v3", "ohm-olympusdao", "pendle", "fluid", "euler"] },
  "esoteric":      { "label": "Esoteric",         "era": "esoteric", "topics": ["mm-primer", "impermanent-loss", "ptyt-zero-coupon", "mev", "multi-utilization"] },
  "infrastructure":{ "label": "Infrastructure",   "era": "infra",    "topics": ["bot-architecture"] }
}
```

(The prereq-resolution test will fail until `impermanent-loss.mdx` exists — temporarily set `related: []` in uniswap-v2.mdx, restore it in Task 6.)

- [ ] **Step 5: Run** `npm test` → Expected: PASS.
- [ ] **Step 6: Commit** — `git commit -am "feat: topic loader with zod-validated frontmatter + first seeded topic"`

### Task 5: Topic page route + prereq chain component

**Files:** Create: `app/learn/[slug]/page.tsx`, `components/PrereqChain.tsx`, `components/PrereqChain.test.tsx`

- [ ] **Step 1: Failing component test `components/PrereqChain.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import PrereqChain from "./PrereqChain";

it("renders linked chain with arrows and terminal label", () => {
  render(<PrereqChain items={[{ slug: "mm-primer", title: "TradFi Market Making" }]} />);
  expect(screen.getByText("PREREQ CHAIN")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "TradFi Market Making" })).toHaveAttribute("href", "/learn/mm-primer");
  expect(screen.getByText("THIS MODULE")).toBeInTheDocument();
});

it("renders nothing when no prereqs", () => {
  const { container } = render(<PrereqChain items={[]} />);
  expect(container).toBeEmptyDOMElement();
});
```

- [ ] **Step 2: Run** `npm test` → FAIL (module not found).
- [ ] **Step 3: Implement `components/PrereqChain.tsx`**

```tsx
import Link from "next/link";

export default function PrereqChain({ items }: { items: { slug: string; title: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div className="my-4 flex flex-wrap items-center gap-2 rounded-md border border-esoteric/25 bg-esoteric/5 px-4 py-2 font-mono text-[11px] text-dim">
      <span className="text-[9.5px] font-bold tracking-[1.4px] text-esoteric">PREREQ CHAIN</span>
      {items.map(p => (
        <span key={p.slug} className="flex items-center gap-2">
          <Link href={`/learn/${p.slug}`} className="border-b border-dotted border-esoteric text-txt hover:text-esoteric">{p.title}</Link>
          <span className="text-esoteric/70">→</span>
        </span>
      ))}
      <span className="text-esoteric">THIS MODULE</span>
    </div>
  );
}
```

- [ ] **Step 4: Implement `app/learn/[slug]/page.tsx` (SSG)**

```tsx
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { loadTopics, getTopic } from "@/lib/mdx";
import PrereqChain from "@/components/PrereqChain";

export const dynamicParams = false;
export function generateStaticParams() {
  return loadTopics().map(t => ({ slug: t.meta.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const t = getTopic((await params).slug);
  return { title: t?.meta.title, description: t?.meta.summary };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const topic = getTopic((await params).slug);
  if (!topic) notFound();
  const prereqs = topic.meta.prereqs
    .map(s => getTopic(s)).filter(Boolean)
    .map(t => ({ slug: t!.meta.slug, title: t!.meta.title }));
  return (
    <article className="prose-defigrail mx-auto max-w-3xl pt-10">
      <p className="font-mono text-[10px] tracking-[2px] text-faint">{topic.meta.era.toUpperCase()} · {topic.meta.track.toUpperCase()}</p>
      <h1 className="text-3xl font-extrabold">{topic.meta.title}</h1>
      {topic.meta.tradfiAnchor && (
        <p className="mt-1 inline-block rounded border border-dashed border-ref/40 px-2 py-1 font-mono text-[10.5px] text-ref">
          TRADFI ANCHOR ≡ {topic.meta.tradfiAnchor.toUpperCase()}
        </p>
      )}
      <PrereqChain items={prereqs} />
      <MDXRemote source={topic.body} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
    </article>
  );
}
```

Add a `prose-defigrail` block to `globals.css` styling `h2` (mono, small-caps accent labels), `pre` (dark panel, green text), `ul`/`li` (▸ markers), `table` borders — port the visual rules from REF's `.block`, `pre.formula`, `.tbl-wrap` CSS.

- [ ] **Step 5: Verify** — `npm test` PASS; `npm run dev` → `/learn/uniswap-v2` renders styled article.
- [ ] **Step 6: Commit** — `git commit -am "feat: topic page route with prereq chain breadcrumbs"`

### Task 6: Port all remaining topics from REF

**Files:** Create 15 files in `content/topics/` per this mapping (source = REF section ids):

| MDX file | REF source | era | track / order | prereqs | significance |
|---|---|---|---|---|---|
| makerdao.mdx | `#makerdao` | v0 | foundations / 2 | [] | 22 |
| compound.mdx | `#compound` | v0 | foundations / 3 | [] | 21 |
| aave-v1.mdx | `#aave-v1` | v0 | foundations / 4 | [compound] | 21 |
| tradfi-mapping.mdx | `#tradfi-mapping` (tables + flows + risk table) | ref | foundations / 5 | [] | 16 |
| pickle-finance.mdx | `#pickle` | v1 | composability / 1 | [compound, uniswap-v2] | 15 |
| sushiswap.mdx | `#sushiswap` | v1 | composability / 2 | [uniswap-v2] | 17 |
| uniswap-v3.mdx | `#uniswap-v3` | v2 | frontier / 1 | [uniswap-v2, impermanent-loss] | 23 |
| ohm-olympusdao.mdx | `#ohm` | v2 | frontier / 2 | [sushiswap] | 16 |
| pendle.mdx | `#pendle` | v2 | frontier / 3 | [aave-v1, compound] | 19 |
| fluid.mdx | `#fluid` | v2 | frontier / 4 | [aave-v1] | 17 |
| euler.mdx | `#euler` | v2 | frontier / 5 | [compound] | 16 |
| mm-primer.mdx | `#mm-primer` | esoteric | esoteric / 1 | [] | 14 |
| impermanent-loss.mdx | `#il-card` | esoteric | esoteric / 2 | [mm-primer, uniswap-v2] | 14 |
| ptyt-zero-coupon.mdx | `#ptyt-card` | esoteric | esoteric / 3 | [pendle] | 13 |
| mev.mdx | `#mev-card` | esoteric | esoteric / 4 | [uniswap-v2] | 15 |
| multi-utilization.mdx | `#multiutil-card` | esoteric | esoteric / 5 | [compound, uniswap-v2, fluid] | 13 |
| bot-architecture.mdx | `#trading-bots` (both paradigms, 4-stage table, infra snippets) | infra | infrastructure / 1 | [mev] | 18 |

- [ ] **Step 1:** Port each file using the Task 4 template: frontmatter from the table (summary = the node `sum` strings in REF's NODES array; `related` = REF graph edges touching that node), body = the four `## 0N ·` sections with prose/bullets/formula blocks copied from the matching REF card. Internal links become `/learn/<slug>`. Restore `related: ["impermanent-loss"]` in uniswap-v2.mdx.
- [ ] **Step 2:** `npm test` → PASS (prereq-resolution test now passes against full set). `npm run build` → PASS (frontmatter validation across all 17 files).
- [ ] **Step 3:** Spot-check 3 pages in dev (`/learn/mev`, `/learn/pendle`, `/learn/bot-architecture`).
- [ ] **Step 4: Commit** — `git commit -am "content: port all 17 topics from reference site"`

### Task 7: Glossary data + remark auto-linking plugin (TDD)

**Files:** Create: `content/glossary.json`, `lib/glossary-remark.ts`, `lib/glossary-remark.test.ts`, `components/glossary/GlossaryTerm.tsx`

- [ ] **Step 1: Seed `content/glossary.json`** — ~40 terms; entry shape `{ "term": "AMM", "aliases": ["automated market maker"], "def": "Automated market maker — a formula-priced asset pool that quotes continuously without an order book." }`. Source the definitions from REF content (AMM, LP, CDP, flash loan, utilization, cToken/aToken, rebase, POL, PT, YT, tick, concentrated liquidity, mempool, sandwich, MEV, TWAP, oracle, liquidation, health factor, stablecoin, vampire attack, ve-tokenomics, rehypothecation, LVR, slippage, divergence loss, kink, bonding, basis/implied yield, searcher, builder, validator, private relay, bundle, prime brokerage, zero-coupon bond, interest rate swap, duration, yield curve, collateral factor).

- [ ] **Step 2: Failing tests `lib/glossary-remark.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { remarkGlossary } from "./glossary-remark";

async function run(md: string) {
  const f = await unified().use(remarkParse)
    .use(remarkGlossary, { terms: [{ term: "flash loan", def: "x" }] })
    .use(remarkStringify).process(md);
  return String(f);
}

describe("remarkGlossary", () => {
  it("wraps first occurrence in GlossaryTerm jsx", async () => {
    expect(await run("A flash loan is atomic.")).toContain('<GlossaryTerm term="flash loan">');
  });
  it("only wraps the first occurrence per document", async () => {
    const out = await run("flash loan here, flash loan there");
    expect(out.match(/GlossaryTerm/g)?.length).toBe(2); // one open + one close tag
  });
  it("never wraps inside code or headings", async () => {
    expect(await run("# flash loan\n\n`flash loan`")).not.toContain("GlossaryTerm");
  });
});
```

- [ ] **Step 3: Run** → FAIL. **Step 4: Implement `lib/glossary-remark.ts`** — mdast `visit` over `text` nodes (skip parents of type `heading`, `code`, `inlineCode`, `link`); case-insensitive match of term or alias; on first hit per document, split the text node and insert an `mdxJsxTextElement` node `GlossaryTerm` with attribute `term`; track hits in a `Set` so each term links once:

```ts
import { visit, SKIP } from "unist-util-visit";
import type { Root, Text } from "mdast";

export type GlossaryEntry = { term: string; aliases?: string[]; def: string };

export function remarkGlossary({ terms }: { terms: GlossaryEntry[] }) {
  const all = terms.flatMap(t => [t.term, ...(t.aliases ?? [])].map(a => ({ alias: a.toLowerCase(), canonical: t.term })));
  return (tree: Root) => {
    const seen = new Set<string>();
    visit(tree, "text", (node: Text, index, parent: any) => {
      if (!parent || ["heading", "code", "inlineCode", "link", "mdxJsxTextElement"].includes(parent.type)) return;
      const lower = node.value.toLowerCase();
      for (const { alias, canonical } of all) {
        if (seen.has(canonical)) continue;
        const i = lower.indexOf(alias);
        if (i === -1) continue;
        const before = node.value.slice(0, i);
        const hit = node.value.slice(i, i + alias.length);
        const after = node.value.slice(i + alias.length);
        const jsx = {
          type: "mdxJsxTextElement", name: "GlossaryTerm",
          attributes: [{ type: "mdxJsxAttribute", name: "term", value: canonical }],
          children: [{ type: "text", value: hit }],
        };
        const repl: any[] = [];
        if (before) repl.push({ type: "text", value: before });
        repl.push(jsx);
        if (after) repl.push({ type: "text", value: after });
        parent.children.splice(index!, 1, ...repl);
        seen.add(canonical);
        return [SKIP, index! + repl.length];
      }
    });
  };
}
```

(`npm i unist-util-visit` if not already a transitive dep — add explicitly.)

- [ ] **Step 5: Implement `components/glossary/GlossaryTerm.tsx`** — client component: dotted-underline `<button>` that toggles an absolutely-positioned popover (`role="tooltip"`) with the definition looked up from a glossary map passed via context from the page (server passes `glossary.json` content through a `GlossaryProvider`). Close on blur/Escape/outside click.
- [ ] **Step 6: Wire into Task 5's page** — add `remarkGlossary` (with terms from `glossary.json`) to `mdxOptions.remarkPlugins`, add `GlossaryTerm` to the MDX `components` map, wrap article in `GlossaryProvider`.
- [ ] **Step 7:** `npm test` PASS; dev-check hover popover on `/learn/aave-v1` ("flash loan"). **Commit** — `git commit -am "feat: glossary auto-linking with popovers"`

### Task 8: Track pages data + next-in-track footer

**Files:** Create: `lib/tracks.ts`, `lib/tracks.test.ts`; Modify: `app/learn/[slug]/page.tsx`

- [ ] **Step 1: Failing tests** — `getTrack("foundations")` returns ordered topic metas; `nextInTrack("uniswap-v2")` → `makerdao`; `nextInTrack("bot-architecture")` → `null`; every `tracks.json` slug resolves to a real topic.
- [ ] **Step 2:** FAIL → **Step 3: Implement `lib/tracks.ts`** reading `content/tracks.json`, joining against `loadTopics()`, exporting `TRACKS`, `getTrack`, `nextInTrack`.
- [ ] **Step 4:** Add footer to the topic page: "NEXT IN TRACK → [title]" link when `nextInTrack` is non-null.
- [ ] **Step 5:** `npm test` PASS → **Commit** `git commit -am "feat: learning tracks with next-in-track navigation"`

---

# Phase 2 — Interactive Components

### Task 9: DeFi math library (TDD — the numbers the charts trust)

**Files:** Create: `lib/defi-math.ts`, `lib/defi-math.test.ts`

- [ ] **Step 1: Failing tests**

```ts
import { describe, expect, it } from "vitest";
import { impermanentLoss, kinkedRate, ptPrice, v3Amounts } from "./defi-math";

describe("impermanentLoss — IL = 2√P/(1+P) − 1", () => {
  it("is 0 at P=1", () => expect(impermanentLoss(1)).toBeCloseTo(0, 10));
  it("matches reference table", () => {
    expect(impermanentLoss(1.25)).toBeCloseTo(-0.0062, 3);
    expect(impermanentLoss(2)).toBeCloseTo(-0.0572, 3);
    expect(impermanentLoss(4)).toBeCloseTo(-0.2, 3);
    expect(impermanentLoss(5)).toBeCloseTo(-0.2546, 3);
  });
  it("is symmetric in log-space: IL(2) == IL(0.5)", () =>
    expect(impermanentLoss(2)).toBeCloseTo(impermanentLoss(0.5), 10));
  it("throws on P <= 0", () => expect(() => impermanentLoss(0)).toThrow(RangeError));
});

describe("kinkedRate", () => {
  it("is base at U=0", () => expect(kinkedRate(0)).toBeCloseTo(0.02));
  it("is continuous at the kink", () =>
    expect(kinkedRate(0.8 - 1e-9)).toBeCloseTo(kinkedRate(0.8 + 1e-9), 4));
  it("steepens above kink", () =>
    expect(kinkedRate(0.9) - kinkedRate(0.8)).toBeGreaterThan(kinkedRate(0.8) - kinkedRate(0.7)));
});

describe("ptPrice", () => {
  it("pulls to par at t=0", () => expect(ptPrice(0.1, 0)).toBe(1));
  it("discounts: 1y @ 10% ≈ 0.909", () => expect(ptPrice(0.1, 1)).toBeCloseTo(0.909, 3));
});

describe("v3Amounts", () => {
  it("in-range position holds both assets", () => {
    const { x, y } = v3Amounts(1, 1500, 1000, 2000);
    expect(x).toBeGreaterThan(0); expect(y).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2:** FAIL → **Step 3: Implement `lib/defi-math.ts`**

```ts
export function impermanentLoss(P: number): number {
  if (P <= 0) throw new RangeError("price ratio must be > 0");
  return (2 * Math.sqrt(P)) / (1 + P) - 1;
}

export function kinkedRate(u: number, base = 0.02, kink = 0.8, m1 = 0.1, m2 = 0.75): number {
  if (u < 0 || u > 1) throw new RangeError("utilization in [0,1]");
  return u <= kink ? base + u * m1 : base + kink * m1 + (u - kink) * m2;
}

export const ptPrice = (r: number, t: number) => 1 / Math.pow(1 + r, t);

export function v3Amounts(L: number, P: number, Pa: number, Pb: number) {
  const sp = Math.sqrt(P), sa = Math.sqrt(Pa), sb = Math.sqrt(Pb);
  if (P <= Pa) return { x: L * (sb - sa) / (sa * sb), y: 0 };
  if (P >= Pb) return { x: 0, y: L * (sb - sa) };
  return { x: L * (sb - sp) / (sp * sb), y: L * (sp - sa) };
}
```

- [ ] **Step 4:** `npm test` PASS → **Step 5: Commit** `git commit -am "feat: defi math lib with reference-value tests"`

### Task 10: Chart components (ILCurve + 3 siblings)

**Files:** Create: `components/charts/Axes.tsx`, `ILCurve.tsx`, `KinkedRate.tsx`, `RangeLiquidity.tsx`, `PTDecay.tsx`, `components/charts/ILCurve.test.tsx`

- [ ] **Step 1:** Shared `Axes.tsx`: an SVG frame component (700×320 viewBox, panel bg, hairline gridlines, mono axis labels) accepting `children` paths. All charts are client components.
- [ ] **Step 2: ILCurve** — plots `impermanentLoss(P)` for P ∈ [0.1, 5] (log-x), plus the live calculator: two number inputs (entry/current price) → marker dot on the curve + readout `IL −x.xx% · HODL $a vs LP $b` for a $10k position (`hodl = 10000*(1+P)/2`, `lp = 10000*Math.sqrt(P)`). Test (`ILCurve.test.tsx`): render, fill inputs 2000/3000 via `fireEvent.change`, assert text `-2.02%` appears; assert an `svg path` exists.
- [ ] **Step 3: KinkedRate** — borrow-rate curve over U∈[0,1] with the kink at 0.8 highlighted; slider for U showing rate readout. **RangeLiquidity** — v3 visual: price axis with draggable-free (two range inputs) Pa/Pb band, bars showing x/y composition from `v3Amounts`. **PTDecay** — `ptPrice(r, t)` for t from 1y→0 at three implied rates (5/10/20%), showing pull-to-par.
- [ ] **Step 4:** Register all four in the MDX components map; embed via MDX: `<ILCurve />` into `impermanent-loss.mdx` §03, `<KinkedRate />` into `compound.mdx` §03, `<RangeLiquidity />` into `uniswap-v3.mdx` §02, `<PTDecay />` into `pendle.mdx` and `ptyt-zero-coupon.mdx` §03.
- [ ] **Step 5:** `npm test` PASS; dev-check all four pages. **Commit** `git commit -am "feat: interactive SVG charts embedded in topics"`

### Task 11: Ambient background field

**Files:** Create: `components/ambient/AmbientField.tsx`; Modify: `app/layout.tsx`

- [ ] **Step 1: Implement** — client component, `<canvas>` fixed inset-0 z-[-1] pointer-events-none. ≤60 particles, each `{x, y, vy: 0.1–0.35 px/frame upward, text, size 10–18px, alpha 0.04–0.06}`; texts drawn from a const array of formula fragments (`x·y=k`, `2√P/(1+P)−1`, `1.0001^i`, `PT+YT=SY`, `(3,3)`, hex addresses, prices). Respawn at bottom when off top. Guards: skip entirely when `matchMedia("(prefers-reduced-motion: reduce)").matches`; `document.visibilitychange` pauses rAF loop; DPR-scaled like REF's graph canvas.
- [ ] **Step 2:** Mount in `layout.tsx` before `<SiteNav/>`. Dev-check: visible at rest, invisible while reading, 0% CPU when tab hidden (check via Performance monitor).
- [ ] **Step 3: Commit** — `git commit -am "feat: ambient translucent formula-rain background"`

### Task 12: Protocol graph (port from REF)

**Files:** Create: `components/graph/ProtocolGraph.tsx`, `lib/graph-data.ts`, `lib/graph-data.test.ts`

- [ ] **Step 1: Failing test** — `buildGraph(loadTopics())` returns: a node per topic `{id, label, era, r, slug, summary}` (r = significance); edges derived from each topic's `prereqs` + `related` (deduped, both-direction dedupe); no edge points at a missing node.
- [ ] **Step 2:** FAIL → **Step 3: Implement `lib/graph-data.ts`** (pure function, ~30 lines).
- [ ] **Step 4: Implement `ProtocolGraph.tsx`** — client component porting REF's `<script>` physics verbatim into a `useEffect` (REP 22000, SPRING_K 0.012, REST 135, GRAVITY 0.004, DAMP 0.85, MAXV 5, PAD 46; same step/draw/pick/drag/tooltip logic; era colors from the Tailwind tokens). Differences from REF: nodes/edges come as props from `buildGraph`; click navigates with `useRouter().push("/learn/"+slug)`; tooltip is a positioned `<div>` sibling. Clean up rAF + listeners on unmount.
- [ ] **Step 5:** `npm test` PASS; mount temporarily on `/` to dev-check hover/click/drag. **Commit** `git commit -am "feat: force-directed protocol graph from topic frontmatter"`

### Task 13: Reading progress (localStorage)

**Files:** Create: `components/progress/ProgressProvider.tsx`, `MarkAsRead.tsx`, `TrackProgress.tsx`, `components/progress/progress.test.tsx`

- [ ] **Step 1: Failing tests** — render provider + `MarkAsRead slug="uniswap-v2"`; click toggles label READ ✓; localStorage key `defigrail:read` contains slug; `TrackProgress track="foundations" total={5}` shows `20%` after one mark.
- [ ] **Step 2:** FAIL → **Step 3: Implement** — context holding `Set<string>` hydrated from localStorage (lazy `useEffect` to dodge SSR mismatch), `toggle(slug)`, `persist`. `MarkAsRead`: mono bordered button. `TrackProgress`: thin era-colored bar + `n/total`.
- [ ] **Step 4:** Wire provider into layout; `MarkAsRead` into topic footer; `TrackProgress` used by Task 25's track cards.
- [ ] **Step 5:** `npm test` PASS → **Commit** `git commit -am "feat: localStorage reading progress"`

---

# Phase 3 — Search

### Task 14: Build-time search index (TDD)

**Files:** Create: `scripts/build-search-index.ts`, `lib/search-text.ts`, `lib/search-text.test.ts`; Modify: `package.json`

- [ ] **Step 1: Failing tests for `stripToText`** — removes fenced code blocks, JSX tags (`<ILCurve />`), markdown syntax (`**`, `##`, links keep label), collapses whitespace; `extractHeadings` returns `["01 · Concept — ...", ...]`.
- [ ] **Step 2:** FAIL → **Step 3: Implement `lib/search-text.ts`** (regex-based, ~25 lines) and the script: load topics + glossary → write `public/search-index.json` as `[{ id, type: "topic"|"glossary", slug, title, era, headings, body }]` (body truncated 4000 chars). Add to package.json: `"prebuild": "tsx scripts/build-search-index.ts"` and a `predev` variant.
- [ ] **Step 4:** `npm test` PASS; `npm run build` → Expected: `public/search-index.json` exists, >17 entries. Add `public/search-index.json` to `.gitignore`.
- [ ] **Step 5: Commit** — `git commit -am "feat: build-time search index generation"`

### Task 15: Ctrl+K search palette

**Files:** Create: `components/search/SearchPalette.tsx`; Modify: `components/SiteNav.tsx`, `app/layout.tsx`

- [ ] **Step 1: Implement** — client component: global `keydown` listener for Ctrl/Cmd+K (and a ⌘K button in nav); modal overlay with input; on first open, `fetch("/search-index.json")` then build a FlexSearch `Document` index (`tokenize: "forward"`, fields title/headings/body, store all); as-you-type query (limit 12), results grouped TOPIC / GLOSSARY headers, era-colored chips; Enter/click → `router.push`; Escape/overlay click closes; arrow-key selection.
- [ ] **Step 2:** Dev-check: "sandwich" → MEV topic; "cToken" → glossary + Compound. Keyboard-only flow works.
- [ ] **Step 3: Commit** — `git commit -am "feat: Ctrl+K search palette over topics and glossary"`

---

# Phase 4 — Database, Submissions, Admin, Featured

### Task 16: Drizzle schema + Neon connection

**Files:** Create: `lib/db/schema.ts`, `lib/db/index.ts`, `drizzle.config.ts`, `.env.example`

- [ ] **Step 1: Provision** — create Neon DB via Vercel Marketplace (project defigrail) → copy `DATABASE_URL` into `.env.local`; `npx vercel env pull` keeps it synced. `.env.example` lists `DATABASE_URL=`, `ADMIN_PASSWORD=`, `CRON_SECRET=`, `IP_SALT=`.
- [ ] **Step 2: `lib/db/schema.ts`** (exactly the spec §5 model + `ip_hash` for rate limiting)

```ts
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  authorName: text("author_name").notNull(),
  authorContact: text("author_contact").notNull(), // email, never displayed
  authorLink: text("author_link"),
  category: text("category").notNull(),
  bodyMd: text("body_md").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  slug: text("slug").unique(),
  ipHash: text("ip_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

export const newsCache = pgTable("news_cache", {
  source: text("source").primaryKey(), // defillama | coingecko | rss
  payload: jsonb("payload").notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
});
```

`lib/db/index.ts`:

```ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

export const db = drizzle(neon(process.env.DATABASE_URL!), { schema });
```

`drizzle.config.ts`: schema path `./lib/db/schema.ts`, dialect `postgresql`, `dbCredentials.url` from env.

- [ ] **Step 3: Push schema** — `npx drizzle-kit push` → Expected: 2 tables created. Verify: `npx drizzle-kit studio` shows them.
- [ ] **Step 4: Commit** — `git commit -am "feat: drizzle schema + neon connection"`

### Task 17: Sanitizer + slug + rate-limit libs (TDD)

**Files:** Create: `lib/sanitize.ts` + test, `lib/slug.ts` + test, `lib/ratelimit.ts` + test

- [ ] **Step 1: Failing tests**

```ts
// lib/sanitize.test.ts
import { describe, expect, it } from "vitest";
import { renderCommunityMarkdown } from "./sanitize";

describe("renderCommunityMarkdown", () => {
  it("renders headings, bold, lists, gfm tables", async () => {
    const html = await renderCommunityMarkdown("## Hi\n\n**bold** | a |\n|---|\n| b |");
    expect(html).toContain("<h2>"); expect(html).toContain("<strong>");
  });
  it.each([
    "<script>alert(1)</script>",
    '<img src=x onerror="alert(1)">',
    "[x](javascript:alert(1))",
    '<iframe src="https://evil.example"></iframe>',
    '<a href="data:text/html,boom">x</a>',
  ])("neutralizes XSS payload %s", async (payload) => {
    const html = await renderCommunityMarkdown(payload);
    expect(html).not.toMatch(/<script|onerror|javascript:|<iframe|data:text\/html/i);
  });
});

// lib/slug.test.ts — slugify("Hello, DeFi World! ") === "hello-defi-world"; truncates to 80; strips emoji
// lib/ratelimit.test.ts — hashIp("1.2.3.4") is stable hex, differs per salt; never contains raw IP
```

- [ ] **Step 2:** FAIL → **Step 3: Implement**

```ts
// lib/sanitize.ts — community markdown ONLY; raw HTML becomes inert text (no allowDangerousHtml)
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

const schema = {
  ...defaultSchema,
  tagNames: (defaultSchema.tagNames ?? []).filter(t => t !== "img"),
  protocols: { ...defaultSchema.protocols, href: ["http", "https", "mailto"] },
};

export async function renderCommunityMarkdown(md: string): Promise<string> {
  const file = await unified().use(remarkParse).use(remarkGfm)
    .use(remarkRehype).use(rehypeSanitize, schema).use(rehypeStringify).process(md);
  return String(file);
}

// lib/slug.ts
export const slugify = (t: string) =>
  t.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s-]/g, "")
   .trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);

// lib/ratelimit.ts
import { createHash } from "node:crypto";
export const hashIp = (ip: string, salt = process.env.IP_SALT ?? "") =>
  createHash("sha256").update(ip + salt).digest("hex");
```

- [ ] **Step 4:** `npm test` PASS → **Step 5: Commit** `git commit -am "feat: sanitizer, slugify, ip hashing with xss corpus tests"`

### Task 18: Submissions API (TDD on validation; route thin)

**Files:** Create: `lib/submission-schema.ts` + test, `app/api/submissions/route.ts`

- [ ] **Step 1: Failing tests for the zod schema** — valid payload passes; rejects: short title (<8), bad email, body <200 or >51200 chars, unknown category, non-empty honeypot `website` field.

```ts
// lib/submission-schema.ts
import { z } from "zod";
export const submissionInput = z.object({
  title: z.string().min(8).max(120),
  authorName: z.string().min(2).max(60),
  authorContact: z.string().email().max(120),
  authorLink: z.union([z.string().url().max(200), z.literal("")]).optional(),
  category: z.enum(["v0", "v1", "v2", "esoteric", "infra", "general"]),
  bodyMd: z.string().min(200).max(51200),
  website: z.literal("").optional(), // honeypot — humans never see/fill it
});
```

- [ ] **Step 2:** test → implement → PASS.
- [ ] **Step 3: Implement `app/api/submissions/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { and, count, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { submissionInput } from "@/lib/submission-schema";
import { hashIp } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (body && typeof body.website === "string" && body.website !== "")
    return NextResponse.json({ ok: true }); // honeypot: silent fake success
  const parsed = submissionInput.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = hashIp(ip);
  const hourAgo = new Date(Date.now() - 3600_000);
  const [{ value: recent }] = await db.select({ value: count() }).from(submissions)
    .where(and(eq(submissions.ipHash, ipHash), gt(submissions.createdAt, hourAgo)));
  if (recent >= 3)
    return NextResponse.json({ ok: false, message: "You've submitted recently — try again in an hour." }, { status: 429 });

  const { website: _hp, authorLink, ...data } = parsed.data;
  await db.insert(submissions).values({ ...data, authorLink: authorLink || null, ipHash });
  return NextResponse.json({ ok: true }, { status: 201 });
}
```

- [ ] **Step 4: Manual verify** — `npm run dev`, then POST a valid payload with curl → 201, row visible in `drizzle-kit studio`; 4th rapid POST → 429.
- [ ] **Step 5: Commit** — `git commit -am "feat: submissions API with honeypot + ip rate limit"`

### Task 19: Submit page with live preview

**Files:** Create: `app/submit/page.tsx`, `components/SubmitForm.tsx`, `app/api/preview/route.ts`

- [ ] **Step 1: Implement `SubmitForm`** (client): fields per schema + hidden `website` input (`tabIndex={-1} autoComplete="off"` in a visually-hidden div); markdown textarea left, preview pane right (debounced 500ms POST to `/api/preview` which runs `renderCommunityMarkdown` — same renderer as publication, true WYSIWYG); inline field errors from 400 responses; 429 message verbatim; success state replaces form: "Submitted — reviewed within a few days."
- [ ] **Step 2: `app/api/preview/route.ts`** — POST `{ md }` (cap 51200) → `{ html }` via `renderCommunityMarkdown`.
- [ ] **Step 3:** Component test: renders all labeled fields; submitting empty form shows validation errors; honeypot input is not visible (`aria-hidden`).
- [ ] **Step 4:** Dev-check full flow against local API. **Commit** `git commit -am "feat: submission form with sanitized live preview"`

### Task 20: Admin middleware + moderation queue + review API

**Files:** Create: `middleware.ts`, `app/admin/page.tsx`, `app/api/admin/review/route.ts`, `lib/middleware-auth.test.ts`

- [ ] **Step 1: `middleware.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };

export function middleware(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  const got = req.headers.get("authorization");
  if (expected && got === "Basic " + btoa("admin:" + expected)) return NextResponse.next();
  return new NextResponse("Authentication required", {
    status: 401, headers: { "WWW-Authenticate": 'Basic realm="DeFiGrail Admin"' },
  });
}
```

Unit-test the comparison logic by extracting `isAuthorized(header, password)` into `lib/middleware-auth.ts`: correct creds pass; wrong password, missing header, empty-env-password all fail.

- [ ] **Step 2: `app/api/admin/review/route.ts`** — POST `{ id, action: "approve" | "reject" }`; approve → `status='approved'`, `slug = slugify(title)` (append `-2`, `-3`… on unique-violation retry), `reviewedAt = now()`, then `revalidatePath("/featured")` + `revalidatePath("/featured/" + slug)`; reject → status + reviewedAt only. 404 if id unknown, 409 if not pending.
- [ ] **Step 3: `app/admin/page.tsx`** — server component (`export const dynamic = "force-dynamic"`): pending list with title/author/category/date, expandable sanitized preview (`renderCommunityMarkdown` + `dangerouslySetInnerHTML` — safe because sanitized), APPROVE / REJECT buttons posting to the review API via a small client island; toast on failure, row removal on success.
- [ ] **Step 4:** Dev-verify: basic-auth prompt fires; approve a test submission; check `/featured` revalidates (next task renders it). **Commit** `git commit -am "feat: admin moderation queue behind basic auth"`

### Task 21: Featured pages (ISR from DB)

**Files:** Create: `app/featured/page.tsx`, `app/featured/[slug]/page.tsx`

- [ ] **Step 1: Index page** — server component, `revalidate = 3600` (plus on-demand revalidation from Task 20): query approved submissions ordered by `reviewedAt` desc; card grid (title, author, category chip, date).
- [ ] **Step 2: Article page** — fetch by slug + status approved else `notFound()`; render `renderCommunityMarkdown(bodyMd)` in the same article shell as topics; byline "by {authorName}" with optional `authorLink` (`rel="nofollow noopener"`); footer disclaimer "Community contribution — not reviewed for financial accuracy."
- [ ] **Step 3:** Dev-verify the Task 20 approved row is live at `/featured/<slug>`. **Commit** `git commit -am "feat: featured community articles via ISR"`

---

# Phase 5 — News

### Task 22: Source fetchers with fixtures (TDD)

**Files:** Create: `lib/news/{defillama,coingecko,rss,aggregate}.ts`, tests, `tests/fixtures/{defillama-chains,coingecko-simple,rss-defiant}.json|xml`

- [ ] **Step 1: Capture fixtures** — `curl https://api.llama.fi/v2/chains > tests/fixtures/defillama-chains.json`; `curl "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true" > tests/fixtures/coingecko-simple.json`; save one real RSS XML.
- [ ] **Step 2: Failing tests** — each parser takes the raw fixture (injected, no network): `parseDefillama` → `{ totalTvl: number > 0, topChains: [{name, tvl}] x5 }`; `parseCoingecko` → `{ btc: {usd, change24h}, eth: {...} }`; `parseRss` (rss-parser against XML string) → `[{ title, url, source, publishedAt }]` max 15, deduped by title. `aggregate` merges three source payloads + `fetchedAt`, and tolerates any one being `null` (degraded source → key omitted, others intact).
- [ ] **Step 3:** FAIL → implement each fetcher as `fetchX(): Promise<Payload>` (network) + exported pure `parseX(raw)` (tested) → PASS.
- [ ] **Step 4: Commit** — `git commit -am "feat: news source fetchers with fixture tests"`

### Task 23: Cache routes + Vercel cron

**Files:** Create: `app/api/news/route.ts`, `app/api/news/refresh/route.ts`, `vercel.json`

- [ ] **Step 1: Refresh route (GET — Vercel Cron sends GET; spec said POST, corrected here)**

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsCache } from "@/lib/db/schema";
import { fetchDefillama } from "@/lib/news/defillama";
import { fetchCoingecko } from "@/lib/news/coingecko";
import { fetchRss } from "@/lib/news/rss";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ ok: false }, { status: 401 });
  const sources = [
    ["defillama", fetchDefillama], ["coingecko", fetchCoingecko], ["rss", fetchRss],
  ] as const;
  const results: Record<string, "ok" | "failed"> = {};
  for (const [name, fn] of sources) {
    try {
      const payload = await fn();
      await db.insert(newsCache).values({ source: name, payload, fetchedAt: new Date() })
        .onConflictDoUpdate({ target: newsCache.source, set: { payload, fetchedAt: new Date() } });
      results[name] = "ok";
    } catch { results[name] = "failed"; } // failed source keeps its stale row — spec §8
  }
  return NextResponse.json({ ok: true, results });
}
```

- [ ] **Step 2: `app/api/news/route.ts`** — GET: read all three rows, `aggregate()` them, return with each source's `fetchedAt`. If a source is >30 min stale, fire its fetch via `after()` (next/server) without blocking the response.
- [ ] **Step 3: `vercel.json`**

```json
{ "crons": [{ "path": "/api/news/refresh", "schedule": "0 * * * *" }] }
```

Set `CRON_SECRET` in Vercel env (cron invocations then carry it automatically).

- [ ] **Step 4:** Local verify: `curl -H "Authorization: Bearer $CRON_SECRET" localhost:3000/api/news/refresh` → `{ok:true, results:{...all ok}}`; `curl localhost:3000/api/news` → merged payload. **Commit** `git commit -am "feat: news cache routes + hourly vercel cron"`

### Task 24: /news page

**Files:** Create: `app/news/page.tsx`

- [ ] **Step 1: Implement** — server component (`revalidate = 900`): market strip (BTC/ETH price + 24h change colored green/red, total TVL, top-5 chains by TVL) from cache; headlines grouped by source with timestamps; visible `DATA AS OF HH:MM UTC` stamp per source (spec §7); cold-start fallback card "market data warming up" when a source row is missing (spec §8).
- [ ] **Step 2:** Dev-verify with warmed cache; also delete the rss row in studio and confirm graceful degradation. **Commit** `git commit -am "feat: news page with market strip + headlines"`

---

# Phase 6 — Landing, Error Surfaces, E2E, Launch

### Task 25: Landing page

**Files:** Modify: `app/page.tsx`; Create: `components/TopicCard.tsx`

- [ ] **Step 1: Implement `/`** — hero (kicker, headline with green accent, lede, stat chips computed from real data: topic count, track count, glossary size); `<ProtocolGraph />` with legend + hint bar; five track cards (label, era color, topic count, `<TrackProgress>`, first-topic CTA); footer (disclaimer + GitHub link).
- [ ] **Step 2:** Dev-check the full page; Lighthouse quick pass (target: no CLS from the graph — reserve height). **Commit** `git commit -am "feat: landing page with graph and track cards"`

### Task 26: Error surfaces + SEO

**Files:** Create: `app/not-found.tsx`, `app/error.tsx`, `app/learn/[slug]/not-found.tsx`, `app/sitemap.ts`, `app/robots.ts`

- [ ] **Step 1:** Terminal-styled 404 (`ERR 404 · ROUTE NOT INDEXED` + search hint + home link) and error boundary (`reset()` button). `sitemap.ts` from `loadTopics()` + static routes; `robots.ts` allowing all, pointing at sitemap, disallowing `/admin` and `/api`.
- [ ] **Step 2:** `npm run build` PASS. **Commit** `git commit -am "feat: error surfaces, sitemap, robots"`

### Task 27: Playwright E2E + launch checklist

**Files:** Create: `playwright.config.ts`, `e2e/submit-approve.spec.ts`, `e2e/search.spec.ts`, `e2e/topic.spec.ts`

- [ ] **Step 1: Config** — `webServer: { command: "npm run dev", port: 3000 }`; E2E runs locally (needs `.env.local` DB), not in CI (CI covers typecheck/lint/unit/build — spec §9).
- [ ] **Step 2: The three spec'd flows:**
  - `submit-approve`: fill `/submit` with a unique title → success message → fetch `/admin` with basic-auth credentials → approve via API → assert article live under `/featured/<slug>` with author byline.
  - `search`: open home, press Control+K, type "sandwich", click MEV result → URL is `/learn/mev`.
  - `topic`: visit `/learn/impermanent-loss` → prereq chain links to `/learn/mm-primer`; ILCurve svg present; fill calculator 2000/3000 → `-2.02%` visible.
- [ ] **Step 3:** `npm run e2e` → 3 passed.
- [ ] **Step 4: Launch checklist** — Vercel env vars set (`DATABASE_URL`, `ADMIN_PASSWORD`, `CRON_SECRET`, `IP_SALT`); cron visible in Vercel dashboard; warm `/api/news/refresh` once in prod; submit + approve one real article in prod; update README status line to "🚀 live" with the production URL.
- [ ] **Step 5: Commit + push** — `git commit -am "test: e2e flows + launch checklist" && git push`

---

## Self-Review Notes (completed)

- **Spec coverage:** §1 goals 1–7 → Tasks 4–8 (reading material/tracks/prereqs/glossary), 9–10 (charts), 11 (ambient), 18–21 (submissions), 22–24 (news), 14–15 (search), 12–13 (graph/progress). §8 error handling → Tasks 18 (429/honeypot), 22–24 (degradation), 26 (boundaries), 4 (build-fails-on-bad-frontmatter). §9 testing → unit tests throughout, component tests Tasks 5/13/19, E2E Task 27, CI Task 3.
- **Corrections vs spec:** news refresh is GET not POST (Vercel Cron constraint); `ip_hash` column added to `submissions` (required by the spec's own rate-limit requirement); `era` enum gains `ref` for the TradFi-mapping topic.
- **Type consistency check:** `loadTopics/getTopic` (Tasks 4→5→12→14), `renderCommunityMarkdown` (17→19→20→21), `hashIp` (17→18), `slugify` (17→20), chart fns (9→10) — names match across tasks.

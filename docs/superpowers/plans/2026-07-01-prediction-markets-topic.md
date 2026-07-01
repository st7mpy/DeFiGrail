# Prediction Markets Topic + NEW Badge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "Prediction Markets" Learn topic (contract mechanics + order types: market/limit/range) to the `derivatives` track, and add a reusable "NEW!" badge shown on its card in the Learn browser and on its detail page header.

**Architecture:** Content-first change following the site's existing MDX-topic pattern (frontmatter validated by a Zod schema in `lib/mdx.ts`, registered in `content/tracks.json`, rendered by `LearnBrowser.tsx` and `app/learn/[slug]/page.tsx`). Add one new optional boolean frontmatter field (`isNew`) threaded through the existing data layer, plus one new shared CSS class for the badge.

**Tech Stack:** Next.js App Router, TypeScript, Zod, gray-matter (MDX frontmatter), Vitest.

---

### Task 1: Add `isNew` to the frontmatter schema

**Files:**
- Modify: `lib/mdx.ts:10-21`
- Test: `lib/mdx.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to `lib/mdx.test.ts`, inside the existing `describe("frontmatterSchema", ...)` block (after the `"rejects bad slug chars"` test):

```ts
  it("defaults isNew to false when omitted", () => {
    expect(frontmatterSchema.parse(valid).isNew).toBe(false);
  });
  it("accepts isNew: true", () => {
    expect(frontmatterSchema.parse({ ...valid, isNew: true }).isNew).toBe(true);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- lib/mdx.test.ts`
Expected: FAIL — `isNew` is `undefined`, not `false` (property doesn't exist on the schema yet).

- [ ] **Step 3: Add the field to the schema**

In `lib/mdx.ts`, inside `frontmatterSchema` (line 10-21), add one line after `significance`:

```ts
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
  isNew: z.boolean().default(false),
});
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- lib/mdx.test.ts`
Expected: PASS (all tests in the file, including the two new ones).

- [ ] **Step 5: Commit**

```bash
git add lib/mdx.ts lib/mdx.test.ts
git commit -m "feat: add isNew flag to topic frontmatter schema"
```

---

### Task 2: Thread `isNew` through `TopicCard`

**Files:**
- Modify: `lib/topic-cards.ts:14-42`

- [ ] **Step 1: Add `isNew` to the `TopicCard` type and mapping**

In `lib/topic-cards.ts`, update the type and the `topicCards()` function:

```ts
export type TopicCard = {
  slug: string;
  name: string;
  era: string;
  track: string;
  order: number;
  significance: number;
  tradfi: string;
  tagline: string;
  summary: string;
  prereqs: string[];
  related: string[];
  isNew: boolean;
};

export function topicCards(): TopicCard[] {
  return loadTopics().map((t) => ({
    slug: t.meta.slug,
    name: t.meta.title,
    era: t.meta.era,
    track: t.meta.track,
    order: t.meta.order,
    significance: t.meta.significance,
    tradfi: t.meta.tradfiAnchor ?? "",
    tagline: t.meta.summary,
    summary: t.meta.summary,
    prereqs: t.meta.prereqs,
    related: t.meta.related,
    isNew: t.meta.isNew,
  }));
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors (this task has no dedicated test file — `topic-cards.ts` is a thin mapping already covered indirectly by the build; typecheck is the verification gate here).

- [ ] **Step 3: Commit**

```bash
git add lib/topic-cards.ts
git commit -m "feat: expose isNew on TopicCard"
```

---

### Task 3: Add the `.new-badge` CSS class

**Files:**
- Modify: `app/globals.css` (add near the existing `.topic-row`/`.topic-era-tag` rules, e.g. after line 213)

- [ ] **Step 1: Add the badge style**

Insert after the `.topic-check.done{...}` rule (line 213) in `app/globals.css`:

```css
.new-badge{font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:600;background:#1a1813;color:#efeadd;border-radius:100px;padding:3px 8px;flex:none;white-space:nowrap}
```

This matches the site's existing monochrome ink/paper palette (same colors as `.topic-check.done`) — no new accent color introduced.

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "feat: add .new-badge style for NEW! topic markers"
```

---

### Task 4: Show the badge in the Learn browser card

**Files:**
- Modify: `components/learn/LearnBrowser.tsx:46-62`

- [ ] **Step 1: Render the badge in `.topic-row`**

In `components/learn/LearnBrowser.tsx`, update the `topic-row` block (inside the `track?.topics.map(...)` render) to add the badge between `topic-info` and the checkbox button:

```tsx
              <div key={t.slug} className="topic-row" onClick={() => router.push(`/learn/${t.slug}`)}>
                <span className="topic-glyph"><Glyph era={t.era} size={14} /></span>
                <div className="topic-info">
                  <div className="topic-name">{t.name}</div>
                  <div className="topic-tagline">{t.tagline}</div>
                  {t.tradfi && <div className="topic-tradfi">TradFi: {t.tradfi}</div>}
                </div>
                {t.isNew && <span className="new-badge">New!</span>}
                <button
                  className={`topic-check${done ? " done" : ""}`}
                  title="Mark as read"
                  onClick={(e) => { e.stopPropagation(); toggle(t.slug); }}
                >
                  {done ? "✓" : ""}
                </button>
              </div>
```

- [ ] **Step 2: Manual check**

Run: `npm run dev`, open `/learn?track=derivatives` once Task 6 has added the topic — badge should appear top-right of the Prediction Markets row (verified in Task 6's manual check, since the topic doesn't exist yet at this point). For now just confirm the component compiles.

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/learn/LearnBrowser.tsx
git commit -m "feat: show NEW! badge on new topic rows in Learn browser"
```

---

### Task 5: Show the badge on the topic detail page header

**Files:**
- Modify: `app/learn/[slug]/page.tsx:53-56`

- [ ] **Step 1: Wrap the era tag in a space-between row with the badge**

In `app/learn/[slug]/page.tsx`, replace:

```tsx
        <div className="topic-era-tag">
          <Glyph era={topic.meta.era} size={10} />
          {ERA_LABELS[topic.meta.era] ?? topic.meta.era}
        </div>
```

with:

```tsx
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="topic-era-tag">
            <Glyph era={topic.meta.era} size={10} />
            {ERA_LABELS[topic.meta.era] ?? topic.meta.era}
          </div>
          {topic.meta.isNew && <span className="new-badge">New!</span>}
        </div>
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add app/learn/[slug]/page.tsx
git commit -m "feat: show NEW! badge on topic detail page header"
```

---

### Task 6: Write the Prediction Markets content and register it

**Files:**
- Create: `content/topics/prediction-markets.mdx`
- Modify: `content/tracks.json:10` (the `derivatives` line)

- [ ] **Step 1: Create the content file**

Create `content/topics/prediction-markets.mdx`:

```mdx
---
title: "Prediction Markets"
slug: "prediction-markets"
era: "v2"
track: "derivatives"
order: 3
prereqs: ["order-books-and-exchanges", "understanding-liquidity"]
related: ["perpetual-futures", "defi-options", "dex-aggregators"]
tradfiAnchor: "Futures on events, not prices — Iowa Electronic Markets, Intrade"
summary: "Markets that price the probability of a future event directly — outcome shares, resolution, and the order types used to trade them."
significance: 15
isNew: true
---

## 01 · Concept — what problem does it solve?

How do you turn scattered opinions about an uncertain future event — who wins an election, whether a protocol gets exploited, whether a macro print beats consensus — into a single, tradeable number? A **prediction market** lets anyone buy and sell shares tied to a yes/no outcome; the share's price *is* the market's collective probability estimate. Unlike a poll, participants back their opinion with capital, which tends to make the price more accurate than punditry — the same "wisdom of crowds" logic that makes order books good at pricing stocks now applies to discrete real-world events.

## 02 · Mechanics

- **Outcome shares:** a binary market has two complementary tokens, YES and NO. Depositing $1 of collateral **mints** one YES + one NO (a "complete set"). At resolution, the winning share redeems for $1 and the losing share for $0.
- **Split / merge:** anyone can split $1 into 1 YES + 1 NO, or merge 1 YES + 1 NO back into $1, at any time before resolution. This is a hard arbitrage constraint: `price(YES) + price(NO)` can never drift far from $1, or arbitrageurs mint/merge to capture the gap.
- **Resolution:** someone has to report what actually happened. On-chain venues typically use an **optimistic oracle** (e.g. UMA) — a proposer posts the outcome, a dispute window opens, and unresolved disputes escalate to a token-holder vote — or a simpler admin/multisig resolver for lower-stakes markets. This is the step with no on-chain source of truth to fall back on, unlike an [oracle](/learn/oracles) price feed.
- **Order types:**
  - **Market order** — fill immediately at the best resting price; guarantees a fill, not a probability. Takes liquidity, same as any [order book](/learn/order-books-and-exchanges).
  - **Limit order** — post a resting order at a chosen probability, e.g. "buy YES at 34¢" (34% implied odds); it only fills if the market trades down to meet it. Provides liquidity while you wait.
  - **Range order** — rather than one price, commit collateral across a probability band (e.g. 30¢–45¢), auto-quoting resting bids and asks throughout that range. This is the prediction-market analogue of Uniswap v3 concentrated liquidity: you earn the spread on trades that occur inside your range, but if the price exits the range your position stops earning and needs manual rebalancing.
  - **AMM / LMSR alternative:** older designs (Augur, Gnosis) skip the order book entirely and price against a **market-scoring-rule** curve, which always quotes both sides but charges more price impact on size than a deep order book would.

## 03 · Formulas

```text
// no-arbitrage constraint between complementary shares
price(YES) + price(NO) ≈ $1

// price *is* the implied probability
price(YES) = P(YES resolves true)

// payout at resolution
winning share → $1        losing share → $0

// LMSR cost function (Hanson's market scoring rule) for outcome shares q_i
C(q) = b · ln( Σ e^(q_i / b) )
price_i = e^(q_i / b) / Σ e^(q_j / b)
   // b = liquidity parameter — larger b means deeper book, smaller price impact per trade
```

## 04 · Edge cases & risks

- **Resolution disputes:** ambiguously worded questions or contested real-world outcomes can leave a market frozen for days while an optimistic-oracle dispute plays out — capital is locked with no price discovery in the meantime.
- **Thin long-tail markets:** niche questions often have wide spreads and shallow books; limit and range orders can sit unfilled indefinitely, and a market order can move price sharply on modest size.
- **Manipulation near resolution:** because the price is read as "the market's odds," a large trade just before close can distort the *perceived* probability even if it doesn't change the underlying event — a risk for anyone citing the price as a signal rather than just trading it.
- **Regulatory status varies by jurisdiction:** event-contract venues have faced different regulatory treatment (e.g. CFTC actions, geofencing, or a path through registered exchanges) — availability and legal status differ by country and by venue.
- **No arbitrage against reality:** a mispriced perp can be arbitraged against spot instantly; a mispriced prediction market can only be corrected once the real-world event resolves, so the price can stay "wrong" for the market's entire duration.
```

- [ ] **Step 2: Register it in the derivatives track**

In `content/tracks.json`, change line 10 from:

```json
  "derivatives":    { "label": "Derivatives",         "era": "v2",        "topics": ["perpetual-futures", "defi-options"] },
```

to:

```json
  "derivatives":    { "label": "Derivatives",         "era": "v2",        "topics": ["perpetual-futures", "defi-options", "prediction-markets"] },
```

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS — in particular `lib/mdx.test.ts` ("every prereq/related slug resolves") and `lib/tracks.test.ts` ("all track topic slugs resolve") both implicitly validate the new file and its registration.

- [ ] **Step 4: Build the site**

Run: `npm run build`
Expected: succeeds — `loadTopics()` runs `frontmatterSchema.parse()` on every `.mdx` file at build time and throws on any mismatch (per `lib/mdx.ts:33`), so a clean build confirms the frontmatter is valid and the slug/filename match.

- [ ] **Step 5: Commit**

```bash
git add content/topics/prediction-markets.mdx content/tracks.json
git commit -m "content: add Prediction Markets topic to derivatives track"
```

---

### Task 7: Manual verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Check the Learn browser**

Open `/learn?track=derivatives`. Confirm:
- "Prediction Markets" appears as the third row, after Perpetual Futures and DeFi Options.
- A dark "NEW!" pill shows at the right edge of its row; the other two rows have no badge.

- [ ] **Step 3: Check the detail page**

Open `/learn/prediction-markets`. Confirm:
- The "NEW!" pill appears top-right, aligned with the era tag row, above the headline.
- All four content sections render, the order-types bullets and formulas block are readable, and the `order-books-and-exchanges` / `understanding-liquidity` prerequisite chips link correctly.
- The "Connected concepts" chips (`perpetual-futures`, `defi-options`, `dex-aggregators`) render and link correctly.

- [ ] **Step 4: Stop the dev server**

Kill the `npm run dev` process once verified.

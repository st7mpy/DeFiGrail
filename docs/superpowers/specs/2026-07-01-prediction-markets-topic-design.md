# Prediction Markets learning topic + "NEW!" badge

## Goal

Add a new Learn topic, "Prediction Markets," covering how prediction-market contracts work (outcome shares, resolution, LMSR/CLOB market-making) and order types (market, limit, range). Mark it visibly as new content.

## Content

New file `content/topics/prediction-markets.mdx`, following the site's fixed frontmatter + 4-section template (see `content/topics/perpetual-futures.mdx` for the reference shape).

Frontmatter:
- `title`: "Prediction Markets"
- `slug`: "prediction-markets"
- `era`: "v2"
- `track`: "derivatives"
- `order`: 3 (after `perpetual-futures` [1], `defi-options` [2])
- `prereqs`: ["order-books-and-exchanges", "understanding-liquidity"]
- `related`: ["perpetual-futures", "defi-options", "dex-aggregators"]
- `tradfiAnchor`: a short TradFi analogue (polling/futures-on-events)
- `summary`: one-line summary, 10-300 chars
- `significance`: 15
- `isNew`: true

Body sections (matching the established template — `## 01 ·` through `## 04 ·`):
1. **Concept** — what problem prediction markets solve: aggregating dispersed beliefs into a single probability-denominated price.
2. **Mechanics** — binary outcome shares (YES/NO tokens settling to $1/$0), minting via split/merge of complete sets, resolution (optimistic oracles like UMA, centralized resolvers), and the two market-making designs in use (Polymarket-style hybrid CLOB vs. Augur-style AMM/LMSR).
3. **Order types** — market orders, limit orders (rest at a chosen probability), and range orders (providing two-sided liquidity across a probability band — conceptually parallel to Uniswap v3 concentrated liquidity), each with a concrete example.
4. **Formulas** — price-as-probability identity, LMSR cost function, payout math.
5. **Edge cases & risks** — resolution/oracle disputes, thin liquidity on long-tail markets, regulatory status, manipulation near resolution.

## Schema & data changes

- `lib/mdx.ts`: add `isNew: z.boolean().optional().default(false)` to `frontmatterSchema`.
- `lib/topic-cards.ts`: add `isNew: boolean` to the `TopicCard` type and populate it from `t.meta.isNew` in `topicCards()`.
- `content/tracks.json`: append `"prediction-markets"` to the `derivatives` track's `topics` array.

## "NEW!" badge

Shown in both places the user encounters the topic:

- `components/learn/LearnBrowser.tsx`: a small uppercase pill in the top-right of the `.topic-row` for any topic where `t.isNew` is true.
- `app/learn/[slug]/page.tsx`: the same pill in the top-right of the topic detail header, shown when `topic.meta.isNew` is true.

Styling: a new `.new-badge` CSS rule in `app/globals.css` — solid ink-filled pill (`background:#1a1813; color:#efeadd`), uppercase, small letter-spacing — consistent with the site's existing monochrome ink/paper palette and the `.status-badge` pattern already in use. No new accent colors are introduced.

## Out of scope

- No expiry/auto-removal logic for the "NEW!" flag — it's a manual boolean an author unsets later, matching the site's existing content-authoring workflow (no automation elsewhere in `content/topics/*.mdx`).
- No changes to the quiz, glossary, or graph views.

# DeFiGrail — gap analysis, caveat system, learner features

*2026-09-06. Benchmarked against [quantmemo.com](https://quantmemo.com). Every dollar
figure and date below is from memory — run `/iosg-factcheck` before any of it ships.*

**Where you are:** 50 topics · ~21,500 words · 12 subject tracks · 74 glossary terms ·
20 quiz questions · 5 charts · graph · news · submissions.
**Where QuantMemo is:** 159 topics · 124 lessons · 5,170 concepts · 6 *persona* roadmaps ·
~4,400-question bank · 22 tools · a daily edition on issue #614 · accounts.

The gap is not 100 topics. It is **depth per topic, verifiability, and a reason to come
back tomorrow**. Read the whole doc with that as the thesis.

---

## Part 1 — Content gaps

Verified by grep: these terms appear in passing across topics but have no home. A learner
who searches for them finds nothing.

### Tier 1 — structural holes (a learner hits a wall without these)

| # | Topic | Why it's load-bearing | Track |
|---|---|---|---|
| 1 | **Gas & the fee market** | Appears in 15 of 50 topics, taught in none. EIP-1559 base fee/burn, priority fee, calldata cost, why L2 fees differ. Liquidations, MEV and bots are all *unreadable* without it. | Markets 101 |
| 2 | **Rollups & L2s** | Your own TVL ticker lists Base and Arbitrum; the site never says what they are. Optimistic vs ZK, sequencers, DA, the 7-day exit, forced inclusion. Distinct from `bridges` — a canonical rollup bridge is not a third-party bridge, and conflating them is the single most common learner error. | Infrastructure |
| 3 | **Anatomy of an exploit** | "hack" appears in 20 topics as an aside. No topic teaches the *mechanism*: reentrancy, oracle manipulation, ERC-4626 donation/first-depositor, rounding, access control, proxy upgrade, admin keys and timelocks. Highest learner demand in the whole space. | Ecosystem |
| 4 | **Where does yield come from?** | The one question every learner actually has, and the best BS-detector you could ship. A taxonomy: trading fees, token emissions, funding rate, staking issuance, lending spread, MEV rebate, basis carry, and "the next depositor". `yield-vaults` describes the wrapper, not the source. | Esoteric or Ecosystem |
| 5 | **Yield-bearing dollars / Ethena** | Ethena is a top-5 protocol by size and is mentioned twice in passing. A perfect teaching object: delta-neutral basis trade, funding carry, negative-funding risk, and why sUSDe is not a stablecoin. | Stablecoins |
| 6 | **Uniswap v4 & hooks** | "Modern Frontier" ends at v3. Singleton PoolManager, flash accounting, hooks, ERC-6909. The site's most visible staleness. | Frontier |
| 7 | **Token approvals & the drainer** | `approval`/`permit` show up in 5 topics as vocabulary. Infinite approvals, Permit2, revoking, signature phishing. This is the mechanism behind most retail losses, and the one page a reader will actually thank you for. | Markets 101 / new Safety track |
| 8 | **Curve wars & vote markets** | `curve-stableswap` exists; the veCRV/Convex/bribe flywheel — the most-studied incentive design in DeFi — does not. Also the cleanest example of "governance is a market". | Composability |

### Tier 2 — depth holes

9. **Solana / non-EVM DeFi** — the whole curriculum is EVM-shaped; Solana appears once, inside `bridges`. On-chain CLOBs, Jupiter, JitoSOL, local fee markets.
10. **Intents & solvers** — CoW Swap, UniswapX, 1inch Fusion. Your *own* top featured community post is about intents. That is a demand signal you're not serving. Distinct from `dex-aggregators`.
11. **On-chain analytics: verify it yourself** — zero mentions of Etherscan or Dune anywhere in 50 topics. Reading a transaction trace, a DefiLlama TVL definition, a Dune query. Converts a reader into someone who can check you.
12. **Regulation & the compliance surface** — MiCA, sanctions/OFAC, why front-ends geo-block, KYC'd pools, the Tornado precedent. Universally asked, almost never covered by DeFi curricula.
13. **DeFi taxes & accounting** — cost basis on an LP position, wrapping as a taxable event, income vs capital. High search intent, near-zero supply.
14. **Points, airdrops & mercenary capital** — the actual driver of user behaviour since 2023. Farming ROI, sybil, TGE mechanics, why TVL is a rented number.
15. **Token valuation** — P/S on protocol fees, fee switches, dilution schedules, what "revenue" means on-chain.
16. **Privacy** — mixers, encrypted mempools, ZK identity, the compliance tension.
17. **Systemic risk & reflexivity** — liquidation cascades, correlated collateral, why the whole system deleverages at once. `liquidations` is single-position; this is the market view.
18. **Position sizing & risk-adjusted yield** — APR vs APY vs realized, drawdown, correlation across "uncorrelated" farms.

### The biggest single hole: a **post-mortems track**

QuantMemo's spine is landmark *papers*. DeFiGrail's equivalent is landmark **failures** — and
it is the most engaging content in this entire field. Eight case studies, each one a
mechanism you already teach, broken in public:

| Case | Teaches | Ties to |
|---|---|---|
| MakerDAO Black Thursday (Mar 2020) | zero-bid auctions, gas as a liveness assumption, ~$8.3M unbacked DAI | `liquidations`, `makerdao` |
| Terra / UST (May 2022) | reflexive mint-burn pegs, the death spiral | `algorithmic-stablecoins` |
| Beanstalk (Apr 2022) | flash-loan governance capture | `dao-governance` |
| Mango Markets (Oct 2022) | oracle manipulation on thin books | `oracles`, `perpetual-futures` |
| Euler (Mar 2023) | donation/health-check logic, and the $197M that came back | `euler` — you have the protocol, not the lesson |
| USDC depeg (Mar 2023) | backing ≠ peg when redemption is shut for a weekend | `stablecoin-design` |
| Curve Vyper reentrancy (Jul 2023) | your risk is your compiler | new *anatomy of an exploit* |
| Wormhole / bridge class (Feb 2022) | wrapped assets are a claim on a bridge | `bridges` |

This is also your best SEO surface: highest intent, lowest competition, and it is the
content people share.

### Two missing *tracks*, not topics

- **Safety / "your first transaction"** — wallet setup, the safe first swap, approvals and revoking, simulating a tx, spotting a drainer, hardware wallets. `wallets-and-keys` teaches keys; nothing teaches *not getting robbed*. This is the highest-utility content on any DeFi site and you have none of it.
- **Coming from TradFi** — see Part 4; you already have the metadata for it.

---

## Part 2 — The caveat system

This is where QuantMemo is furthest ahead, and it is cheap to close.

**What their lesson does that yours doesn't.** Their CLT page runs: abstract that names the
misuse up front → prerequisites → formal statement → **pull-out callout** → interactive
figure with caption → proof sketch → **"when it applies"** (Lindeberg/Lyapunov) →
**"the rate"** (Berry–Esseen: how wrong it is at finite n) → **worked example with real
arithmetic** → second callout → **"failure modes and subtleties"** (4 named modes) →
**"the dangerous misuse"** highlighted → **"in interviews"** → discussion → related →
practice questions → **further reading with real citations**.

Yours runs: concept → mechanics → formulas → edge cases. Good skeleton, ~370 words, one
undifferentiated bullet list of risks, no worked example, no citations, no as-of date.

**Ship one component, not seven.** `<Caveat kind="...">` with five kinds:

```tsx
// components/topic/Caveat.tsx — one component, kind drives the label + glyph
<Caveat kind="misuse">…</Caveat>   // the thing people get wrong
<Caveat kind="breaks">…</Caveat>   // the assumption that fails
<Caveat kind="real">…</Caveat>     // when it cost real money, with a date + number
<Caveat kind="stale" asOf="2026-09-06" src="https://…">…</Caveat>  // params drift
<Caveat kind="check">…</Caveat>    // how to verify this yourself, on-chain
```

`kind="stale"` is the one no competitor has and the one your README already gestures at
("protocol parameters drift; verify before use"). Move that from a site footer to the
individual claim. `kind="check"` is the one that turns a reader into an analyst.

### 15 caveats to paste in, by topic

**uniswap-v2**
- *misuse* — x·y=k does not mean the pool *sets* a price. The pool is a passive quoting function; arbitrageurs move it. The pool is always the last to know.
- *breaks* — k is only constant in the fee-free idealisation. With the 0.30% fee, reserves after every swap satisfy k′ ≥ k — the invariant grows, and that growth *is* the LP fee.
- *breaks* — fee-on-transfer and rebasing tokens silently break pair accounting. This is why Uniswap's own docs warn against them.

**impermanent-loss**
- *misuse* — "Impermanent" is marketing. If you withdraw at a diverged price, the loss is realised and permanent. It is impermanent only if price returns *and* you are still in the pool.
- *breaks* — the formula prices divergence against a HODL baseline and ignores both the fees you earned and the mechanism: arbitrageurs, not price. LVR (loss-versus-rebalancing) prices what arbitrageurs actually take per block, and it is larger.
- *check* — IL is symmetric in the price *ratio*: 2× up and 2× down both cost ≈5.72%. If your intuition says otherwise, re-derive 2√r/(1+r) − 1.

**uniswap-v3**
- *misuse* — "~4000× capital efficiency" is the number for a ±0.05% band that essentially never holds outside a stable pair. Efficiency and time-in-range trade off directly; there is no free multiplier.
- *breaks* — a quoted v3 fee APR assumes price stays in range. Out of range is 0% and 100% of one asset. Always ask what fraction of the window the position was actually in range.

**interest-rate-models**
- *stale* — base 2% / kink 80% / slopes 10% and 75% are illustrative. Aave and Compound have re-parameterised these repeatedly, per asset, by governance vote. Link the live params.
- *misuse* — utilisation near 100% is not insolvency. It means withdrawals are blocked until the rate pulls new supply in. Illiquidity ≠ insolvency, and conflating the two is how an on-chain bank run starts.

**liquidations**
- *breaks* — liquidation does not happen at the liquidation threshold. It happens when a bot finds it profitable after gas and slippage on the seized collateral. Bad debt lives in that gap.
- *real* — Black Thursday, 12 Mar 2020: gas spiked, one keeper bid, Maker auctions cleared near zero and left roughly $8.3M of DAI unbacked, recapitalised by an MKR auction. The liquidation engine was correct; the liveness assumption wasn't.

**oracles**
- *breaks* — a TWAP is not manipulation-proof; it converts manipulation into a *financing* problem. The cost is the capital needed to hold price off for the window, and deep borrow markets make that rentable.
- *misuse* — a Chainlink feed with a heartbeat and a deviation threshold is stale *by design* up to that threshold. It is not a live price, and the gap is exactly where the exploit sits.

**stablecoin-design**
- *misuse* — a peg is not held by the design doc; it is held by whoever can redeem at par. Ask: who can redeem, for what, in what size, on which day? If the answer is "nobody, but there's an arb incentive", it is a confidence peg.
- *real* — USDC, 11 Mar 2023: ~$3.3B of reserves stranded at SVB, USDC traded to ~$0.87 despite being fully backed. Backing is not a peg when redemption is closed for a weekend.

**perpetual-futures**
- *misuse* — funding is not a protocol fee; it is a transfer between longs and shorts. And it does not force convergence — it makes divergence expensive to hold.

**restaking**
- *breaks* — restaking does not reuse security for free; it *correlates* slashing. The same capital backing n services means one incident is a solvency event for all n.

**mev**
- *misuse* — a private RPC does not remove MEV, it changes who captures it. You have swapped a public auction for a bilateral relationship with one builder.

**bridges**
- *breaks* — a wrapped asset is a claim on a bridge's solvency, not the asset. wBTC is a custodian's IOU; bridged USDC on a rollup is that rollup's escrow. The peg holds until the custodian or the contract doesn't.

**every topic, once**
- *check* — the "verify this yourself" line: the Etherscan read call, the DefiLlama page, or the Dune query that confirms the number in the paragraph above.

### Three more structural borrowings from QuantMemo

1. **A worked example with real arithmetic in every topic.** Their CLT page runs a 100-position book end to end with actual numbers. Your topics state formulas and never solve one. This is the largest single quality delta and it costs one paragraph per topic.
2. **`sources` in frontmatter → a "Primary sources" block.** Whitepaper, docs, the audit, the post-mortem. You currently cite nothing, on a subject where everything is public and checkable. This is a credibility miss, not a nice-to-have.
3. **`lastVerified` in frontmatter, rendered.** DeFi content rots in months. Showing the date is a trust signal *and* a maintenance queue.

---

## Part 3 — Inside the learner's head

The honest journey, and where the site drops them.

**"There are 12 tracks. Which one is me?"** → You have subject tracks; QuantMemo has *persona*
roadmaps ("Starting From Scratch", "Switching From Software or Science", "Trading Your Own
Money"). A learner who has to self-diagnose bounces.
**Feature — placement quiz.** 10 questions → "start here". Your `quiz.json` items already
carry a `topic` field, so wrong answers map to slugs for free. Cheapest high-impact feature on this list.

**"I read it, I nodded, I retained nothing."** → `MarkAsRead` is self-reported honesty.
**Feature — a 2–3 question check at the end of every topic**, and "read" only turns green when
you pass. Same `topic` field, one filter. Biggest retention ROI on the site.

**"I read that three weeks ago and it's gone."** → No review mechanic exists.
**Feature — spaced repetition over the question bank.** "Review 5" resurfaces what you got
wrong at widening intervals. localStorage is enough; you already use it for progress.

**"Why would I come back tomorrow?"** → You have *zero* return mechanics. QuantMemo is on
daily edition #614.
**Feature — DeFi Daily.** One concept, one question, one live on-chain number, one headline.
You already have the news + market pipeline built; this is mostly assembly. This is the
single highest-leverage thing on the roadmap because it converts a library into a habit.

**"Is this still true?"** → Nothing on the page says when it was written or checked.
**Feature — `lastVerified` badge + a live-params strip** on parameter-heavy topics, pulled from
your existing fetch layer. No other DeFi learning site can do this. It is your moat.

**"I follow the formula but not the money."** → The playground charts are abstract toys.
**Feature — three real pools hardcoded in the IL tool.** "USDC/ETH 0.05%: your $10k, this
range, these fees, break-even in N days." Do *not* build an address parser first.

**"I want to try it without losing money."** → Nothing to do, only to read.
**Feature — a liquidation simulator.** Pick collateral, LTV, a price path; find out if you get
liquidated and what the penalty costs. One chart component, no chain, no wallet. This is your
version of their market-making game, and the lazy v1 is a day's work.

**"Am I getting better?"** → The homepage says `0 / 50 READ` and nothing else.
**Feature — a progress surface**: topics read, quiz accuracy, streak, weakest track. Their
homepage shows exactly this and it is why people log in.

**"This is a wall of text."** → Your *playground* has plain-English `layman` copy for every
chart. Your *topics* don't.
**Feature — a `<Layman>` block per topic**, collapsed by default. You already write this voice
well; you're just not shipping it where the reading happens. It is also literally your
tagline ("DeFi, For Everyone").

**"I have a question and nobody to ask."** → QuantMemo has per-concept discussion with posted
rules. You have a submissions table and a moderation queue already built — extend them.

**"I searched 'why did my LP lose money' and got nothing."** → ⌘K covers titles + glossary
only. Learners search *symptoms*, not topic names. Index the topic bodies at build time.

**"Where do I go next, in the real world?"** → **Feature — one "now do this" action per topic**:
a testnet swap, a contract to open on Etherscan, a Dune dashboard. Reading → skill.

**"Can I show anyone I did this?"** → **Feature — a shareable score card / OG image** per track
completion. Skip certificates and on-chain attestations; the image is 90% of the value.

---

## Part 4 — Product lead's read

**1. The asset you built and never used: `tradfiAnchor`.**
It's on every topic. It's in your headline. There is no surface that indexes by it. Build
**"You know X? Then read Y"** — a reverse index from TradFi instrument to DeFi topic, plus a
*Coming from TradFi* roadmap that orders existing topics by anchor. Nearly free from existing
frontmatter, it is your only true differentiator against every other DeFi wiki, and it is the
best SEO surface you have ("defi equivalent of a repo", "crypto version of a bond").

**2. You built a library. QuantMemo built a habit.**
Library = one visit, high bounce, no reason to return. Their retention stack is daily edition +
question bank + streaks + tools + accounts. Yours is a localStorage progress bar. **Build the
Daily before you write topic #51.**

**3. Don't race them on volume — you will lose, and it's the wrong game.**
They have 5,170 concepts. You have 21,500 words total. Take the **12 topics that carry the
site** (uniswap-v2/v3, impermanent-loss, lending-borrowing, liquidations, oracles,
stablecoin-design, mev, perpetual-futures, restaking, bridges, yield-vaults) from ~370 words to
QuantMemo depth — worked example, failure modes, a real post-mortem, primary sources — instead
of adding twenty more 370-word stubs. Depth is a moat; breadth is a treadmill. Also: 370-word
pages will never rank, so the current breadth isn't even buying you traffic.

**4. Your unfair advantage is verifiability, and you're not using it.**
Quant finance content cannot be checked live. DeFi can. *"Every number on this page has an
as-of date and a link to the live source"* is a positioning claim nobody in this category can
copy, and it doubles as the thing that stops your site rotting. `kind="stale"` +
`kind="check"` + `lastVerified` is the whole implementation.

**5. Distribution: post-mortems are the wedge.**
Highest search intent, lowest competition, most shareable, and each one reinforces a mechanism
you already teach. If you write one content block this quarter, write that track.

**6. The community pipeline is dark.**
Submissions, moderation and featured pages all exist; three pieces have shipped and there's no
contributor incentive. Either give it a reason to run — a public bounty list of the unwritten
topics above, contributor credit on the graph, "most-read this month" — or stop maintaining it.

**7. Name the goal, because it changes the roadmap.**
Portfolio piece → depth and polish on 12 topics, ship the TradFi index, done. Audience play →
Daily + post-mortems + a newsletter. Product → accounts, progress, spaced repetition. Right now
the codebase is hedging across all three.

### Ship order

| # | Thing | Effort | Why first |
|---|---|---|---|
| 1 | `<Caveat>` component + the 15 caveats above | hours | Quality delta, zero new infra |
| 2 | Per-topic check questions (reuse `quiz.topic`) | hours | Retention ROI, field already exists |
| 3 | `sources` + `lastVerified` frontmatter, rendered | hours | Credibility + maintenance queue |
| 4 | "Coming from TradFi" index from `tradfiAnchor` | hours | Your differentiator, already in the data |
| 5 | DeFi Daily | ~1 day | Converts library → habit |
| 6 | Post-mortems track (8 case studies) | content week | SEO + shareability + depth |
| 7 | Liquidation simulator | ~1 day | Your market-making game |
| 8 | Depth pass on the 12 core topics | ongoing | The actual moat |

### Explicitly skip for now

Accounts and auth · wallet-connect / on-chain anything · an Atlas-style map (your graph
already is one) · 20 more topics · a CMS · certificates or on-chain attestations · a mobile
app. None of them beat items 1–8 on impact per hour.

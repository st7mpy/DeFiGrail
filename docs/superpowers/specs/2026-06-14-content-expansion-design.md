# DeFiGrail — Comprehensive Content Expansion

**Date:** 2026-06-14 · **Status:** Approved, building

## Goal
Make DeFiGrail the most comprehensive DeFi learning hub: a full ladder from
zero-knowledge basics through protocol architecture to frontier topics. Adds
~19 topics across 2 new tracks + 3 extended, taking the platform from 32→~51
topics and 10→12 tracks. Researched via parallel research subagents per domain.

## Approach
Content-only — rides the existing MDX pipeline (frontmatter auto-wires into
tracks.json, the protocol graph, glossary auto-linking, search, prereq chains).
One new chart component (`PriceImpact`). No infra/schema changes.

## New & extended content

**NEW TRACK · Markets 101** (zero-knowledge basics; leads track order)
- what-is-money, what-is-a-stock, order-books-and-exchanges, what-is-a-blockchain,
  wallets-and-keys, tokens-and-standards, crypto-vs-stocks (TradFi↔crypto bridge)

**EXTEND · Lending & Borrowing** (monolithic vs modular)
- monolithic-vs-modular-lending, aave-architecture (v3 monolithic + isolation/eMode,
  v4 modular hub-and-spoke), morpho (Morpho Blue isolated markets + vault layer)

**EXTEND · Liquidity** (how liquidity affects pricing)
- liquidity-and-pricing (depth → price, price discovery), amm-pricing-math
  (bonding curves, marginal price); new `PriceImpact` chart

**NEW TRACK · Ecosystem & Frontier**
- rwa, dao-governance, yield-vaults, account-abstraction (ERC-4337),
  defi-risk-taxonomy (capstone)

Plus ~15 glossary terms. Every topic uses the standard four-layer body
(concept → mechanics → formulas → edge cases) with a TradFi anchor.

## Execution
1. Dispatch 4 parallel research subagents (Markets 101 / Lending architectures /
   Liquidity & pricing / Ecosystem & frontier) → current facts + figures + sources.
2. Synthesize each brief into MDX topics (author for format + MDX-safety consistency).
3. Integrate: tracks.json, glossary.json, prereq/related wiring, `PriceImpact` chart.
4. Verify: tsc + tests (update track-count assertions) + full build; fix MDX issues.
5. Deploy production checkpoint; sweep new routes for 200s.

## Integration invariants
- Every prereq/related slug must resolve (loadTopics test enforces).
- era ∈ {v0,v1,v2,esoteric,infra,ref}; track must match a tracks.json key.
- MDX-safety: no bare `<word`, no bare `{}`, no HTML comments; formulas in ```text fences.
- Update the two hard-coded counts in lib/tracks.test.ts when track count changes.

# Hero / Prereqs / Quiz / Playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship four incremental features on the DeFiGrail platform — a cohesive hero pixel-assembly, prerequisite backfill, a standalone `/quiz`, and layperson context in the playground.

**Architecture:** Next.js 16 App Router. Hero is a client canvas component crossfading to a real `<h1>`. Prereq rendering already exists — this is a content backfill of `prereqs` frontmatter. Quiz is a server page wrapping a client stepper fed by a static JSON, validated by a Vitest test against the topic loader. Playground gains a two-column body per tool.

**Tech Stack:** TypeScript, React client components, Canvas 2D, Tailwind v4 + `app/globals.css`, MDX frontmatter (gray-matter + zod), Vitest.

**Key discovery (read before starting):** The prerequisites UI is ALREADY built in `app/learn/[slug]/page.tsx` (lines 66–78, `.prereq-chip` links) with CSS at `app/globals.css:231-235`. 30 of 49 topics already have non-empty `prereqs`. Task 2 is therefore a **content backfill** of the non-root topics that are missing them — NOT new rendering.

**Model note:** All code edits and their git commits run on Sonnet 4.6.

---

### Task 1: Make the hero pixel-assembly cohesive

**Files:**
- Modify: `components/home/HeroPixels.tsx` (full body replace)
- Verify only (no change expected): `app/globals.css:142-149` (`.hero-pixels` rules)

Root cause: 5px grid / 4px squares leave gaps (dots, not letters); alpha cutoff `>130` drops anti-aliased edges; `fillText` ignores the h1's `-0.035em` letter-spacing. Fix: finer seamless grain (`step=4, sz=4`), lower cutoff (`>90`), match `ctx.letterSpacing`, assemble particles rising from below, and draw a crisp `fillText` on the final frame before crossfade.

- [ ] **Step 1: Replace `components/home/HeroPixels.tsx` with this exact content**

```tsx
"use client";
import { useEffect, useRef } from "react";

// Hero headline that assembles from scattered pixels on load, then crossfades
// to the crisp DOM <h1> (kept for SEO/a11y). Falls back to a plain fade on
// reduced-motion or narrow viewports.
export default function HeroPixels({ text }: { text: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current, cv = canvasRef.current, h1 = h1Ref.current;
    if (!wrap || !cv || !h1) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const reveal = () => wrap.classList.add("revealed");
    if (reduced || window.innerWidth < 640) { reveal(); return; }

    let raf = 0;
    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      const wrapRect = wrap.getBoundingClientRect();
      const rect = h1.getBoundingClientRect();
      const W = Math.ceil(rect.width), H = Math.ceil(rect.height);
      if (W < 10 || H < 10) { reveal(); return; }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const ctx = cv.getContext("2d");
      if (!ctx) { reveal(); return; }

      // overlay the canvas exactly on the heading's box so pixels land on the text
      cv.style.left = (rect.left - wrapRect.left) + "px";
      cv.style.top = (rect.top - wrapRect.top) + "px";
      cv.style.width = W + "px"; cv.style.height = H + "px";
      cv.width = W * dpr; cv.height = H * dpr;   // resets ctx state
      ctx.scale(dpr, dpr);

      const cs = getComputedStyle(h1);
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#1a1813";
      // match the heading's tracking so the mask aligns with the real <h1>
      try {
        if (!Number.isNaN(parseFloat(cs.letterSpacing))) {
          (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = cs.letterSpacing;
        }
      } catch { /* letterSpacing unsupported — ignore */ }

      const drawCrisp = () => {
        ctx.clearRect(0, 0, W, H);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#1a1813";
        ctx.fillText(text, W / 2, H / 2 + 2);
      };
      drawCrisp(); // render once to sample the glyph mask

      const step = 4;   // finer grid → smooth strokes
      const sz = step;  // squares tile edge-to-edge → connected letterforms
      const img = ctx.getImageData(0, 0, W * dpr, H * dpr).data;
      const targets: { tx: number; ty: number }[] = [];
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          const idx = (Math.floor(y * dpr) * (W * dpr) + Math.floor(x * dpr)) * 4 + 3; // alpha
          if (img[idx] > 90) targets.push({ tx: x, ty: y }); // lower cutoff catches AA edges
        }
      }
      if (targets.length === 0) { reveal(); return; }

      // assemble cohesively: particles rise from a shallow band below with slight x jitter
      const particles = targets.map((t) => ({
        x: t.tx + (Math.random() - 0.5) * 24,
        y: t.ty + 26 + Math.random() * 40,
        tx: t.tx,
        ty: t.ty,
        d: Math.random() * 0.22, // staggered start
      }));

      const DURATION = 1000;
      const t0 = performance.now();
      const ease = (p: number) => 1 - Math.pow(1 - p, 3);

      const frame = (now: number) => {
        if (cancelled) return;
        const elapsed = (now - t0) / DURATION;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#1a1813";
        let done = true;
        for (const p of particles) {
          const local = Math.min(1, Math.max(0, (elapsed - p.d) / (1 - p.d)));
          const e = ease(local);
          if (local < 1) done = false;
          const x = p.x + (p.tx - p.x) * e;
          const y = p.y + (p.ty - p.y) * e;
          ctx.globalAlpha = 0.15 + 0.85 * e;
          ctx.fillRect(x, y, sz, sz);
        }
        ctx.globalAlpha = 1;
        if (done) { drawCrisp(); reveal(); return; } // crisp freeze-frame before crossfade
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };

    // wait for the web font so the pixel mask matches the final heading
    const start = () => requestAnimationFrame(run);
    if (document.fonts?.ready) document.fonts.ready.then(start);
    else start();

    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, [text]);

  return (
    <div className="hero-pixels" ref={wrapRef}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <h1 className="hero-h1" ref={h1Ref}>{text}</h1>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/home/HeroPixels.tsx
git commit -m "fix(hero): cohesive pixel-assembly — seamless grain, AA edges, rise-in"
```

---

### Task 2: Backfill prerequisite frontmatter

**Files (Modify — `prereqs:` line only):** the 10 topics below. Genuine root topics (`what-is-money`, `what-is-a-blockchain`, `what-is-a-stock`, `uniswap-v2`, `mm-primer`, `understanding-liquidity`, `tradfi-mapping`, `defi-risk-taxonomy`) are intentionally left empty.

Apply exactly these `prereqs` values (replace the existing `prereqs: []` line in each file):

| File | New `prereqs:` line |
|------|---------------------|
| `content/topics/compound.mdx` | `prereqs: ["lending-borrowing"]` |
| `content/topics/makerdao.mdx` | `prereqs: ["stablecoin-design"]` |
| `content/topics/stablecoin-design.mdx` | `prereqs: ["what-is-money"]` |
| `content/topics/oracles.mdx` | `prereqs: ["what-is-a-blockchain"]` |
| `content/topics/order-books-and-exchanges.mdx` | `prereqs: ["what-is-a-stock"]` |
| `content/topics/dao-governance.mdx` | `prereqs: ["tokens-and-standards"]` |
| `content/topics/bridges.mdx` | `prereqs: ["what-is-a-blockchain"]` |
| `content/topics/rwa.mdx` | `prereqs: ["tradfi-mapping"]` |
| `content/topics/liquid-staking.mdx` | `prereqs: ["what-is-a-blockchain"]` |
| `content/topics/yield-vaults.mdx` | `prereqs: ["understanding-liquidity"]` |

All target slugs exist; none create a cycle.

- [ ] **Step 1: Edit each file's `prereqs:` line per the table above.**

- [ ] **Step 2: Run the topic loader test (it fails the build if any prereq slug does not resolve)**

Run: `npx vitest run lib/mdx.test.ts`
Expected: PASS.

- [ ] **Step 3: Production build (frontmatter is parsed at build; bad data fails here)**

Run: `npm run build`
Expected: build succeeds, 49 topic pages generated.

- [ ] **Step 4: Commit**

```bash
git add content/topics/
git commit -m "content: backfill prerequisites on 10 non-root topics"
```

---

### Task 3: Quiz data file

**Files:**
- Create: `content/quiz.json`

- [ ] **Step 1: Create `content/quiz.json` with this exact content**

```json
[
  {
    "id": "q01",
    "type": "theory",
    "prompt": "What property makes a unit of money \"fungible\"?",
    "options": [
      "Every unit is interchangeable with every other unit of the same kind",
      "It can only be spent once",
      "It is backed by a government",
      "It increases in value over time"
    ],
    "answer": 0,
    "explanation": "Fungibility means one unit is indistinguishable from and interchangeable with another — one dollar is as good as any other dollar. It is independent of backing or scarcity.",
    "topic": "what-is-money"
  },
  {
    "id": "q02",
    "type": "theory",
    "prompt": "What does a blockchain fundamentally provide?",
    "options": [
      "A faster database hosted by one company",
      "A shared, append-only ledger whose state is secured by consensus",
      "A way to make websites load faster",
      "Free transactions with no validators"
    ],
    "answer": 1,
    "explanation": "A blockchain is a replicated, append-only ledger. No single party controls it; participants agree on its state through a consensus mechanism, which is what makes it trust-minimized.",
    "topic": "what-is-a-blockchain"
  },
  {
    "id": "q03",
    "type": "quant",
    "prompt": "A constant-product pool holds 100 ETH and 200,000 USDC. What is the marginal price of ETH?",
    "options": ["200 USDC", "2,000 USDC", "20,000 USDC", "0.0005 USDC"],
    "answer": 1,
    "explanation": "In an x*y=k pool the price of ETH is the ratio of reserves: 200,000 USDC / 100 ETH = 2,000 USDC per ETH.",
    "topic": "uniswap-v2"
  },
  {
    "id": "q04",
    "type": "quant",
    "prompt": "Same pool (100 ETH, 200,000 USDC, k=20,000,000). Ignoring fees, roughly how much USDC does it cost to buy 10 ETH?",
    "options": ["~20,000 USDC", "~18,000 USDC", "~22,222 USDC", "~2,000 USDC"],
    "answer": 2,
    "explanation": "After buying 10 ETH the pool holds 90 ETH, so USDC must rise to k/90 = 222,222. You pay the difference: 222,222 − 200,000 ≈ 22,222 USDC — well above 10 × 2,000 because of price impact.",
    "topic": "liquidity-and-pricing"
  },
  {
    "id": "q05",
    "type": "quant",
    "prompt": "An LP holds a 50/50 pool position. One asset's price doubles relative to the other. Approximately how much impermanent loss versus simply holding?",
    "options": ["~0%", "~5.7%", "~25%", "~50%"],
    "answer": 1,
    "explanation": "IL = 2·√r/(1+r) − 1 with r=2 gives 2·1.414/3 − 1 ≈ −5.7%. A 2x divergence costs an LP about 5.7% relative to holding.",
    "topic": "impermanent-loss"
  },
  {
    "id": "q06",
    "type": "analytical",
    "prompt": "An LP's pair diverges sharply, then the price returns exactly to where they entered. What happens to the impermanent loss?",
    "options": [
      "It is locked in permanently",
      "It roughly disappears, and any fees earned along the way are kept",
      "It doubles",
      "It converts into a borrowing fee"
    ],
    "answer": 1,
    "explanation": "Impermanent loss is 'impermanent' precisely because it tracks divergence from entry. If price returns to entry, the loss reverts to ~0 while trading fees collected in between remain — that's the LP's net gain.",
    "topic": "impermanent-loss"
  },
  {
    "id": "q07",
    "type": "theory",
    "prompt": "Concentrated liquidity (Uniswap v3) lets a liquidity provider do what?",
    "options": [
      "Lend their tokens to borrowers",
      "Allocate capital to a chosen price range for higher capital efficiency",
      "Avoid impermanent loss entirely",
      "Earn a guaranteed fixed yield"
    ],
    "answer": 1,
    "explanation": "v3 lets LPs concentrate liquidity within a price band instead of across the whole curve, earning far more fees per dollar — at the cost of more active management and amplified IL if price leaves the range.",
    "topic": "uniswap-v3"
  },
  {
    "id": "q08",
    "type": "analytical",
    "prompt": "A v3 LP sets a range, and the market price rises above its upper bound. What is the position now?",
    "options": [
      "Split 50/50 and still earning fees",
      "Entirely in one asset and earning no fees until price re-enters the range",
      "Automatically closed and withdrawn",
      "Earning double fees"
    ],
    "answer": 1,
    "explanation": "Once price exits above the range, the position has been fully converted into the 'sold' asset and sits idle — it earns no fees until price moves back inside the chosen band.",
    "topic": "uniswap-v3"
  },
  {
    "id": "q09",
    "type": "theory",
    "prompt": "In an overcollateralized lending protocol, a borrower must:",
    "options": [
      "Pass a credit check",
      "Deposit collateral worth more than the amount they borrow",
      "Borrow only stablecoins",
      "Repay within 24 hours"
    ],
    "answer": 1,
    "explanation": "Permissionless on-chain lending has no credit scores, so loans are overcollateralized: the collateral value must exceed the debt, giving the protocol a buffer to liquidate if the loan goes underwater.",
    "topic": "lending-borrowing"
  },
  {
    "id": "q10",
    "type": "quant",
    "prompt": "Collateral is worth $15,000 with an 80% liquidation threshold; debt is $9,000. What is the health factor?",
    "options": ["0.83", "1.33", "1.67", "0.60"],
    "answer": 1,
    "explanation": "Health factor = (collateral × threshold) / debt = (15,000 × 0.80) / 9,000 = 12,000 / 9,000 ≈ 1.33. Above 1 is safe; below 1 is liquidatable.",
    "topic": "liquidations"
  },
  {
    "id": "q11",
    "type": "analytical",
    "prompt": "A borrower's health factor falls below 1. What happens?",
    "options": [
      "The protocol forgives the loan",
      "The position becomes liquidatable: liquidators repay debt and seize collateral at a discount",
      "Interest stops accruing",
      "The collateral is returned to the borrower"
    ],
    "answer": 1,
    "explanation": "A health factor under 1 means the collateral no longer safely covers the debt. Liquidators can repay part of the debt in exchange for the borrower's collateral plus a bonus, restoring the protocol's solvency.",
    "topic": "liquidations"
  },
  {
    "id": "q12",
    "type": "quant",
    "prompt": "A kinked rate model: base 0%, slope1 4% up to an 80% utilization kink, slope2 75% above it. What is the borrow rate at 90% utilization?",
    "options": ["8%", "37.5%", "41.5%", "75%"],
    "answer": 2,
    "explanation": "At the kink the rate is 4%. Above it: 4% + ((0.90 − 0.80)/(1 − 0.80)) × 75% = 4% + 0.5 × 75% = 4% + 37.5% = 41.5%. The steep second slope punishes high utilization to pull deposits back.",
    "topic": "interest-rate-models"
  },
  {
    "id": "q13",
    "type": "theory",
    "prompt": "A fiat-collateralized stablecoin (e.g. USDC) holds its peg primarily by:",
    "options": [
      "An algorithm that mints and burns a volatile token",
      "Holding off-chain reserves redeemable roughly 1:1",
      "Overcollateralized crypto vaults",
      "Staking rewards"
    ],
    "answer": 1,
    "explanation": "Fiat-backed stablecoins keep cash and cash-equivalents in reserve so each token can be redeemed for ~$1. The peg rests on trust in those reserves and the redemption guarantee.",
    "topic": "stablecoin-design"
  },
  {
    "id": "q14",
    "type": "analytical",
    "prompt": "Why can an undercollateralized algorithmic stablecoin enter a 'death spiral'?",
    "options": [
      "Because its reserves are too large",
      "A falling price erodes confidence; redemptions mint more of the volatile token, pushing its price down further",
      "Because it is overcollateralized",
      "Because interest rates rise"
    ],
    "answer": 1,
    "explanation": "When the peg slips, the design mints ever more of the absorbing/volatile token to defend it. That dilution crashes the volatile token's price, which destroys the backing — a self-reinforcing collapse (cf. UST/LUNA).",
    "topic": "algorithmic-stablecoins"
  },
  {
    "id": "q15",
    "type": "theory",
    "prompt": "What problem do DeFi oracles solve?",
    "options": [
      "They make transactions cheaper",
      "They bring off-chain data such as asset prices on-chain reliably",
      "They store user passwords",
      "They replace validators"
    ],
    "answer": 1,
    "explanation": "Smart contracts can't natively see the outside world. Oracles feed external data (prices, rates, events) on-chain so protocols like lenders and derivatives can act on real-world values.",
    "topic": "oracles"
  },
  {
    "id": "q16",
    "type": "analytical",
    "prompt": "What is a 'sandwich' MEV attack?",
    "options": [
      "Splitting a trade across two exchanges",
      "Buying just before a victim's swap and selling just after, profiting from the price move it causes",
      "Two validators sharing a block reward",
      "Bundling many small trades into one"
    ],
    "answer": 1,
    "explanation": "A searcher front-runs a pending swap with a buy (pushing the price up), lets the victim trade at the worse price, then back-runs with a sell — extracting value from the victim's slippage.",
    "topic": "mev"
  },
  {
    "id": "q17",
    "type": "theory",
    "prompt": "A liquid staking token (e.g. stETH) represents:",
    "options": [
      "A loan to a validator",
      "A tradeable claim on staked assets plus their accruing rewards",
      "A governance-only token with no value",
      "A stablecoin pegged to ETH"
    ],
    "answer": 1,
    "explanation": "Liquid staking issues a token for your staked position so you keep liquidity — it accrues staking rewards yet can still be traded or used as collateral across DeFi.",
    "topic": "liquid-staking"
  },
  {
    "id": "q18",
    "type": "quant",
    "prompt": "Ignoring fees and maintenance margin, roughly what adverse price move liquidates a 5x leveraged position?",
    "options": ["5%", "20%", "50%", "100%"],
    "answer": 1,
    "explanation": "At 5x, your margin is 1/5 of the position, so a move of about 1/5 = 20% against you wipes out the margin and triggers liquidation. Higher leverage means a thinner buffer.",
    "topic": "perpetual-futures"
  },
  {
    "id": "q19",
    "type": "analytical",
    "prompt": "A perpetual future trades persistently above the spot index. The funding rate is positive — what does that mean?",
    "options": [
      "Shorts pay longs",
      "Longs pay shorts, nudging the perp price back toward spot",
      "The exchange pays both sides",
      "Funding has no effect on price"
    ],
    "answer": 1,
    "explanation": "Funding keeps the perp tethered to spot. When the perp trades at a premium, longs periodically pay shorts, discouraging longs and encouraging shorts until the gap closes.",
    "topic": "perpetual-futures"
  },
  {
    "id": "q20",
    "type": "quant",
    "prompt": "A principal token (PT) redeems for 1 unit at maturity. It trades at 0.92 with 6 months left. What is the approximate simple annualized yield?",
    "options": ["~0.9%", "~4.3%", "~8.7%", "~17.4%"],
    "answer": 3,
    "explanation": "Return to maturity = 1/0.92 − 1 ≈ 8.7% over half a year. Annualized simply: 8.7% / 0.5 ≈ 17.4%. Buying the PT locks in that fixed yield as its price pulls to par.",
    "topic": "pendle"
  }
]
```

- [ ] **Step 2: Validate JSON parses**

Run: `node -e "console.log(require('./content/quiz.json').length)"`
Expected: prints `20`.

- [ ] **Step 3: Commit**

```bash
git add content/quiz.json
git commit -m "content: add 20-question quiz dataset"
```

---

### Task 4: Quiz loader + validation test (TDD)

**Files:**
- Create: `lib/quiz.ts`
- Create: `lib/quiz.test.ts`

- [ ] **Step 1: Write the failing test `lib/quiz.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { QUIZ, type QuizType } from "./quiz";
import { loadTopics } from "./mdx";

describe("quiz data", () => {
  const slugs = new Set(loadTopics().map((t) => t.meta.slug));

  it("has exactly 20 questions", () => {
    expect(QUIZ).toHaveLength(20);
  });

  it("every question has 4 options and a valid answer index", () => {
    for (const q of QUIZ) {
      expect(q.options).toHaveLength(4);
      expect(Number.isInteger(q.answer)).toBe(true);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThanOrEqual(3);
    }
  });

  it("every question links to a real topic", () => {
    for (const q of QUIZ) {
      expect(slugs.has(q.topic)).toBe(true);
    }
  });

  it("all three question types are represented", () => {
    const types = new Set<QuizType>(QUIZ.map((q) => q.type));
    expect(types.has("quant")).toBe(true);
    expect(types.has("theory")).toBe(true);
    expect(types.has("analytical")).toBe(true);
  });

  it("question ids are unique", () => {
    const ids = new Set(QUIZ.map((q) => q.id));
    expect(ids.size).toBe(QUIZ.length);
  });
});
```

- [ ] **Step 2: Run it, verify it fails (module not found)**

Run: `npx vitest run lib/quiz.test.ts`
Expected: FAIL — cannot resolve `./quiz`.

- [ ] **Step 3: Create `lib/quiz.ts`**

```ts
import quizData from "@/content/quiz.json";

export type QuizType = "quant" | "theory" | "analytical";

export interface QuizQuestion {
  id: string;
  type: QuizType;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  topic: string;
}

export const QUIZ: QuizQuestion[] = quizData as QuizQuestion[];
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run lib/quiz.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/quiz.ts lib/quiz.test.ts
git commit -m "feat(quiz): typed loader + data validation tests"
```

---

### Task 5: Quiz UI (page + client stepper)

**Files:**
- Create: `app/quiz/page.tsx`
- Create: `components/quiz/QuizClient.tsx`
- Modify: `app/globals.css` (append `.quiz-*` rules)

Note: `.page-head`, `.page-head-h1`, `.page-head-sub`, `.btn-primary` already exist (used by the playground page).

- [ ] **Step 1: Create `app/quiz/page.tsx`**

```tsx
import type { Metadata } from "next";
import QuizClient from "@/components/quiz/QuizClient";
import { QUIZ } from "@/lib/quiz";

export const metadata: Metadata = { title: "Quiz" };

export default function QuizPage() {
  return (
    <div style={{ padding: "40px 0 60px" }}>
      <div className="page-head">
        <div className="page-head-h1">Quiz</div>
        <div className="page-head-sub">
          Twenty questions across DeFi — quant, theory, and analytical. Instant feedback and an
          explanation for every answer.
        </div>
      </div>
      <QuizClient questions={QUIZ} />
    </div>
  );
}
```

- [ ] **Step 2: Create `components/quiz/QuizClient.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { QuizQuestion } from "@/lib/quiz";

const BEST_KEY = "dg:quiz-best";
const TYPE_LABEL: Record<string, string> = {
  quant: "Quant", theory: "Theory", analytical: "Analytical",
};

export default function QuizClient({ questions }: { questions: QuizQuestion[] }) {
  const total = questions.length;
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [byType, setByType] = useState<Record<string, { right: number; total: number }>>({});
  const [done, setDone] = useState(false);
  const [best, setBest] = useState<number | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(BEST_KEY);
    if (raw) setBest(parseInt(raw, 10));
  }, []);

  const q = questions[idx];

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const right = i === q.answer;
    if (right) setScore((s) => s + 1);
    setByType((m) => {
      const cur = m[q.type] ?? { right: 0, total: 0 };
      return { ...m, [q.type]: { right: cur.right + (right ? 1 : 0), total: cur.total + 1 } };
    });
  };

  const next = () => {
    if (idx + 1 >= total) {
      const finalScore = score;
      setBest((b) => {
        const nb = b === null ? finalScore : Math.max(b, finalScore);
        try { localStorage.setItem(BEST_KEY, String(nb)); } catch { /* ignore */ }
        return nb;
      });
      setDone(true);
    } else {
      setIdx((n) => n + 1);
      setPicked(null);
    }
  };

  const restart = () => {
    setIdx(0); setPicked(null); setScore(0); setByType({}); setDone(false);
  };

  if (done) {
    const verdict = score === total ? "Perfect run." : score >= total * 0.7 ? "Strong showing." : "Worth another pass.";
    return (
      <div className="quiz-results">
        <div className="quiz-score-big">{score}<span> / {total}</span></div>
        <div className="quiz-score-label">{verdict}</div>
        {best !== null && <div className="quiz-best">Best so far: {best} / {total}</div>}
        <div className="quiz-breakdown">
          {Object.entries(byType).map(([t, v]) => (
            <div className="quiz-breakdown-row" key={t}>
              <span>{TYPE_LABEL[t] ?? t}</span><span>{v.right} / {v.total}</span>
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={restart}>Retake the quiz →</button>
      </div>
    );
  }

  return (
    <div className="quiz-card">
      <div className="quiz-progress">
        <span className="quiz-qnum">Question {idx + 1} / {total}</span>
        <span className="quiz-type-tag">{TYPE_LABEL[q.type] ?? q.type}</span>
        <span className="quiz-running">Score {score}</span>
      </div>
      <div className="quiz-bar"><div className="quiz-bar-fill" style={{ width: `${(idx / total) * 100}%` }} /></div>
      <h2 className="quiz-prompt">{q.prompt}</h2>
      <div className="quiz-options">
        {q.options.map((opt, i) => {
          const state = picked === null ? ""
            : i === q.answer ? " correct"
            : i === picked ? " wrong"
            : " dimmed";
          return (
            <button
              key={i}
              className={`quiz-option${state}`}
              onClick={() => pick(i)}
              disabled={picked !== null}
            >
              <span className="quiz-option-key">{String.fromCharCode(65 + i)}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="quiz-explain">
          <div className={`quiz-verdict ${picked === q.answer ? "ok" : "no"}`}>
            {picked === q.answer ? "Correct" : "Not quite"}
          </div>
          <p>{q.explanation}</p>
          <div className="quiz-explain-foot">
            <Link className="quiz-learn" href={`/learn/${q.topic}`}>Learn this →</Link>
            <button className="btn-primary" onClick={next}>
              {idx + 1 >= total ? "See results →" : "Next →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Append these rules to `app/globals.css`**

```css
/* ---- Quiz ---- */
.quiz-card{max-width:680px;margin:0 auto;background:#efeadd;border:1px solid rgba(26,24,19,.12);border-radius:14px;padding:26px 26px 28px}
.quiz-progress{display:flex;align-items:center;gap:12px;font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;color:rgba(26,24,19,.55)}
.quiz-type-tag{padding:2px 8px;border:1px solid rgba(26,24,19,.25);border-radius:100px;text-transform:uppercase}
.quiz-running{margin-left:auto;color:#1a1813}
.quiz-bar{height:3px;background:rgba(26,24,19,.12);border-radius:3px;margin:14px 0 18px;overflow:hidden}
.quiz-bar-fill{height:100%;background:#1a1813;transition:width .3s ease}
.quiz-prompt{font-family:var(--font-sans);font-size:22px;line-height:1.35;font-weight:600;margin:0 0 18px}
.quiz-options{display:flex;flex-direction:column;gap:10px}
.quiz-option{display:flex;align-items:center;gap:12px;text-align:left;padding:13px 15px;border:1px solid rgba(26,24,19,.18);border-radius:10px;background:transparent;color:#1a1813;font-size:15px;cursor:pointer;transition:background .12s,border-color .12s}
.quiz-option:hover:not(:disabled){background:rgba(26,24,19,.05)}
.quiz-option:disabled{cursor:default}
.quiz-option-key{font-family:var(--font-mono);font-size:12px;width:22px;height:22px;flex:none;display:flex;align-items:center;justify-content:center;border:1px solid rgba(26,24,19,.25);border-radius:6px}
.quiz-option.correct{border-color:#1a1813;background:#1a1813;color:#e8e3d6}
.quiz-option.correct .quiz-option-key{border-color:rgba(232,227,214,.5)}
.quiz-option.wrong{border-color:rgba(150,40,30,.5);background:rgba(150,40,30,.08)}
.quiz-option.dimmed{opacity:.5}
.quiz-explain{margin-top:18px;padding-top:16px;border-top:1px solid rgba(26,24,19,.12)}
.quiz-verdict{font-family:var(--font-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px}
.quiz-verdict.ok{color:#1a1813}
.quiz-verdict.no{color:#96281e}
.quiz-explain p{font-size:14.5px;line-height:1.6;color:rgba(26,24,19,.78);margin:0 0 16px}
.quiz-explain-foot{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.quiz-learn{font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;color:rgba(26,24,19,.6);text-decoration:none}
.quiz-learn:hover{color:#1a1813;text-decoration:underline}
.quiz-results{max-width:520px;margin:0 auto;text-align:center;background:#efeadd;border:1px solid rgba(26,24,19,.12);border-radius:14px;padding:40px 30px}
.quiz-score-big{font-family:var(--font-sans);font-size:64px;font-weight:700;line-height:1;letter-spacing:-.03em}
.quiz-score-big span{font-size:26px;color:rgba(26,24,19,.5);font-weight:500}
.quiz-score-label{font-size:17px;margin-top:8px}
.quiz-best{font-family:var(--font-mono);font-size:12px;color:rgba(26,24,19,.55);margin-top:6px}
.quiz-breakdown{margin:22px auto;max-width:280px;display:flex;flex-direction:column;gap:8px}
.quiz-breakdown-row{display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:13px;color:rgba(26,24,19,.7);padding-bottom:6px;border-bottom:1px solid rgba(26,24,19,.1)}
```

- [ ] **Step 4: Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: clean; a `/quiz` route is generated.

- [ ] **Step 5: Commit**

```bash
git add app/quiz/page.tsx components/quiz/QuizClient.tsx app/globals.css
git commit -m "feat(quiz): /quiz page with instant-feedback stepper"
```

---

### Task 6: Add Quiz to the nav

**Files:**
- Modify: `components/SiteNav.tsx:5-12` (TABS array)

- [ ] **Step 1: Insert the Quiz tab after Playground**

Change the `TABS` array so it reads:

```tsx
const TABS = [
  { href: "/learn", label: "Learn", key: "learn" },
  { href: "/graph", label: "Graph", key: "graph" },
  { href: "/playground", label: "Playground", key: "playground" },
  { href: "/quiz", label: "Quiz", key: "quiz" },
  { href: "/glossary", label: "Glossary", key: "glossary" },
  { href: "/news", label: "News", key: "news" },
  { href: "/community", label: "Community", key: "community" },
];
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/SiteNav.tsx
git commit -m "feat(nav): add Quiz tab"
```

---

### Task 7: Playground layperson context column

**Files:**
- Modify: `app/playground/page.tsx` (add `layman` to each TOOLS entry; two-column body)
- Modify: `app/globals.css` (append `.pg-tool-body` / `.pg-context` rules + responsive collapse)

- [ ] **Step 1: Replace `app/playground/page.tsx` with this exact content**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import ILCurve from "@/components/charts/ILCurve";
import PriceImpact from "@/components/charts/PriceImpact";
import KinkedRate from "@/components/charts/KinkedRate";
import RangeLiquidity from "@/components/charts/RangeLiquidity";
import PTDecay from "@/components/charts/PTDecay";

export const metadata: Metadata = { title: "Playground" };

const TOOLS = [
  {
    title: "Impermanent Loss",
    blurb: "Drag the price ratio and watch an LP's divergence loss against simply holding.",
    topic: "impermanent-loss",
    Chart: ILCurve,
    layman: "If you deposit two assets into a pool and their prices drift apart, you can end up with less value than if you'd just held them in your wallet. The dip in the curve is that gap. It's called “impermanent” because it shrinks back toward zero if prices return to where you started — and the trading fees you earn can offset whatever's left.",
  },
  {
    title: "Price Impact",
    blurb: "See how trade size relative to pool depth drives slippage on a constant-product curve.",
    topic: "liquidity-and-pricing",
    Chart: PriceImpact,
    layman: "Every trade nudges the price against you, and bigger trades in a shallow pool nudge it more. This curve shows how much worse your price gets as your order grows relative to the pool's size. It's why a large swap in a small pool can cost far more than the headline price suggests — that gap is slippage.",
  },
  {
    title: "Interest Rate Curve",
    blurb: "Move utilization across the kink and watch a lending pool's borrow rate respond.",
    topic: "interest-rate-models",
    Chart: KinkedRate,
    layman: "Lending rates aren't fixed — they rise as more of the pool gets borrowed. Below the “kink,” rates climb gently to keep borrowing attractive; past it, they spike sharply to lure new deposits in and stop the pool from being drained dry. Drag utilization across the kink to see the jump.",
  },
  {
    title: "Concentrated Liquidity",
    blurb: "Set a v3 price range and see how capital splits between the two assets.",
    topic: "uniswap-v3",
    Chart: RangeLiquidity,
    layman: "Instead of spreading your money across every possible price, you can park it in a narrow band where trading actually happens — earning far more fees per dollar. The trade-off: if the price leaves your band, your position stops earning and ends up entirely in one asset. The bars show how your capital splits as the price moves.",
  },
  {
    title: "PT Pull-to-Par",
    blurb: "Watch a Pendle principal token's price converge to par as maturity approaches.",
    topic: "pendle",
    Chart: PTDecay,
    layman: "A principal token is like a bond bought at a discount: it's worth less than $1 today but redeems for exactly $1 at maturity. The line shows its price climbing toward par as time passes — that steady “pull” is the fixed yield you lock in the moment you buy.",
  },
];

export default function PlaygroundPage() {
  return (
    <div style={{ padding: "40px 0 60px" }}>
      <div className="page-head">
        <div className="page-head-h1">Playground</div>
        <div className="page-head-sub">Play with the math. Every formula on DeFiGrail, made interactive in one place.</div>
      </div>
      <div className="pg-grid">
        {TOOLS.map(({ title, blurb, topic, Chart, layman }) => (
          <section className="pg-tool" key={topic}>
            <div className="pg-tool-head">
              <div>
                <h2 className="pg-tool-title">{title}</h2>
                <p className="pg-tool-blurb">{blurb}</p>
              </div>
              <Link className="pg-tool-link" href={`/learn/${topic}`}>Open the full topic →</Link>
            </div>
            <div className="pg-tool-body">
              <div className="pg-chart"><Chart /></div>
              <aside className="pg-context">
                <div className="pg-context-label">What it means</div>
                <p>{layman}</p>
              </aside>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Append these rules to `app/globals.css`**

```css
/* ---- Playground two-column body ---- */
.pg-tool-body{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:24px;align-items:center;margin-top:10px}
.pg-chart{min-width:0}
.pg-context{border-left:1px solid rgba(26,24,19,.12);padding-left:20px}
.pg-context-label{font-family:var(--font-mono);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:rgba(26,24,19,.45);margin-bottom:8px}
.pg-context p{font-size:14px;line-height:1.6;color:rgba(26,24,19,.74);margin:0}
@media (max-width:860px){
  .pg-tool-body{grid-template-columns:1fr}
  .pg-context{border-left:none;border-top:1px solid rgba(26,24,19,.12);padding-left:0;padding-top:16px}
}
```

- [ ] **Step 3: Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add app/playground/page.tsx app/globals.css
git commit -m "feat(playground): layperson context column beside each chart"
```

---

### Task 8: Full verification + deploy

- [ ] **Step 1: Full test suite**

Run: `npx vitest run`
Expected: all suites pass (existing 81 + new quiz tests). If `lib/tracks.test.ts` asserts a tab/route count that changed, it should NOT — nav tabs aren't tested there; do not edit tests unless a real assertion broke.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: green; routes include `/quiz`, `/playground`, all 49 `/learn/*`.

- [ ] **Step 3: Push**

```bash
git push origin main
```

- [ ] **Step 4: Deploy to Vercel production**

Run: `npx vercel deploy --prod --yes` (deploy may print an ECONNRESET on status poll but still succeed — verify with `npx vercel ls` if so).

- [ ] **Step 5: Report deploy URL to the user for visual confirmation** of: hero assembling centered & cohesive, prereq chips on backfilled topics, `/quiz` flow, playground two-column context.

---

## Self-Review

**Spec coverage:**
- §1 hero cohesion → Task 1 ✓
- §2 prereqs → reframed (already rendered) → Task 2 backfill ✓
- §3 quiz (data, page, stepper, instant feedback, localStorage, tests, nav) → Tasks 3–6 ✓
- §4 playground context → Task 7 ✓
- Cross-cutting verification → Task 8 ✓

**Placeholder scan:** none — all code, JSON, and commands are concrete.

**Type consistency:** `QuizQuestion`/`QuizType` defined in Task 4 `lib/quiz.ts`; consumed identically in Task 5 (`QuizClient`) and the test (Task 4). `QUIZ` export name consistent across page, component, test. Topic slugs in quiz JSON all verified to exist. Prereq backfill slugs all exist.

**Scope:** single coherent plan; no decomposition needed.

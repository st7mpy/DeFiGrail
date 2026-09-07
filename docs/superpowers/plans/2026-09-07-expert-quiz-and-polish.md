# Expert Quiz & Landing Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a harder, scenario-based Expert Quiz modelled on Wintermute's Alpha Challenge, and land three landing-page fixes — a smooth hero assembly, a contact block, and a Bridge-style gradient in the site palette.

**Architecture:** All four tasks are additive and independent. The Expert Quiz reuses the existing `QuizClient` component and `QuizQuestion` shape via a second JSON file and a mode switch on `/quiz` — no new route, no new nav tab. The hero fix is confined to the tail of the `HeroPixels` animation loop. The footer and gradient are presentational.

**Tech Stack:** Next.js 16 App Router, TypeScript, React 19, hand-written CSS in `app/globals.css`, vitest 4 + @testing-library/react (jsdom).

## Global Constraints

- **Read `node_modules/next/dist/docs/` before writing any Next.js code.** Per `AGENTS.md`, this Next version has breaking changes vs. training data.
- **Palette is fixed — "Frozen lake".** Snow `#FFFAFA` ground · navy `#000080` ink · slate `#6D8196` · icy `#ADD8E6` accent. Panels are `#F1F7FA`. Do not introduce new hues. Chart series colours are exempt (they encode data).
- **Section labels:** mono, 10px, `.22em` tracking, uppercase, `rgba(0, 0, 128,.58)`. Match `.topic-section-label`.
- **Contrast floor: WCAG AA (4.5:1) for text under 18px.** The navy-alpha ramp on snow measures: `.88`→12.4:1, `.6`→5.05:1, `.58`→4.9:1, `.45`→3.11:1 (fails). Never put small text below `.58` alpha.
- **Motion must honour `prefers-reduced-motion`.** `app/globals.css` already carries a global guard; anything new must degrade correctly under it.
- **Server components by default.** Add `"use client"` only where a hook or event handler requires it.
- **No new dependencies.**
- **Tests colocated** (`lib/*.test.ts`, `components/**/*.test.tsx`), run with `npm test`. `@` aliases the repo root.
- **`npm run build` validates MDX frontmatter and type-checks.** Both `npm run build` and `npm test` must pass before any commit.
- **Do not import `lib/topic-cards.ts` from anything a vitest test reaches** — it is guarded by `import "server-only"` and fails to resolve under jsdom.
- **Commit after every task.** Conventional prefixes; end every commit message with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

---

## File Structure

**New files**

| Path | Responsibility |
|---|---|
| `content/quiz-expert.json` | 15 expert questions, tiered, same shape as `quiz.json` plus a `tier` field. |
| `lib/quiz-expert.test.ts` | Data-integrity guards for the expert bank. |
| `components/quiz/QuizModeSwitch.tsx` | Client toggle between Core and Expert banks on `/quiz`. |
| `components/quiz/QuizModeSwitch.test.tsx` | Renders both modes; switching swaps the question set. |

**Modified files**

| Path | Change |
|---|---|
| `lib/quiz.ts` | Export `EXPERT_QUIZ` and widen the type with an optional `tier`. |
| `app/quiz/page.tsx` | Render `QuizModeSwitch` instead of `QuizClient` directly. |
| `components/home/HeroPixels.tsx` | Remove the end-of-animation snap. |
| `app/globals.css` | Hero crossfade timing, gradient band, footer contact, tier badge. |
| `components/SiteFooter.tsx` | Add the "Get in touch" block. |
| `app/page.tsx` | Mount the gradient band on the landing page. |

---

## Task 1: The Expert Quiz

**Files:**
- Create: `content/quiz-expert.json`, `lib/quiz-expert.test.ts`, `components/quiz/QuizModeSwitch.tsx`, `components/quiz/QuizModeSwitch.test.tsx`
- Modify: `lib/quiz.ts`, `app/quiz/page.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: `QuizQuestion` and `QuizClient` exactly as they exist. `QuizClient` takes `{ questions: QuizQuestion[] }` and handles its own scoring, explanation reveal, and `dg:quiz-best` localStorage key.
- Produces: `export const EXPERT_QUIZ: QuizQuestion[]` from `lib/quiz.ts`; `QuizModeSwitch({ core, expert }: { core: QuizQuestion[]; expert: QuizQuestion[] })`.

### Question style — this is the substance of the task

Model the questions on **Wintermute's Alpha Challenge** (github.com/WintermuteResearch/Alpha-Challenge), whose case studies are tiered 5/10/15 points and hybrid *on-chain-forensic + scenario*. Its ten studies are: vault, daos, stale-oracle, pump-it, whitehat, stale-amm, jared-from-subway (sandwich MEV), liquidations, long-tail-enjoyor, solana-stake. Its stale-oracle problem asks, in effect: *given this protocol's own validation logic and its state on a specific date, would this exploit have been possible?*

Every expert question MUST:
1. **Pose a concrete scenario with named parameters** — a position, a protocol config, a price path. Not "what is X?"
2. **Require a calculation or a multi-step inference**, not recall. The distractors must be the answers you get from plausible *wrong* reasoning (right formula, wrong baseline; forgetting the fee; using notional instead of margin), never filler.
3. **Carry a `tier` of 1, 2 or 3** — 5 at tier 1, 5 at tier 2, 5 at tier 3. Tier 3 should require two chained steps.
4. **Have an `explanation` that shows the arithmetic**, so a wrong answer teaches.
5. **Set `topic` to a real slug** in `content/topics/` — `lib/quiz.test.ts` already guards this and the expert bank must satisfy the same rule.

Cover this ground, one or two questions each: health factor and liquidation price; sandwich/MEV searcher P&L; funding-rate carry on a perp; concentrated-liquidity range and fee APR; IL vs LVR; stale-oracle exploitability; basis trade on a delta-neutral dollar; ERC-4626 first-depositor share rounding; liquidation cascade under a gas spike; PT/YT implied fixed yield.

**Verify every number yourself before writing it.** Compute each answer twice, and confirm the distractors are actually wrong. A quiz that teaches the wrong arithmetic is worse than no quiz. Where the repo already encodes a formula — `lib/defi-math.ts` has `impermanentLoss`, `kinkedRate` (base .02, kink .8, m1 .1, m2 .75), `ptPrice`, `v3Amounts`, `priceImpact` — your answers must agree with it exactly.

- [ ] **Step 1: Write the failing data test**

Create `lib/quiz-expert.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { EXPERT_QUIZ, QUIZ } from "./quiz";
import { loadTopics } from "./mdx";

describe("expert quiz data", () => {
  const slugs = new Set(loadTopics().map((t) => t.meta.slug));

  it("has 15 questions", () => expect(EXPERT_QUIZ).toHaveLength(15));

  it("has five questions at each tier", () => {
    for (const tier of [1, 2, 3]) {
      expect(EXPERT_QUIZ.filter((q) => q.tier === tier)).toHaveLength(5);
    }
  });

  it("every question has 4 options and a valid answer index", () => {
    for (const q of EXPERT_QUIZ) {
      expect(q.options).toHaveLength(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThanOrEqual(3);
    }
  });

  it("every question links to a real topic", () => {
    for (const q of EXPERT_QUIZ) expect(slugs.has(q.topic), q.id).toBe(true);
  });

  it("ids are unique and do not collide with the core bank", () => {
    const ids = EXPERT_QUIZ.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    const core = new Set(QUIZ.map((q) => q.id));
    for (const id of ids) expect(core.has(id)).toBe(false);
  });

  it("explanations show their working, not just a verdict", () => {
    for (const q of EXPERT_QUIZ) expect(q.explanation.length).toBeGreaterThan(120);
  });

  it("options are distinct within a question", () => {
    for (const q of EXPERT_QUIZ) expect(new Set(q.options).size).toBe(4);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm test -- lib/quiz-expert.test.ts`
Expected: FAIL — `EXPERT_QUIZ` is not exported.

- [ ] **Step 3: Widen the type and export the bank**

In `lib/quiz.ts`, add `tier?: 1 | 2 | 3;` to the `QuizQuestion` interface, then:

```ts
import expertData from "@/content/quiz-expert.json";
export const EXPERT_QUIZ: QuizQuestion[] = expertData as QuizQuestion[];
```

- [ ] **Step 4: Write the 15 questions**

Create `content/quiz-expert.json` — an array matching `QuizQuestion`, ids `x01`–`x15`, per the style rules above. Do the arithmetic before you write each one.

- [ ] **Step 5: Run the data test**

Run: `npm test -- lib/quiz-expert.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 6: Write the failing switch test**

Create `components/quiz/QuizModeSwitch.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import QuizModeSwitch from "./QuizModeSwitch";
import type { QuizQuestion } from "@/lib/quiz";

const q = (id: string, prompt: string): QuizQuestion => ({
  id, prompt, type: "quant", topic: "uniswap-v2",
  options: ["a", "b", "c", "d"], answer: 0, explanation: "because",
});
const core = [q("c1", "CORE PROMPT")];
const expert = [q("x1", "EXPERT PROMPT")];

describe("QuizModeSwitch", () => {
  it("shows the core bank first", () => {
    render(<QuizModeSwitch core={core} expert={expert} />);
    expect(screen.getByText("CORE PROMPT")).toBeInTheDocument();
  });

  it("switches to the expert bank on click", () => {
    render(<QuizModeSwitch core={core} expert={expert} />);
    fireEvent.click(screen.getByRole("tab", { name: /expert/i }));
    expect(screen.getByText("EXPERT PROMPT")).toBeInTheDocument();
  });

  it("marks the active mode for assistive tech", () => {
    render(<QuizModeSwitch core={core} expert={expert} />);
    expect(screen.getByRole("tab", { name: /core/i })).toHaveAttribute("aria-selected", "true");
  });
});
```

- [ ] **Step 7: Run it and watch it fail**

Run: `npm test -- components/quiz/QuizModeSwitch.test.tsx`
Expected: FAIL — cannot resolve `./QuizModeSwitch`.

- [ ] **Step 8: Build the switch**

Create `components/quiz/QuizModeSwitch.tsx`. Remounting `QuizClient` on mode change via `key` is deliberate — it resets score and question index, which is correct when the bank changes.

```tsx
"use client";
import { useState } from "react";
import QuizClient from "./QuizClient";
import type { QuizQuestion } from "@/lib/quiz";

const MODES = [
  { id: "core" as const, label: "Core", blurb: "Twenty questions across DeFi — quant, theory, and analytical." },
  { id: "expert" as const, label: "Expert", blurb: "Fifteen scenario problems, tiered. Named parameters, real arithmetic, no recall questions." },
];

export default function QuizModeSwitch({ core, expert }: { core: QuizQuestion[]; expert: QuizQuestion[] }) {
  const [mode, setMode] = useState<"core" | "expert">("core");
  const questions = mode === "core" ? core : expert;
  const active = MODES.find((m) => m.id === mode)!;

  return (
    <>
      <div className="quiz-modes" role="tablist" aria-label="Quiz difficulty">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            className={`quiz-mode${mode === m.id ? " active" : ""}`}
            onClick={() => setMode(m.id)}
          >
            {m.label}
            <span className="quiz-mode-count">{m.id === "core" ? core.length : expert.length}</span>
          </button>
        ))}
      </div>
      <p className="quiz-mode-blurb">{active.blurb}</p>
      <QuizClient key={mode} questions={questions} />
    </>
  );
}
```

- [ ] **Step 9: Run the switch test**

Run: `npm test -- components/quiz/QuizModeSwitch.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 10: Mount it**

Rewrite `app/quiz/page.tsx` to pass both banks and drop the now-duplicated blurb (the switch renders a per-mode one):

```tsx
import type { Metadata } from "next";
import QuizModeSwitch from "@/components/quiz/QuizModeSwitch";
import { QUIZ, EXPERT_QUIZ } from "@/lib/quiz";

export const metadata: Metadata = { title: "Quiz" };

export default function QuizPage() {
  return (
    <div style={{ padding: "40px 0 60px" }}>
      <div className="page-head">
        <div className="page-head-h1">Quiz</div>
      </div>
      <QuizModeSwitch core={QUIZ} expert={EXPERT_QUIZ} />
    </div>
  );
}
```

- [ ] **Step 11: Style the switch**

Append to `app/globals.css`:

```css
/* ─── QUIZ MODES ─── */
.quiz-modes{display:flex;gap:8px;margin-bottom:12px}
.quiz-mode{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border:1px solid rgba(0, 0, 128,.2);border-radius:100px;background:transparent;color:rgba(0, 0, 128,.7);font-size:13px;transition:background .15s,color .15s,border-color .15s}
.quiz-mode:hover{border-color:#000080;color:#000080}
.quiz-mode.active{background:#000080;border-color:#000080;color:#FFFAFA}
.quiz-mode-count{font-family:var(--font-mono);font-size:10.5px;opacity:.7}
.quiz-mode-blurb{font-size:13px;color:rgba(0, 0, 128,.6);margin:0 0 20px;max-width:620px}
```

- [ ] **Step 12: Full verification**

Run: `npm run build && npm test`
Expected: both pass. Then re-read all 15 questions once and re-check every number. Report any you corrected.

- [ ] **Step 13: Commit**

```bash
git add content/quiz-expert.json lib/quiz.ts lib/quiz-expert.test.ts components/quiz/QuizModeSwitch.tsx components/quiz/QuizModeSwitch.test.tsx app/quiz/page.tsx app/globals.css
git commit -m "feat: expert quiz — 15 tiered scenario problems

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 2: Smooth the hero assembly

**Files:**
- Modify: `components/home/HeroPixels.tsx`, `app/globals.css:139-146`

**Interfaces:**
- Consumes / Produces: no API change. `HeroPixels({ text }: { text: string })` keeps its signature.

**The bug.** The animation tweens 4px squares onto a grid-quantised sample of the glyph mask. On the final frame it calls `drawCrisp()`, which replaces that blocky approximation with a real `ctx.fillText` render — the letterforms shift by up to half a grid cell in one frame. That single-frame jump is the "bounce into place" the reader sees. The subsequent canvas→`<h1>` crossfade is a second, separate discontinuity stacked on the first.

Both go away if the canvas never snaps: let the particles finish, then crossfade the (still blocky) canvas out while the real `<h1>` fades in. The blocky frame and the DOM heading occupy the same box, so the crossfade reads as the text sharpening rather than moving.

- [ ] **Step 1: Remove the snap**

In `components/home/HeroPixels.tsx`, in the `frame` function, change:

```js
        if (done) { drawCrisp(); reveal(); return; } // crisp freeze-frame before crossfade
```

to:

```js
        // No drawCrisp() here. Swapping the grid-quantised particles for a real
        // fillText render shifts every glyph by up to half a cell in one frame,
        // which reads as a bounce. Hold the final particle frame and let the CSS
        // crossfade to the DOM <h1> do the sharpening.
        if (done) { reveal(); return; }
```

- [ ] **Step 2: Soften the landing**

The particle tween uses `easeOutCubic`, which still arrives with visible velocity. In the same file change:

```js
      const ease = (p: number) => 1 - Math.pow(1 - p, 3);
```

to:

```js
      // quintic ease-out: flatter arrival than cubic, so particles settle rather
      // than land — the last 15% of travel is nearly imperceptible.
      const ease = (p: number) => 1 - Math.pow(1 - p, 5);
```

- [ ] **Step 3: Overlap the crossfade**

`app/globals.css:140-141` fades the canvas out over `.4s` and the `<h1>` in over `.5s`, both starting together — the midpoint dips because two half-opacity copies do not sum to one. Give the heading a shorter, immediate fade and the canvas a slightly delayed one so the heading is substantially present before the particles clear. Replace lines 140-141 with:

```css
.hero-pixels canvas{position:absolute;pointer-events:none;opacity:1;transition:opacity .45s ease .12s}
.hero-pixels .hero-h1{opacity:0;transition:opacity .35s ease}
```

- [ ] **Step 4: Confirm `drawCrisp` is still needed**

`drawCrisp()` is still called once before sampling, to render the glyphs the mask is read from. Verify that call at the `drawCrisp(); // render once to sample the glyph mask` line remains. If removing the second call left the function otherwise unused, that would be a mistake — it must still run exactly once, before `getImageData`.

Run: `npx tsc --noEmit`
Expected: clean, no unused-variable error for `drawCrisp`.

- [ ] **Step 5: Verify in a browser**

Run `npm run build && npm test`, then `npm run dev` and load `http://localhost:3000/`. Hard-reload several times and watch the headline land. Expected: particles rise, settle, and the text sharpens — with no frame where the letters jump position. Then set the OS to reduced motion (or emulate it) and confirm the headline appears immediately with no canvas.

- [ ] **Step 6: Commit**

```bash
git add components/home/HeroPixels.tsx app/globals.css
git commit -m "fix: hero headline no longer snaps into place on the final frame

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 3: Footer contact block

**Files:**
- Modify: `components/SiteFooter.tsx`, `app/globals.css`

**Interfaces:**
- Consumes / Produces: none. `SiteFooter` is a server component with no props; keep it that way.

The address is **`siddharth77work@gmail.com`**, confirmed for publication. Assemble the `mailto:` from parts at render time rather than writing it as one literal string in the markup — it stays a real, clickable link for readers while defeating the naive scrapers that regex static HTML for `[\w.]+@[\w.]+`.

- [ ] **Step 1: Add the block**

In `components/SiteFooter.tsx`, replace the `footer-side` div with:

```tsx
        <div className="footer-side">
          <div className="footer-tag">CONCEPT → MECHANICS → FORMULAS → EDGE CASES</div>
          <div className="footer-contact">
            <span className="footer-contact-label">Get in touch</span>
            <a className="footer-made" href={`mailto:${["siddharth77work", "gmail.com"].join("@")}`}>
              Email Siddharth →
            </a>
            <a className="footer-made" href="https://s7ddharth-portfolio.vercel.app" target="_blank" rel="noopener noreferrer">
              Portfolio →
            </a>
          </div>
        </div>
```

- [ ] **Step 2: Style it**

Append to `app/globals.css`:

```css
.footer-contact{display:flex;flex-direction:column;align-items:flex-end;gap:5px;margin-top:2px}
.footer-contact-label{font-family:var(--font-mono);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:rgba(0, 0, 128,.58)}
```

- [ ] **Step 3: Verify**

Run: `npm run build && npm test`, then `npm run dev`. On `http://localhost:3000/`, confirm the footer shows "Get in touch" above both links, and that the email link's `href` resolves to `mailto:siddharth77work@gmail.com` (inspect it — it is assembled at runtime). Confirm the literal string `siddharth77work@gmail.com` does **not** appear in the served HTML: `curl -s localhost:3000/ | grep -c "siddharth77work@gmail.com"` should print `0`.

- [ ] **Step 4: Commit**

```bash
git add components/SiteFooter.tsx app/globals.css
git commit -m "feat: get-in-touch block in the site footer

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 4: Bridge-style gradient band

**Files:**
- Create: nothing.
- Modify: `app/page.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: nothing. Produces: a `.hero-aurora` element rendered as the first child of the `home-hero` section.

**The reference.** bridge.xyz runs a soft, horizontally-flowing colour field across the top of the landing page that dissolves downward into the page background — no hard edge, no banner. Ours is the same idea in the Frozen lake palette: icy `#ADD8E6` and slate `#6D8196` over the snow ground, dissolving into `#FFFAFA` well before the headline. It must sit **behind** the hero content and never intercept clicks.

Landing page only — do not mount it in the root layout.

- [ ] **Step 1: Mount the element**

In `app/page.tsx`, make it the first child of the hero section:

```tsx
      <section className="home-hero">
        <div className="hero-aurora" aria-hidden="true" />
        <div className="hero-eyebrow">An interactive DeFi curriculum</div>
```

- [ ] **Step 2: Add the styles**

Append to `app/globals.css`. Three offset radial fields layered at low alpha read as a soft field rather than three visible blobs; `mask-image` dissolves the whole thing downward so there is no edge.

```css
/* ─── HERO AURORA ─── */
.home-hero{position:relative}
.hero-aurora{
  position:absolute;
  top:-62px;left:50%;transform:translateX(-50%);
  width:100vw;max-width:100vw;height:340px;
  pointer-events:none;z-index:0;
  background:
    radial-gradient(60% 120% at 18% 0%, rgba(173,216,230,.85) 0%, rgba(173,216,230,0) 62%),
    radial-gradient(52% 110% at 52% 6%, rgba(109,129,150,.42) 0%, rgba(109,129,150,0) 60%),
    radial-gradient(58% 120% at 84% 0%, rgba(173,216,230,.62) 0%, rgba(173,216,230,0) 64%);
  filter:blur(26px);
  mask-image:linear-gradient(to bottom, #000 0%, #000 34%, transparent 92%);
  -webkit-mask-image:linear-gradient(to bottom, #000 0%, #000 34%, transparent 92%);
}
.home-hero > *:not(.hero-aurora){position:relative;z-index:1}
@media (max-width:640px){.hero-aurora{height:220px;top:-40px;filter:blur(20px)}}
```

- [ ] **Step 3: Verify it does not break the hero**

Run: `npm run build && npm test`, then `npm run dev` and load `http://localhost:3000/`.

Check all four:
1. The band reads as a soft wash at the top that dissolves before the headline — no visible edge or rectangle.
2. The headline, eyebrow, CTAs and stat row are all fully legible and sit above it.
3. Clicking each of the three hero CTAs still navigates (the element must not intercept pointer events).
4. `document.documentElement.scrollWidth <= window.innerWidth` — the `100vw` width must not introduce a horizontal scrollbar. If it does, switch the width to `100%` and widen with negative margins instead.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "feat: soft gradient wash across the top of the landing page

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

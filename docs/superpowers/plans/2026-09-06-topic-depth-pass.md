# Topic Depth Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise every `/learn/[slug]` page from a 370-word stub to a QuantMemo-grade lesson — typed caveat callouts, cited primary sources, an as-of date, an end-of-topic comprehension check, a plain-English layer — and surface the site's one true differentiator (`tradfiAnchor`) as its own index.

**Architecture:** Everything here is additive to existing surfaces. Four new MDX-facing components (`Caveat`, `Layman`) and page blocks render from two new optional frontmatter fields (`sources`, `lastVerified`) validated by the existing zod schema, so a missing field is a no-op and no topic file must change to keep building. The comprehension check reuses `content/quiz.json`'s existing `topic` field and the existing `useProgress` localStorage hook — no new storage, no accounts. The TradFi index is a pure derivation of frontmatter already on all 50 topics. Full-text search moves the body text off the root-layout RSC payload into one statically-generated route the palette fetches on first open.

**Tech Stack:** Next.js 16 App Router (RSC by default), TypeScript, MDX via `next-mdx-remote/rsc`, zod 4 frontmatter validation, Tailwind v4 + hand-written CSS in `app/globals.css`, vitest 4 + @testing-library/react (jsdom).

## Global Constraints

- **`node_modules/` is not present in this checkout — run `npm install` before Task 1.** Every `npm test` / `npm run build` step below assumes it has been run.
- **Read `node_modules/next/dist/docs/` before writing any Next.js code.** Per `AGENTS.md`: this Next version has breaking changes vs. training data.
- **Server components by default.** Add `"use client"` only where a hook or event handler requires it. `Caveat`, `Layman`, and the sources block are static — they must stay RSC.
- **No new dependencies.** Everything below is stdlib, React, or an already-installed package. `flexsearch` is in `package.json` but unused; do **not** wire it up — 50 documents do not need an index.
- **Design tokens are literal, not variables.** `app/globals.css` hardcodes the paper palette: ink `#1a1813`, paper `#e8e3d6`, panel `#efeadd`, rules `rgba(26,24,19,.12)`–`rgba(26,24,19,.26)`. Match the surrounding CSS exactly; do not introduce new custom properties.
- **Section labels are mono, 10px, `.22em` tracking, uppercase, `rgba(26,24,19,.45)`** — see `.topic-section-label` at `app/globals.css:228`. Every new label follows it.
- **Tests are colocated** (`lib/*.test.ts`, `components/**/*.test.tsx`) and run with `npm test` (vitest, `passWithNoTests: true`). The `@` alias maps to the repo root.
- **`npm run build` validates all MDX frontmatter** — a zod parse failure fails the build. That is the intended safety net; keep it.
- **Commit after every task.** Conventional commit prefixes (`feat:`, `fix:`, `test:`, `content:`).

---

## File Structure

**New files**

| Path | Responsibility |
|---|---|
| `components/topic/Caveat.tsx` | One callout component, five `kind`s. Static, RSC. |
| `components/topic/Caveat.test.tsx` | Label per kind, `asOf` rendering, `src` link presence/absence. |
| `components/topic/Layman.tsx` | Collapsed plain-English aside built on native `<details>`. RSC. |
| `components/topic/Layman.test.tsx` | Renders summary; content present in DOM when collapsed. |
| `components/topic/TopicCheck.tsx` | Client. End-of-topic questions; marks topic read on a clean sweep. |
| `components/topic/TopicCheck.test.tsx` | Renders nothing with no questions; marks read on all-correct. |
| `lib/tradfi.ts` | Derives the TradFi→topic index from frontmatter. |
| `lib/tradfi.test.ts` | Grouping, sorting, and "every anchor resolves" guard. |
| `lib/search-index.ts` | `stripMdx()` + `searchDocs()` — body text as searchable prose. |
| `lib/search-index.test.ts` | Strip behaviour per markdown/MDX construct. |
| `app/tradfi/page.tsx` | The "You know X? Then read Y" index page. |
| `app/search-index/route.ts` | Statically-generated JSON the palette lazy-fetches. |

**Modified files**

| Path | Change |
|---|---|
| `lib/mdx.ts:11-22` | Add `sources` and `lastVerified` to `frontmatterSchema`. |
| `lib/mdx.test.ts` | Cover the two new fields. |
| `lib/quiz.ts` | Add `questionsForTopic(slug)`. |
| `lib/quiz.test.ts:8-10` | Relax the hardcoded `toHaveLength(20)` — Task 3 adds questions. |
| `lib/glossary-remark.ts:6` | Drop `mdxJsxFlowElement` from `FORBIDDEN_ANCESTORS` so prose inside `<Caveat>` still auto-links. |
| `lib/glossary-remark.test.ts` | Add the flow-element case. |
| `app/learn/[slug]/page.tsx` | Register `Caveat`/`Layman` in the MDX component map; render sources block, verified date, and `TopicCheck`. |
| `app/globals.css` | Append `.caveat*`, `.layman*`, `.topic-sources*`, `.topic-verified`, `.topic-check*`, `.tradfi-*` blocks. |
| `components/SiteNav.tsx:6-14` | Add the `/tradfi` tab. |
| `components/SearchPalette.tsx` | Lazy-fetch the index on first open; match body text; show a snippet. |
| `app/sitemap.ts:6` | Add `/tradfi`. |
| `content/quiz.json` | +6 questions for the three seeded topics. |
| `content/topics/*.mdx` (8 files) | Task 7 seeds caveats, sources, and `lastVerified`. |

---

## Task 1: The Caveat component

The core deliverable. One component with a `kind` prop — not five components, not a config file.

**Files:**
- Create: `components/topic/Caveat.tsx`
- Create: `components/topic/Caveat.test.tsx`
- Modify: `lib/glossary-remark.ts:6`
- Modify: `lib/glossary-remark.test.ts`
- Modify: `app/globals.css` (append)
- Modify: `app/learn/[slug]/page.tsx:8-19` (imports) and `:88` (component map)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `export default function Caveat(props: { kind: CaveatKind; asOf?: string; src?: string; children: React.ReactNode })` and `export type CaveatKind = "misuse" | "breaks" | "real" | "stale" | "check"`. Task 7 writes `<Caveat>` tags into MDX bodies against exactly this signature.

- [ ] **Step 1: Write the failing test**

Create `components/topic/Caveat.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Caveat, { type CaveatKind } from "./Caveat";

describe("Caveat", () => {
  it("renders the label for each kind", () => {
    const cases: [CaveatKind, RegExp][] = [
      ["misuse", /commonly misread/i],
      ["breaks", /where this breaks/i],
      ["real", /when it cost real money/i],
      ["stale", /parameters drift/i],
      ["check", /verify it yourself/i],
    ];
    for (const [kind, label] of cases) {
      const { unmount } = render(<Caveat kind={kind}>body copy</Caveat>);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });

  it("renders its children", () => {
    render(<Caveat kind="misuse">the pool is always the last to know</Caveat>);
    expect(screen.getByText(/last to know/i)).toBeInTheDocument();
  });

  it("shows an as-of date when given one", () => {
    render(<Caveat kind="stale" asOf="2026-09-06">params drift</Caveat>);
    expect(screen.getByText(/2026-09-06/)).toBeInTheDocument();
  });

  it("renders a source link only when src is supplied", () => {
    const { unmount } = render(<Caveat kind="stale">no link</Caveat>);
    expect(screen.queryByRole("link")).toBeNull();
    unmount();
    render(<Caveat kind="stale" src="https://aave.com/docs">with link</Caveat>);
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://aave.com/docs");
  });

  it("tags the kind on the element for styling", () => {
    const { container } = render(<Caveat kind="breaks">x</Caveat>);
    expect(container.querySelector('[data-kind="breaks"]')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/topic/Caveat.test.tsx`
Expected: FAIL — `Failed to resolve import "./Caveat"`.

- [ ] **Step 3: Write the component**

Create `components/topic/Caveat.tsx`:

```tsx
const KINDS = {
  misuse: "Commonly misread",
  breaks: "Where this breaks",
  real: "When it cost real money",
  stale: "Parameters drift",
  check: "Verify it yourself",
} as const;

export type CaveatKind = keyof typeof KINDS;

export default function Caveat({
  kind,
  asOf,
  src,
  children,
}: {
  kind: CaveatKind;
  asOf?: string;
  src?: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="caveat" data-kind={kind}>
      <div className="caveat-label">
        <span>{KINDS[kind]}</span>
        {asOf && <span className="caveat-asof">as of {asOf}</span>}
      </div>
      <div className="caveat-body">{children}</div>
      {src && (
        <a className="caveat-src" href={src} target="_blank" rel="noreferrer">
          Live source ↗
        </a>
      )}
    </aside>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/topic/Caveat.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 5: Add the styles**

Append to `app/globals.css`. `.caveat-label` deliberately mirrors `.topic-section-label` (line 228). The left rule weight is the only per-kind difference — the palette is monochrome by design, so kinds are distinguished by rule and label, never by hue.

```css
/* ─── CAVEATS ─── */
.caveat{background:#efeadd;border:1px solid rgba(26,24,19,.12);border-left:3px solid rgba(26,24,19,.3);border-radius:0 8px 8px 0;padding:14px 18px;margin:20px 0}
.caveat[data-kind="real"]{border-left-color:#1a1813}
.caveat[data-kind="stale"]{border-left-style:dashed}
.caveat[data-kind="check"]{border-left-color:rgba(26,24,19,.2);background:rgba(26,24,19,.03)}
.caveat-label{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;font-family:var(--font-mono);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:rgba(26,24,19,.45);margin-bottom:8px}
.caveat-asof{letter-spacing:.06em;text-transform:none;opacity:.75}
.caveat-body{font-family:var(--font-serif);font-size:15.5px;line-height:1.6;color:rgba(26,24,19,.85)}
.caveat-body p{margin:0 0 10px}
.caveat-body p:last-child{margin-bottom:0}
.caveat-src{display:inline-block;margin-top:10px;font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;color:rgba(26,24,19,.6);text-decoration:none}
.caveat-src:hover{color:#1a1813;text-decoration:underline}
```

- [ ] **Step 6: Fix the glossary plugin so caveat prose still auto-links**

`lib/glossary-remark.ts:6` lists `mdxJsxFlowElement` as a forbidden ancestor, so **no text inside any block-level JSX element gets glossary-linked**. That was written to protect self-closing chart elements, which have no text children anyway — but it silently kills auto-linking inside `<Caveat>`, which is prose. The narrow fix is one deletion; `mdxJsxTextElement` stays, which is what actually prevents `<GlossaryTerm>` nesting inside itself.

In `lib/glossary-remark.ts`, change line 6 from:

```ts
const FORBIDDEN_ANCESTORS = ["heading", "link", "mdxJsxTextElement", "mdxJsxFlowElement"] as const;
```

to:

```ts
// mdxJsxTextElement stays (prevents GlossaryTerm nesting inside itself); flow
// elements are block containers like <Caveat> whose prose SHOULD auto-link.
const FORBIDDEN_ANCESTORS = ["heading", "link", "mdxJsxTextElement"] as const;
```

- [ ] **Step 7: Write the failing test for that fix**

Append to `lib/glossary-remark.test.ts` — first read the file's existing imports and pipeline helper and reuse them verbatim rather than building a second one:

```ts
it("links glossary terms inside a block-level JSX element", async () => {
  const out = await process("<Caveat kind=\"misuse\">\n\nAn AMM quotes passively.\n\n</Caveat>");
  expect(out).toContain("GlossaryTerm");
});

it("still refuses to link inside an inline JSX element", async () => {
  const out = await process("Text with <GlossaryTerm term=\"AMM\">AMM</GlossaryTerm> already linked.");
  expect(out.match(/GlossaryTerm/g)?.length).toBe(2); // the opening and closing tag only
});
```

If the existing file has no reusable `process` helper, add one matching how the file already builds its unified pipeline (it must include `remark-mdx` so JSX parses — that package is already a devDependency).

- [ ] **Step 8: Run the full suite**

Run: `npm test`
Expected: PASS. If any pre-existing glossary test now fails because a term inside a chart element got linked, that is a real regression — charts are self-closing with no text children, so it should not happen. If it does, restrict the change to allowing only flow elements named `Caveat` and `Layman` rather than reverting.

- [ ] **Step 9: Register Caveat in the MDX component map**

In `app/learn/[slug]/page.tsx`, add to the import block (near the other `components/topic` imports around line 12):

```tsx
import Caveat from "@/components/topic/Caveat";
```

and extend the `components` prop on `<MDXRemote>` (currently line ~88):

```tsx
components={{ GlossaryTerm, Caveat, ILCurve, KinkedRate, RangeLiquidity, PTDecay, PriceImpact }}
```

- [ ] **Step 10: Prove it renders in a real topic**

Add one caveat to `content/topics/uniswap-v2.mdx`, immediately after the `## 01 · Concept` section's prose:

```mdx
<Caveat kind="misuse">
x·y=k does not mean the pool *sets* a price. The pool is a passive quoting
function; arbitrageurs move it. The pool is always the last to know.
</Caveat>
```

Run: `npm run build`
Expected: build succeeds. Then `npm run dev` and open `http://localhost:3000/learn/uniswap-v2` — the callout renders with the "Commonly misread" label, and "arbitrageurs"/"AMM"-class glossary terms inside it are underlined if they are in `content/glossary.json`.

- [ ] **Step 11: Commit**

```bash
git add components/topic/Caveat.tsx components/topic/Caveat.test.tsx lib/glossary-remark.ts lib/glossary-remark.test.ts app/globals.css "app/learn/[slug]/page.tsx" content/topics/uniswap-v2.mdx
git commit -m "feat: add Caveat callout component with five kinds

Also allows glossary auto-linking inside block-level MDX JSX, which
mdxJsxFlowElement was suppressing for all prose containers.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 2: Cited sources and an as-of date

**Files:**
- Modify: `lib/mdx.ts:11-22`
- Modify: `lib/mdx.test.ts`
- Modify: `app/learn/[slug]/page.tsx` (render block, after `related`, before the closing divider)
- Modify: `app/globals.css` (append)
- Modify: `content/topics/uniswap-v2.mdx`, `content/topics/impermanent-loss.mdx`, `content/topics/interest-rate-models.mdx` (frontmatter)

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `TopicMeta` gains `sources: { label: string; url: string }[]` (defaults to `[]`) and `lastVerified?: string` (`YYYY-MM-DD`). Task 7 writes these fields into five more topic files.

- [ ] **Step 1: Write the failing schema test**

Add to the `describe("frontmatterSchema", ...)` block in `lib/mdx.test.ts`:

```ts
it("defaults sources to an empty array when omitted", () => {
  expect(frontmatterSchema.parse(valid).sources).toEqual([]);
});
it("accepts a well-formed sources array", () => {
  const parsed = frontmatterSchema.parse({
    ...valid,
    sources: [{ label: "Uniswap v2 Core whitepaper", url: "https://uniswap.org/whitepaper.pdf" }],
  });
  expect(parsed.sources[0].label).toBe("Uniswap v2 Core whitepaper");
});
it("rejects a source with a non-URL", () => {
  expect(() =>
    frontmatterSchema.parse({ ...valid, sources: [{ label: "x", url: "not-a-url" }] })
  ).toThrow();
});
it("accepts an ISO lastVerified date", () => {
  expect(frontmatterSchema.parse({ ...valid, lastVerified: "2026-09-06" }).lastVerified).toBe("2026-09-06");
});
it("rejects a non-ISO lastVerified date", () => {
  expect(() => frontmatterSchema.parse({ ...valid, lastVerified: "Sept 2026" })).toThrow();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/mdx.test.ts`
Expected: FAIL — `sources` is `undefined`, and the two rejection tests do not throw.

- [ ] **Step 3: Extend the schema**

In `lib/mdx.ts`, add these two fields to `frontmatterSchema`, after `significance` and before `isNew`:

```ts
  sources: z
    .array(z.object({ label: z.string().min(1), url: z.url() }))
    .default([]),
  lastVerified: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "lastVerified must be YYYY-MM-DD")
    .optional(),
```

Note: this repo is on **zod 4** (`"zod": "^4.4.3"`). Use top-level `z.url()`; `z.string().url()` is deprecated in v4 and will emit a warning. If the installed version rejects `z.url()`, fall back to `z.string().url()` and note it in the commit body.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/mdx.test.ts`
Expected: PASS.

- [ ] **Step 5: Render the block**

In `app/learn/[slug]/page.tsx`, insert immediately after the existing `{related.length > 0 && (...)}` block and before the `<div className="topic-divider" />` that precedes `topic-nav-btns`:

```tsx
{topic.meta.sources.length > 0 && (
  <div className="topic-section" style={{ marginTop: 30 }}>
    <div className="topic-section-label">Primary sources</div>
    <ul className="topic-sources">
      {topic.meta.sources.map((s) => (
        <li key={s.url}>
          <a href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a>
        </li>
      ))}
    </ul>
  </div>
)}
{topic.meta.lastVerified && (
  <div className="topic-verified">Last verified {topic.meta.lastVerified}</div>
)}
```

- [ ] **Step 6: Add the styles**

Append to `app/globals.css`:

```css
/* ─── SOURCES / VERIFIED ─── */
.topic-sources{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:7px}
.topic-sources li{font-size:13.5px;line-height:1.45}
.topic-sources a{color:rgba(26,24,19,.78);text-decoration:underline;text-underline-offset:2px;text-decoration-color:rgba(26,24,19,.25)}
.topic-sources a:hover{color:#1a1813;text-decoration-color:#1a1813}
.topic-verified{margin-top:22px;font-family:var(--font-mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:rgba(26,24,19,.4)}
```

- [ ] **Step 7: Seed three topics**

Add to the frontmatter of `content/topics/uniswap-v2.mdx`:

```yaml
lastVerified: "2026-09-06"
sources:
  - label: "Uniswap v2 Core whitepaper"
    url: "https://uniswap.org/whitepaper.pdf"
  - label: "Uniswap v2 protocol overview (docs)"
    url: "https://docs.uniswap.org/contracts/v2/overview"
```

`content/topics/impermanent-loss.mdx`:

```yaml
lastVerified: "2026-09-06"
sources:
  - label: "Milionis, Moallemi, Roughgarden & Zhang — Automated Market Making and Loss-Versus-Rebalancing"
    url: "https://arxiv.org/abs/2208.06046"
```

`content/topics/interest-rate-models.mdx`:

```yaml
lastVerified: "2026-09-06"
sources:
  - label: "Aave developer documentation"
    url: "https://aave.com/docs"
  - label: "Compound v2 documentation"
    url: "https://docs.compound.finance/v2/"
```

- [ ] **Step 8: Open every URL above in a browser before committing**

These are typed from memory. A dead link on a page whose entire pitch is *verifiability* is worse than no link. Replace any that 404, and prefer a stable docs root over a deep path that will rot.

- [ ] **Step 9: Build and eyeball**

Run: `npm run build && npm test`
Expected: build succeeds (frontmatter parses), full suite passes. Then check `/learn/uniswap-v2` renders "Primary sources" and "Last verified 2026-09-06".

- [ ] **Step 10: Commit**

```bash
git add lib/mdx.ts lib/mdx.test.ts "app/learn/[slug]/page.tsx" app/globals.css content/topics/uniswap-v2.mdx content/topics/impermanent-loss.mdx content/topics/interest-rate-models.mdx
git commit -m "feat: cited primary sources and a last-verified date per topic

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 3: End-of-topic comprehension check

`content/quiz.json` items already carry a `topic` field, so per-topic filtering is a selector, not a schema change. A clean sweep marks the topic read through the existing `useProgress` hook — no new localStorage key.

**Files:**
- Modify: `lib/quiz.ts`
- Modify: `lib/quiz.test.ts:8-10`
- Modify: `content/quiz.json` (+6 questions)
- Create: `components/topic/TopicCheck.tsx`
- Create: `components/topic/TopicCheck.test.tsx`
- Modify: `app/learn/[slug]/page.tsx`
- Modify: `app/globals.css` (append)

**Interfaces:**
- Consumes: `QuizQuestion` from `lib/quiz.ts` (fields: `id`, `type`, `prompt`, `options`, `answer`, `explanation`, `topic`); `useProgress()` from `lib/use-progress.ts` returning `{ map, toggle, isRead, countRead }`.
- Produces: `export function questionsForTopic(slug: string): QuizQuestion[]` and `export default function TopicCheck({ slug, questions }: { slug: string; questions: QuizQuestion[] })`.

- [ ] **Step 1: Write the failing selector test**

Add to `lib/quiz.test.ts`:

```ts
import { QUIZ, questionsForTopic, type QuizType } from "./quiz";

describe("questionsForTopic", () => {
  it("returns only questions for that topic", () => {
    const qs = questionsForTopic("uniswap-v2");
    expect(qs.length).toBeGreaterThan(0);
    for (const q of qs) expect(q.topic).toBe("uniswap-v2");
  });
  it("returns an empty array for a topic with no questions", () => {
    expect(questionsForTopic("no-such-topic")).toEqual([]);
  });
});
```

- [ ] **Step 2: Relax the hardcoded count assertion**

The existing test at `lib/quiz.test.ts:8-10` pins the bank at exactly 20; this task adds 6. Change:

```ts
  it("has exactly 20 questions", () => {
    expect(QUIZ).toHaveLength(20);
  });
```

to:

```ts
  it("has at least the original 20 questions", () => {
    expect(QUIZ.length).toBeGreaterThanOrEqual(20);
  });
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- lib/quiz.test.ts`
Expected: FAIL — `questionsForTopic is not a function`.

- [ ] **Step 4: Add the selector**

Append to `lib/quiz.ts`:

```ts
export const questionsForTopic = (slug: string): QuizQuestion[] =>
  QUIZ.filter((q) => q.topic === slug);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- lib/quiz.test.ts`
Expected: PASS.

- [ ] **Step 6: Add six questions to the bank**

Append these objects to the array in `content/quiz.json`. Every `answer` index below has been checked against `lib/defi-math.ts`; do not renumber the options without re-deriving.

```json
  {
    "id": "q21",
    "type": "theory",
    "prompt": "In a constant-product pool, what actually moves the quoted price toward the wider market price?",
    "options": [
      "An oracle the pool reads at the start of each block",
      "Arbitrageurs trading against the pool until it is no longer profitable",
      "Liquidity providers rebalancing their own deposits",
      "A keeper contract called by protocol governance"
    ],
    "answer": 1,
    "explanation": "The pool is a passive quoting function — it has no idea what the market price is. Arbitrageurs trade against a stale quote until the marginal price matches elsewhere, and their profit is the LP's divergence loss.",
    "topic": "uniswap-v2"
  },
  {
    "id": "q22",
    "type": "quant",
    "prompt": "A Uniswap v2 pool charges a 0.30% fee. After a swap settles, how does the invariant k = x·y behave?",
    "options": [
      "It stays exactly constant — that is what 'constant product' means",
      "It decreases by the fee amount",
      "It increases slightly, because the fee is left in the reserves",
      "It resets to the geometric mean of the new reserves"
    ],
    "answer": 2,
    "explanation": "k is only constant in the fee-free idealisation. The 0.30% fee stays in the pool, so post-swap reserves satisfy k' ≥ k. That growth in k is precisely the LP's fee income.",
    "topic": "uniswap-v2"
  },
  {
    "id": "q23",
    "type": "theory",
    "prompt": "An LP withdraws from a 50/50 pool while the price ratio sits at 4× its entry. What is true of their impermanent loss?",
    "options": [
      "It reverses automatically once the price returns to entry",
      "It is realised and permanent the moment they withdraw",
      "It is zero, because trading fees always offset it",
      "It applies only to concentrated-liquidity positions"
    ],
    "answer": 1,
    "explanation": "\"Impermanent\" is marketing. The loss unwinds only if the price returns AND you are still in the pool. Withdraw at a diverged price and it is realised, exactly like any other closed position.",
    "topic": "impermanent-loss"
  },
  {
    "id": "q24",
    "type": "quant",
    "prompt": "A 50/50 LP position's price ratio moves to 4× entry. Ignoring fees, what is the divergence loss versus simply holding?",
    "options": ["-5.7%", "-20.0%", "-25.0%", "-50.0%"],
    "answer": 1,
    "explanation": "IL = 2·√r/(1+r) − 1. With r = 4: 2·2/5 − 1 = 0.8 − 1 = −20%. Note it is symmetric in the ratio — a move to 0.25× costs the same 20%.",
    "topic": "impermanent-loss"
  },
  {
    "id": "q25",
    "type": "theory",
    "prompt": "A lending pool is sitting at 99% utilization. What does that tell you?",
    "options": [
      "The pool is insolvent and depositors have lost money",
      "The borrowers have defaulted on their positions",
      "Withdrawals are constrained until high rates pull in new supply",
      "The reserve factor has been set to zero by governance"
    ],
    "answer": 2,
    "explanation": "High utilization is illiquidity, not insolvency. The loans are still over-collateralised; there is simply little idle cash. The rate curve spikes past the kink precisely to attract new deposits and repay borrowers. Conflating the two is how an on-chain bank run starts.",
    "topic": "interest-rate-models"
  },
  {
    "id": "q26",
    "type": "quant",
    "prompt": "With base rate 2%, a kink at 80% utilization, slope₁ 10% and slope₂ 75%, what is the borrow rate at 90% utilization?",
    "options": ["11.0%", "17.5%", "26.0%", "69.5%"],
    "answer": 1,
    "explanation": "Below the kink the rate accrues at slope₁: 0.02 + 0.80·0.10 = 10%. Past it, the excess 10 points of utilization accrue at slope₂: 0.10·0.75 = 7.5%. Total 17.5%.",
    "topic": "interest-rate-models"
  }
```

- [ ] **Step 7: Run the data-integrity tests**

Run: `npm test -- lib/quiz.test.ts`
Expected: PASS — the existing guards check 4 options, a valid answer index, unique ids, and that every `topic` resolves to a real slug. If "every question links to a real topic" fails, a slug above is misspelled.

- [ ] **Step 8: Write the failing component test**

Create `components/topic/TopicCheck.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import TopicCheck from "./TopicCheck";
import type { QuizQuestion } from "@/lib/quiz";

const qs: QuizQuestion[] = [
  {
    id: "t1", type: "theory", topic: "demo",
    prompt: "Who moves the price?",
    options: ["An oracle", "Arbitrageurs"],
    answer: 1,
    explanation: "The pool quotes passively.",
  },
];

describe("TopicCheck", () => {
  beforeEach(() => localStorage.clear());

  it("renders nothing when the topic has no questions", () => {
    const { container } = render(<TopicCheck slug="demo" questions={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("reveals the explanation after an answer", () => {
    render(<TopicCheck slug="demo" questions={qs} />);
    fireEvent.click(screen.getByText("Arbitrageurs"));
    expect(screen.getByText(/quotes passively/i)).toBeInTheDocument();
  });

  it("marks the topic read once every question is correct", () => {
    render(<TopicCheck slug="demo" questions={qs} />);
    fireEvent.click(screen.getByText("Arbitrageurs"));
    expect(JSON.parse(localStorage.getItem("defigrail_progress") || "{}").demo).toBe(true);
  });

  it("does not mark the topic read on a wrong answer", () => {
    render(<TopicCheck slug="demo" questions={qs} />);
    fireEvent.click(screen.getByText("An oracle"));
    expect(JSON.parse(localStorage.getItem("defigrail_progress") || "{}").demo).toBeUndefined();
  });
});
```

- [ ] **Step 9: Run test to verify it fails**

Run: `npm test -- components/topic/TopicCheck.test.tsx`
Expected: FAIL — `Failed to resolve import "./TopicCheck"`.

- [ ] **Step 10: Write the component**

Create `components/topic/TopicCheck.tsx`. It deliberately shows all questions at once rather than paging like `QuizClient` — this is a 2–3 question check at the end of a read, not a quiz run.

```tsx
"use client";
import { useState } from "react";
import type { QuizQuestion } from "@/lib/quiz";
import { useProgress } from "@/lib/use-progress";

export default function TopicCheck({ slug, questions }: { slug: string; questions: QuizQuestion[] }) {
  const { isRead, toggle } = useProgress();
  const [picked, setPicked] = useState<Record<string, number>>({});

  if (questions.length === 0) return null;

  const pick = (q: QuizQuestion, i: number) => {
    if (picked[q.id] !== undefined) return;
    const next = { ...picked, [q.id]: i };
    setPicked(next);
    const swept =
      questions.length === Object.keys(next).length &&
      questions.every((x) => next[x.id] === x.answer);
    if (swept && !isRead(slug)) toggle(slug);
  };

  return (
    <section className="topic-check">
      <div className="topic-section-label">Check yourself</div>
      {questions.map((q) => {
        const chose = picked[q.id];
        return (
          <div className="topic-check-q" key={q.id}>
            <p className="topic-check-prompt">{q.prompt}</p>
            <div className="topic-check-options">
              {q.options.map((opt, i) => {
                const state =
                  chose === undefined ? "" : i === q.answer ? " correct" : i === chose ? " wrong" : " dimmed";
                return (
                  <button
                    key={i}
                    type="button"
                    className={`quiz-option${state}`}
                    disabled={chose !== undefined}
                    onClick={() => pick(q, i)}
                  >
                    <span className="quiz-option-key">{String.fromCharCode(65 + i)}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            {chose !== undefined && (
              <div className="topic-check-explain">
                <span className={`quiz-verdict ${chose === q.answer ? "ok" : "no"}`}>
                  {chose === q.answer ? "Correct" : "Not quite"}
                </span>
                <p>{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
```

- [ ] **Step 11: Run test to verify it passes**

Run: `npm test -- components/topic/TopicCheck.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 12: Add the styles**

`.quiz-option` and `.quiz-verdict` are reused from the existing quiz styles, so only the wrapper is new. Append to `app/globals.css`:

```css
/* ─── TOPIC CHECK ─── */
.topic-check{margin-top:34px;padding-top:26px;border-top:1px solid rgba(26,24,19,.12)}
.topic-check-q{margin-bottom:26px}
.topic-check-q:last-child{margin-bottom:0}
.topic-check-prompt{font-family:var(--font-serif);font-size:16.5px;line-height:1.5;margin:0 0 12px}
.topic-check-options{display:flex;flex-direction:column;gap:8px}
.topic-check-explain{margin-top:12px;padding-left:14px;border-left:2px solid rgba(26,24,19,.16)}
.topic-check-explain p{font-size:14px;line-height:1.6;color:rgba(26,24,19,.75);margin:6px 0 0}
```

- [ ] **Step 13: Mount it on the topic page**

In `app/learn/[slug]/page.tsx`, add the imports:

```tsx
import TopicCheck from "@/components/topic/TopicCheck";
import { questionsForTopic } from "@/lib/quiz";
```

and render it after the `prose-paper` block, before the "Connected concepts" section:

```tsx
<TopicCheck slug={topic.meta.slug} questions={questionsForTopic(topic.meta.slug)} />
```

- [ ] **Step 14: Verify end to end**

Run: `npm run build && npm test`, then `npm run dev`. Open `/learn/uniswap-v2`, answer both questions correctly, and confirm the "Mark as read" control below flips to "Marked as read" without being clicked. Then open `/learn/bridges` (no questions) and confirm nothing extra renders.

- [ ] **Step 15: Commit**

```bash
git add lib/quiz.ts lib/quiz.test.ts content/quiz.json components/topic/TopicCheck.tsx components/topic/TopicCheck.test.tsx "app/learn/[slug]/page.tsx" app/globals.css
git commit -m "feat: end-of-topic comprehension check that gates read status

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 4: The TradFi index

`tradfiAnchor` is on nearly every topic, it is in the site's headline, and no surface indexes by it. This task is a pure derivation — no new content, no new data.

**Files:**
- Create: `lib/tradfi.ts`
- Create: `lib/tradfi.test.ts`
- Create: `app/tradfi/page.tsx`
- Modify: `components/SiteNav.tsx:6-14`
- Modify: `app/sitemap.ts:6`
- Modify: `app/globals.css` (append)

**Interfaces:**
- Consumes: `loadTopics(): Topic[]` from `lib/mdx.ts` — each `Topic.meta` has `slug`, `title`, `tradfiAnchor?`, `summary`.
- Produces: `export type TradfiEntry = { anchor: string; topics: { slug: string; name: string; summary: string }[] }` and `export function tradfiIndex(): TradfiEntry[]`.

- [ ] **Step 1: Write the failing test**

> **Do not import `lib/topic-cards.ts` from `lib/tradfi.ts`.** That file starts with
> `import "server-only"`, which throws outside a React Server Component — vitest resolves
> without the `react-server` condition, so any test that reaches it fails on import. No
> existing test imports it, and this task must not be the first. Derive from `loadTopics()`
> in `lib/mdx.ts` instead, which `lib/mdx.test.ts`, `lib/tracks.test.ts` and
> `lib/quiz.test.ts` already import under jsdom without issue.

Create `lib/tradfi.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { tradfiIndex } from "./tradfi";
import { loadTopics } from "./mdx";

describe("tradfiIndex", () => {
  const index = tradfiIndex();

  it("returns at least one entry", () => {
    expect(index.length).toBeGreaterThan(0);
  });

  it("skips topics with no tradfiAnchor", () => {
    const withAnchor = loadTopics().filter((t) => (t.meta.tradfiAnchor ?? "").trim() !== "").length;
    const listed = index.reduce((n, e) => n + e.topics.length, 0);
    expect(listed).toBe(withAnchor);
  });

  it("is sorted alphabetically by anchor", () => {
    const anchors = index.map((e) => e.anchor);
    expect(anchors).toEqual([...anchors].sort((a, b) => a.localeCompare(b)));
  });

  it("groups topics that share an anchor into one entry", () => {
    const anchors = index.map((e) => e.anchor);
    expect(new Set(anchors).size).toBe(anchors.length);
  });

  it("every listed topic carries a slug, name and summary", () => {
    for (const entry of index)
      for (const t of entry.topics) {
        expect(t.slug).toMatch(/^[a-z0-9-]+$/);
        expect(t.name.length).toBeGreaterThan(0);
        expect(t.summary.length).toBeGreaterThan(0);
      }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/tradfi.test.ts`
Expected: FAIL — `Failed to resolve import "./tradfi"`.

- [ ] **Step 3: Write the lib**

Create `lib/tradfi.ts`:

```ts
import { loadTopics } from "@/lib/mdx";

export type TradfiEntry = {
  anchor: string;
  topics: { slug: string; name: string; summary: string }[];
};

/**
 * The reverse index: TradFi instrument or desk → the DeFi topics that map to it.
 * Topics with no tradfiAnchor are omitted entirely rather than bucketed under
 * an "Other" heading — an empty anchor is missing metadata, not a category.
 *
 * Sourced from loadTopics() rather than topicCards(): the latter is guarded by
 * `import "server-only"` and cannot be imported from a vitest test.
 */
export function tradfiIndex(): TradfiEntry[] {
  const byAnchor = new Map<string, TradfiEntry["topics"]>();
  for (const t of loadTopics()) {
    const anchor = (t.meta.tradfiAnchor ?? "").trim();
    if (!anchor) continue;
    const bucket = byAnchor.get(anchor) ?? [];
    bucket.push({ slug: t.meta.slug, name: t.meta.title, summary: t.meta.summary });
    byAnchor.set(anchor, bucket);
  }
  return [...byAnchor.entries()]
    .map(([anchor, topics]) => ({ anchor, topics }))
    .sort((a, b) => a.anchor.localeCompare(b.anchor));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/tradfi.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Build the page**

Create `app/tradfi/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { tradfiIndex } from "@/lib/tradfi";

export const metadata: Metadata = {
  title: "TradFi → DeFi",
  description:
    "The reverse index: start from the TradFi instrument you already know and find the DeFi primitive that maps to it.",
};

export default function TradfiPage() {
  const index = tradfiIndex();
  return (
    <div style={{ padding: "40px 0 60px" }}>
      <div className="page-head">
        <div className="page-head-h1">TradFi → DeFi</div>
        <div className="page-head-sub">
          You already know the instrument. Start there. Every entry is a TradFi
          anchor and the DeFi primitives that rhyme with it.
        </div>
      </div>
      <div className="tradfi-index">
        {index.map((entry) => (
          <section className="tradfi-entry" key={entry.anchor}>
            <h2 className="tradfi-anchor">{entry.anchor}</h2>
            <div className="tradfi-topics">
              {entry.topics.map((t) => (
                <Link className="tradfi-topic" href={`/learn/${t.slug}`} key={t.slug}>
                  <span className="tradfi-topic-name">{t.name} ↗</span>
                  <span className="tradfi-topic-sum">{t.summary}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Add the styles**

Append to `app/globals.css`:

```css
/* ─── TRADFI INDEX ─── */
.tradfi-index{display:flex;flex-direction:column;gap:2px}
.tradfi-entry{padding:20px 0;border-top:1px solid rgba(26,24,19,.12)}
.tradfi-anchor{font-family:var(--font-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:rgba(26,24,19,.5);font-weight:500;margin:0 0 12px}
.tradfi-topics{display:flex;flex-direction:column;gap:10px}
.tradfi-topic{display:block;text-decoration:none;color:#1a1813;border-left:2px solid rgba(26,24,19,.14);padding-left:14px;transition:border-color .15s}
.tradfi-topic:hover{border-left-color:#1a1813}
.tradfi-topic-name{display:block;font-family:var(--font-serif);font-size:17px;font-weight:500}
.tradfi-topic-sum{display:block;font-size:13.5px;line-height:1.5;color:rgba(26,24,19,.6);margin-top:3px;max-width:640px}
```

- [ ] **Step 7: Wire up nav and sitemap**

In `components/SiteNav.tsx`, insert into `TABS` directly after the Learn entry:

```tsx
  { href: "/tradfi", label: "TradFi", key: "tradfi" },
```

In `app/sitemap.ts`, add `"/tradfi"` to the `staticRoutes` array.

- [ ] **Step 8: Check the nav does not overflow**

That makes eight tabs plus the logo and the search button. Run `npm run dev`, open the site at a 1280px viewport and again at 1024px, and confirm the nav row does not wrap or clip. If it does, shorten the label to `TradFi` (already short) or reduce `.nav-link` horizontal padding from `12px` to `10px` in `app/globals.css` — do not add a hamburger.

- [ ] **Step 9: Verify**

Run: `npm run build && npm test`
Expected: both pass. Open `/tradfi` and confirm entries are alphabetical and every link resolves.

- [ ] **Step 10: Commit**

```bash
git add lib/tradfi.ts lib/tradfi.test.ts app/tradfi/page.tsx components/SiteNav.tsx app/sitemap.ts app/globals.css
git commit -m "feat: TradFi to DeFi reverse index page

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 5: The plain-English layer

`app/playground/page.tsx` already carries excellent `layman` copy for every chart. The topic pages — where the reading actually happens — have none. This ships the container; Task 7 seeds the copy.

**Files:**
- Create: `components/topic/Layman.tsx`
- Create: `components/topic/Layman.test.tsx`
- Modify: `app/learn/[slug]/page.tsx` (import + component map)
- Modify: `app/globals.css` (append)

**Interfaces:**
- Consumes: nothing.
- Produces: `export default function Layman({ children }: { children: React.ReactNode })`. Task 7 writes `<Layman>` blocks into MDX bodies.

- [ ] **Step 1: Write the failing test**

Create `components/topic/Layman.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Layman from "./Layman";

describe("Layman", () => {
  it("renders a disclosure summary", () => {
    render(<Layman>plain words here</Layman>);
    expect(screen.getByText(/in plain english/i)).toBeInTheDocument();
  });

  it("keeps its content in the DOM while collapsed", () => {
    render(<Layman>plain words here</Layman>);
    expect(screen.getByText(/plain words here/)).toBeInTheDocument();
  });

  it("renders collapsed by default", () => {
    const { container } = render(<Layman>plain words here</Layman>);
    expect(container.querySelector("details")?.open).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/topic/Layman.test.tsx`
Expected: FAIL — `Failed to resolve import "./Layman"`.

- [ ] **Step 3: Write the component**

Create `components/topic/Layman.tsx`. Native `<details>` gives free keyboard access, correct semantics, and zero JavaScript — do not reimplement this with `useState`.

```tsx
export default function Layman({ children }: { children: React.ReactNode }) {
  return (
    <details className="layman">
      <summary className="layman-summary">In plain English</summary>
      <div className="layman-body">{children}</div>
    </details>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/topic/Layman.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Add the styles**

Append to `app/globals.css`:

```css
/* ─── LAYMAN ─── */
.layman{border:1px dashed rgba(26,24,19,.24);border-radius:8px;padding:12px 16px;margin:20px 0;background:rgba(26,24,19,.02)}
.layman-summary{font-family:var(--font-mono);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:rgba(26,24,19,.5);cursor:pointer;list-style:none}
.layman-summary::-webkit-details-marker{display:none}
.layman-summary::before{content:"+ ";font-weight:600}
.layman[open] .layman-summary::before{content:"− "}
.layman-summary:hover{color:#1a1813}
.layman-body{margin-top:12px;font-family:var(--font-serif);font-size:16px;line-height:1.65;color:rgba(26,24,19,.82)}
.layman-body p{margin:0 0 10px}
.layman-body p:last-child{margin-bottom:0}
```

- [ ] **Step 6: Register it in the MDX map**

In `app/learn/[slug]/page.tsx`, add `import Layman from "@/components/topic/Layman";` and extend the map:

```tsx
components={{ GlossaryTerm, Caveat, Layman, ILCurve, KinkedRate, RangeLiquidity, PTDecay, PriceImpact }}
```

- [ ] **Step 7: Prove it renders**

Add to `content/topics/impermanent-loss.mdx`, right after the `## 01 · Concept` prose. This copy is lifted from the existing `TOOLS[0].layman` string in `app/playground/page.tsx` so the two surfaces stay in one voice:

```mdx
<Layman>
If you deposit two assets into a pool and their prices drift apart, you can end
up with less value than if you'd just held them in your wallet. That gap is the
loss. It's called "impermanent" because it shrinks back toward zero if prices
return to where you started — and the trading fees you earn can offset whatever
is left. Withdraw before that happens and it stops being impermanent.
</Layman>
```

Run: `npm run build && npm run dev`, open `/learn/impermanent-loss`, confirm the block is collapsed, opens on click, and opens on Enter when focused by keyboard.

- [ ] **Step 8: Commit**

```bash
git add components/topic/Layman.tsx components/topic/Layman.test.tsx "app/learn/[slug]/page.tsx" app/globals.css content/topics/impermanent-loss.mdx
git commit -m "feat: collapsible plain-English layer on topic pages

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 6: Search the topic bodies, not just the titles

⌘K currently matches `name`, `summary` and `tradfi` only, so a reader searching a *symptom* ("why did my LP lose money", "sandwich") gets nothing. The bodies total ~21,500 words; they must not ride along in the root layout's RSC payload on every route, so they move to one statically-generated route the palette fetches on first open.

**Files:**
- Create: `lib/search-index.ts`
- Create: `lib/search-index.test.ts`
- Create: `app/search-index/route.ts`
- Modify: `components/SearchPalette.tsx`

**Interfaces:**
- Consumes: `loadTopics()` from `lib/mdx.ts` (each `Topic` has `meta` and a raw MDX `body` string).
- Produces: `export function stripMdx(body: string): string`, `export type SearchDoc = { slug: string; name: string; era: string; tradfi: string; summary: string; text: string }`, `export function searchDocs(): SearchDoc[]`, and a `GET /search-index` route returning `SearchDoc[]` as JSON.

- [ ] **Step 1: Write the failing test**

Create `lib/search-index.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { stripMdx, searchDocs } from "./search-index";

describe("stripMdx", () => {
  it("drops fenced code blocks entirely", () => {
    expect(stripMdx("before\n\n```text\nP(i) = 1.0001\n```\n\nafter")).toBe("before after");
  });
  it("drops JSX tags but keeps their inner text", () => {
    expect(stripMdx('<Caveat kind="misuse">not free</Caveat>')).toBe("not free");
  });
  it("drops self-closing chart elements", () => {
    expect(stripMdx("text <RangeLiquidity /> more")).toBe("text more");
  });
  it("reduces a link to its label", () => {
    expect(stripMdx("see [Impermanent Loss](/learn/impermanent-loss) for more")).toBe(
      "see Impermanent Loss for more"
    );
  });
  it("drops heading and emphasis marks", () => {
    expect(stripMdx("## 01 · Concept\n\n**Ticks:** price space")).toBe("01 · Concept Ticks: price space");
  });
  it("keeps hyphenated words intact", () => {
    expect(stripMdx("a mint-burn spiral")).toBe("a mint-burn spiral");
  });
});

describe("searchDocs", () => {
  const docs = searchDocs();
  it("returns one doc per topic", () => {
    expect(docs.length).toBeGreaterThanOrEqual(50);
  });
  it("carries searchable body text", () => {
    const uni = docs.find((d) => d.slug === "uniswap-v2");
    expect(uni?.text.toLowerCase()).toContain("constant");
  });
  it("contains no markdown fences in the text", () => {
    for (const d of docs) expect(d.text).not.toContain("```");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/search-index.test.ts`
Expected: FAIL — `Failed to resolve import "./search-index"`.

- [ ] **Step 3: Write the lib**

Create `lib/search-index.ts`. Order matters: fences first (they contain characters every later rule would mangle), then JSX, then links, then leftover markdown punctuation. The `-` character is deliberately absent from the punctuation class so hyphenated terms survive.

```ts
import { loadTopics } from "@/lib/mdx";

export type SearchDoc = {
  slug: string;
  name: string;
  era: string;
  tradfi: string;
  summary: string;
  text: string;
};

/** Reduce an MDX body to plain searchable prose. */
export function stripMdx(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, " ")            // fenced code
    .replace(/<[^>]+>/g, " ")                    // JSX tags, self-closing included
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")   // links and images → their label
    .replace(/[#*_`>|]+/g, " ")                  // leftover markdown punctuation
    .replace(/\s+/g, " ")
    .trim();
}

export function searchDocs(): SearchDoc[] {
  return loadTopics().map((t) => ({
    slug: t.meta.slug,
    name: t.meta.title,
    era: t.meta.era,
    tradfi: t.meta.tradfiAnchor ?? "",
    summary: t.meta.summary,
    text: stripMdx(t.body),
  }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/search-index.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Add the route**

Create `app/search-index/route.ts`:

```ts
import { searchDocs } from "@/lib/search-index";

// Statically generated at build and served from the CDN — the palette fetches
// it once, on first open, so ~130KB of body text never rides the RSC payload
// of every page in the root layout.
export const dynamic = "force-static";

export function GET() {
  return Response.json(searchDocs());
}
```

Check `node_modules/next/dist/docs/` for this Next version's route-handler and static-generation conventions before committing — the `dynamic` export contract is exactly the kind of thing that has moved.

- [ ] **Step 6: Verify the route**

Run: `npm run dev`, then in another shell:

```bash
curl -s localhost:3000/search-index | head -c 400
```

Expected: a JSON array whose first object has `slug`, `name`, and a `text` field of prose.

- [ ] **Step 7: Teach the palette to use it**

In `components/SearchPalette.tsx`:

Add to the type block near the top:

```tsx
type SearchDoc = SearchTopic & { text: string };
```

Add state alongside the existing `useState` calls:

```tsx
const [docs, setDocs] = useState<SearchDoc[] | null>(null);
```

Extend the existing `useEffect` that runs on `open` so it fetches once, and never blocks the palette from opening:

```tsx
useEffect(() => {
  if (!open || docs) return;
  fetch("/search-index")
    .then((r) => (r.ok ? r.json() : null))
    .then((d: SearchDoc[] | null) => d && setDocs(d))
    .catch(() => { /* fall back to metadata-only search */ });
}, [open, docs]);
```

Replace **only the `for (const t of topics)` loop** inside the existing `results` memo, leaving the `for (const g of GLOSSARY)` loop and the closing `out.slice(0, 8)` exactly as they are. Body hits are appended before the glossary loop runs, so ranking becomes: topic metadata, then topic body, then glossary. A body hit shows the surrounding sentence so the reader can see *why* it matched:

```tsx
const source: SearchDoc[] = docs ?? topics.map((t) => ({ ...t, text: "" }));
const bodyHits: Result[] = [];
for (const t of source) {
  const meta = `${t.name} ${t.summary} ${t.tradfi}`.toLowerCase();
  if (meta.includes(s)) {
    out.push({ type: "topic", slug: t.slug, name: t.name, meta: ERA_LABELS[t.era] ?? t.era });
    continue;
  }
  const i = t.text.toLowerCase().indexOf(s);
  if (i !== -1) {
    const from = Math.max(0, i - 40);
    bodyHits.push({
      type: "topic",
      slug: t.slug,
      name: t.name,
      meta: `…${t.text.slice(from, i + s.length + 60).trim()}…`,
    });
  }
}
out.push(...bodyHits);
```

Add `docs` to the memo's dependency array alongside `q` and `topics`.

- [ ] **Step 8: Verify the fix end to end**

Run: `npm run dev`, press ⌘K, and search each of these. Every one returns nothing today:

- `sandwich` → should surface `mev`
- `loss-versus-rebalancing` → should surface `uniswap-v3`
- `black thursday` → nothing yet; it will hit once Task 7 seeds the liquidations caveat
- `oracle` → should surface several topics

Then reload with the network tab open and confirm `/search-index` is requested **only after** the first ⌘K, not on page load.

- [ ] **Step 9: Run the full suite and build**

Run: `npm run build && npm test`
Expected: both pass.

- [ ] **Step 10: Commit**

```bash
git add lib/search-index.ts lib/search-index.test.ts app/search-index/route.ts components/SearchPalette.tsx
git commit -m "feat: full-text topic search via a lazily-fetched static index

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 7: Seed the caveats

Content, not code. Every caveat below is verbatim from the gap analysis at
`docs/product/2026-09-06-gaps-caveats-features.md`, which has already been reviewed.

**Files:**
- Modify: `content/topics/uniswap-v2.mdx`, `uniswap-v3.mdx`, `impermanent-loss.mdx`, `interest-rate-models.mdx`, `liquidations.mdx`, `oracles.mdx`, `stablecoin-design.mdx`, `perpetual-futures.mdx`

**Interfaces:**
- Consumes: `<Caveat kind={...} asOf={...} src={...}>` from Task 1; the `sources` / `lastVerified` frontmatter fields from Task 2.
- Produces: no code. Task 6's search index picks the new prose up automatically.

- [ ] **Step 1: Fact-check every figure before writing a line**

Four caveats below carry dates and dollar amounts written from memory:

- MakerDAO Black Thursday — 12 Mar 2020, roughly $8.3M of unbacked DAI from zero-bid auctions, recapitalised by an MKR auction.
- USDC depeg — 11 Mar 2023, roughly $3.3B of reserves at SVB, USDC traded near $0.87.

Verify both against primary sources (the Maker Foundation post-mortem and Circle's own statement) and correct any number that does not survive. **A wrong figure on a site whose pitch is verifiability is a self-inflicted wound.** If a number cannot be confirmed, cut the number and keep the mechanism.

- [ ] **Step 2: Place the caveats**

House rule: a caveat sits immediately after the prose it qualifies, never stacked at the end of the file, and no section carries more than two.

**`uniswap-v2.mdx`** — the `misuse` caveat is already in place from Task 1. Add to `## 02 · Mechanics`:

```mdx
<Caveat kind="breaks">
k is only constant in the fee-free idealisation. With the 0.30% fee, reserves
after every swap satisfy k′ ≥ k — the invariant grows, and that growth *is* the
LP fee. Fee-on-transfer and rebasing tokens break the pair accounting outright,
which is why Uniswap's own docs warn against them.
</Caveat>
```

**`impermanent-loss.mdx`** — add after `## 01 · Concept`:

```mdx
<Caveat kind="misuse">
"Impermanent" is marketing. If you withdraw at a diverged price, the loss is
realised and permanent. It is impermanent only if the price returns *and* you
are still in the pool.
</Caveat>
```

and after the formula section:

```mdx
<Caveat kind="breaks">
The formula prices divergence against a HODL baseline. It ignores both the fees
you earned and the actual mechanism: arbitrageurs, not price movement.
Loss-versus-rebalancing (LVR) prices what arbitrageurs take from you per block,
and it is larger.
</Caveat>
```

**`uniswap-v3.mdx`** — add to `## 01 · Concept`:

```mdx
<Caveat kind="misuse">
"~4000× capital efficiency" is the number for a ±0.05% band that essentially
never holds outside a stable pair. Efficiency and time-in-range trade off
directly; there is no free multiplier.
</Caveat>
```

and to `## 04 · Edge cases & risks`:

```mdx
<Caveat kind="breaks">
A quoted v3 fee APR assumes the price stays in range. Out of range is 0% and
100% of one asset. Always ask what fraction of the window the position was
actually in range.
</Caveat>
```

**`interest-rate-models.mdx`** — add to the section that states the kink parameters. Replace the `src` URL with whichever live-parameters page survived Task 2 Step 8:

```mdx
<Caveat kind="stale" asOf="2026-09-06" src="https://aave.com/docs">
Base 2%, kink 80%, slope₁ 10% and slope₂ 75% are illustrative. Aave and Compound
have re-parameterised these repeatedly, per asset, by governance vote. Check the
live params before quoting them anywhere that matters.
</Caveat>
```

and:

```mdx
<Caveat kind="misuse">
Utilization near 100% is not insolvency. It means withdrawals are blocked until
the rate pulls new supply in. Illiquidity ≠ insolvency, and conflating the two
is how an on-chain bank run starts.
</Caveat>
```

**`liquidations.mdx`**:

```mdx
<Caveat kind="breaks">
Liquidation does not happen at the liquidation threshold. It happens when a bot
finds it profitable after gas and slippage on the seized collateral. Bad debt
lives in that gap.
</Caveat>
```

```mdx
<Caveat kind="real">
Black Thursday, 12 March 2020: gas spiked, one keeper bid, and Maker's
collateral auctions cleared near zero — leaving roughly $8.3M of DAI unbacked,
later recapitalised by an MKR auction. The liquidation engine was correct. The
liveness assumption underneath it was not.
</Caveat>
```

**`oracles.mdx`**:

```mdx
<Caveat kind="breaks">
A TWAP is not manipulation-proof; it converts manipulation into a *financing*
problem. The cost is the capital needed to hold the price off for the window,
and deep borrow markets make that capital rentable.
</Caveat>
```

```mdx
<Caveat kind="misuse">
A feed with a heartbeat and a deviation threshold is stale *by design* up to
that threshold. It is not a live price, and that gap is exactly where the
exploit sits.
</Caveat>
```

**`stablecoin-design.mdx`**:

```mdx
<Caveat kind="misuse">
A peg is not held by the design doc; it is held by whoever can redeem at par.
Ask: who can redeem, for what, in what size, on which day? If the answer is
"nobody, but there's an arbitrage incentive", it is a confidence peg.
</Caveat>
```

```mdx
<Caveat kind="real">
USDC, 11 March 2023: roughly $3.3B of reserves stranded at Silicon Valley Bank,
and USDC traded to about $0.87 despite being fully backed. Backing is not a peg
when redemption is closed for a weekend.
</Caveat>
```

**`perpetual-futures.mdx`**:

```mdx
<Caveat kind="misuse">
Funding is not a protocol fee; it is a transfer between longs and shorts. And it
does not force convergence — it makes divergence expensive to hold.
</Caveat>
```

- [ ] **Step 3: Add one `check` caveat**

Every topic should eventually carry one; seed a single exemplar in `liquidations.mdx` so the pattern is established for later writers:

```mdx
<Caveat kind="check" src="https://defillama.com/protocol/aave">
Verify it yourself: open any Aave market on DefiLlama, compare the listed
liquidation threshold against the on-chain `getReserveConfigurationData` call in
the pool contract on Etherscan. If they disagree, the aggregator is stale — trust
the contract.
</Caveat>
```

- [ ] **Step 4: Fill in the remaining frontmatter**

Add `lastVerified: "2026-09-06"` to all eight files, and a `sources` block to the five that Task 2 did not cover (`uniswap-v3`, `liquidations`, `oracles`, `stablecoin-design`, `perpetual-futures`). Open every URL before committing, per Task 2 Step 8.

- [ ] **Step 5: Build and read every page**

Run: `npm run build && npm test`
Expected: both pass — a malformed `<Caveat>` tag or a bad `sources` entry fails the build, which is the point.

Then open all eight pages in `npm run dev` and read them top to bottom. Check three things: no section carries more than two caveats; no caveat repeats a sentence from the prose directly above it; the glossary auto-links inside caveat bodies (the Task 1 Step 6 fix).

- [ ] **Step 6: Commit**

```bash
git add content/topics/
git commit -m "content: seed typed caveats and primary sources across eight core topics

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Out of scope — follow-up plans

Each of these is its own plan, because each is an independent subsystem that ships working software on its own:

| Deferred | Why it is a separate plan |
|---|---|
| **DeFi Daily** (`/daily`) | New route, new date-keyed content pipeline, needs a seeding strategy and a rotation rule. The single highest-leverage retention feature — write this plan next. |
| **Post-mortems track** (8 case studies) | Pure content at ~1,200 words each, plus one new track in `content/tracks.json`. Needs its own research and fact-check pass. |
| **Liquidation simulator** | New interactive component with its own math module and test suite; parallels the existing `components/charts/` pattern but is a bigger surface than any chart there. |
| **Depth pass on the 12 core topics** | Ongoing editorial work — worked examples and failure-mode sections. This plan builds the containers; that one fills them. |
| **Real-pool data in the playground** | Needs a live data source and a caching story, which overlaps the existing `lib/news/` fetch layer. Not a component change. |
| **Spaced repetition** | Depends on the question bank being several times larger than 26. Blocked on content, not code. |
| **Accounts, wallet-connect, certificates** | Explicitly skipped. Nothing here needs a server-side user. |

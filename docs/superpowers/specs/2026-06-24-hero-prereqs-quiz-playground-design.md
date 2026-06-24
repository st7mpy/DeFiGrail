# DeFiGrail — Hero fix · Prereqs · Quiz · Playground context

**Date:** 2026-06-24
**Status:** Approved (design), pending spec review
**Scope:** Four incremental features on the existing Next.js 16 platform. No schema/DB changes.

## Goals

1. Fix the hero pixel-assembly so letters are cohesive and edges connect.
2. Add a clickable prerequisites section to topic pages.
3. Add a standalone `/quiz` page with 20 mixed-type questions and instant feedback.
4. Add a layperson context paragraph beside each playground graph.

---

## 1 · Hero animation — cohesive pixel-assembly

**Component:** `components/home/HeroPixels.tsx` + `.hero-pixels` rules in `app/globals.css`.

**Root cause of the fragmentation (observed in screenshot):** the canvas samples the
glyph bitmap on a 5px grid drawing 4px squares (1px gaps → dots don't touch), uses a
high alpha cutoff (`>130`) that drops anti-aliased stroke edges, and `ctx.fillText`
ignores the h1's `-0.035em` letter-spacing so the mask is looser than the real heading.
At 84px this reads as a perforated dot-matrix stencil rather than solid letters.

**Changes (concept unchanged — particles still assemble into the headline):**

- **Seamless grain:** sample `step = 4`, square `sz = step` (4) so squares tile
  edge-to-edge. Finer grid → smooth curves, connected strokes.
- **Edge fill:** lower alpha threshold to `~90` to capture anti-aliased edge pixels.
- **Match the heading:** set `ctx.letterSpacing` from `getComputedStyle(h1).letterSpacing`
  (guarded — the property is recent; skip if unsupported) so the assembled mask aligns
  with the real `<h1>` for a clean crossfade.
- **Cohesive assembly:** particles originate from a shallow band just below their target
  (target.y + random offset) with small horizontal jitter and eased stagger, so the
  words visibly *assemble* rather than resolving from random noise.
- **Perfect freeze-frame:** on the final frame (`done`), `clearRect` and draw one crisp
  `fillText` of the headline before adding `.revealed`, so the crossfade moment is
  pixel-perfect.

**Unchanged:** reduced-motion + `<640px` fallback reveals the `<h1>` immediately; canvas
is absolutely positioned over the h1 box via `getBoundingClientRect` offsets; waits on
`document.fonts.ready`.

**Verification:** `tsc`, `next build`. Visual confirm by user on deploy (canvas animation
is not renderable in the local preview tool — known harness limitation).

---

## 2 · Prerequisites section on topic pages

**Data:** topic frontmatter already carries `prereqs: string[]` (build-validated to
resolve to real topic slugs by the `loadTopics` test). No data changes.

**Rendering:** near the top of the topic page (above or just under the title block, matching
the existing `related` treatment), render a block:

> **Before this, know:** `[chip → /learn/<slug>]` `[chip → /learn/<slug>]` …

- Each chip resolves slug → topic display name via the topic loader.
- Block renders nothing when `prereqs` is empty.
- Reuses existing chip/era-glyph styling where it fits; add minimal CSS only if needed.

**Verification:** existing `loadTopics` test already guarantees every `prereqs` slug
resolves, so chips cannot 404. `tsc` + build.

---

## 3 · `/quiz` — standalone page, 20 questions, instant feedback

**Nav:** add a "Quiz" tab to `components/SiteNav.tsx` (after Playground).

**Data:** `content/quiz.json` — exactly 20 questions:

```
{
  id: string,            // stable, e.g. "q01"
  type: "quant" | "theory" | "analytical",
  prompt: string,
  options: [string, string, string, string],   // exactly 4
  answer: number,        // index 0-3 into options
  explanation: string,   // shown after answering
  topic: string          // existing topic slug for the "Learn this" link
}
```

Mix across tracks; all three types represented. Quant questions present numeric answers as
multiple-choice options (no free numeric entry — per the chosen instant-feedback model).

**Components:**
- `app/quiz/page.tsx` — server component, sets `metadata`, imports the JSON, renders
  `<QuizClient questions={...} />`.
- `components/quiz/QuizClient.tsx` — client component, one question at a time:
  - prompt + type label + 4 option buttons
  - on select: lock the choice, highlight correct/incorrect, reveal explanation +
    "Learn this →" link to `/learn/<topic>`, show "Next"
  - progress indicator "n / 20", running score
  - final results screen: total score, per-type breakdown, "Retake"
  - persist best score to `localStorage` (key e.g. `dg:quiz-best`), consistent with the
    existing reading-progress pattern in `lib/use-progress.ts`

**Styling:** new `.quiz-*` rules in `globals.css`, paper-terminal aesthetic consistent with
the rest of the site.

**Tests:** `lib/quiz.test.ts`:
- exactly 20 questions
- every question has exactly 4 options
- `answer` is an integer in `[0,3]`
- `topic` resolves to a real loaded topic slug
- all three `type` values appear at least once
- `id`s are unique

---

## 4 · Playground — layperson context beside each graph

**File:** `app/playground/page.tsx` + `.pg-*` rules in `globals.css`.

- Add a `layman: string` field to each entry in the `TOOLS` array — plain-English meaning
  of what the curve implies for a non-technical reader (one short paragraph per tool).
- Restructure each `.pg-tool` body into a two-column layout: **chart left, context right**.
  Collapses to a single column (context below chart) on narrow viewports.
- Keep the existing per-tool title, blurb, and "Open the full topic →" link.

**Verification:** `tsc` + build; layout sanity in the rendered DOM where checkable.

---

## Out of scope (YAGNI)

- No DB/schema changes; quiz state is client-side only.
- No new content tracks or topics.
- No per-topic quizzes (explicitly chose the standalone page).
- No free-text/numeric quiz input.
- Build-time FlexSearch index (P3.T14) remains deferred — unrelated.

## Cross-cutting verification

`tsc --noEmit` clean · full `next build` green · existing 81-test suite + new
`lib/quiz.test.ts` pass · then deploy to Vercel production and user does final visual
confirm of the hero animation, prereq chips, quiz flow, and playground layout.

## Execution note

Code edits and their git commits run on **Sonnet 4.6** (per user instruction); planning
artifacts (this spec, the implementation plan) authored on Opus.

# DeFiGrail launch video — plan v5

*45 seconds, cut for X. v5 records what actually came out of the capture pass — including four
things the earlier drafts had wrong, and two live-site bugs the capture surfaced.*

---

## Decisions locked

| | |
|---|---|
| **Length** | 45s |
| **Runway budget** | 12s — three atmospheric shots, kept |
| **Product shots** | Real screen capture. Never Runway. |
| **Audio** | Type + music, no voiceover |

**Why Runway never touches the product:** Gen-3/Gen-4 cannot render legible text or coherent
UI. This site's entire value is dense typographic content — formulas, prerequisite chains,
cited caveats. Hallucinated screens with garbled words read as vapourware to exactly the
audience being pitched. Runway does atmosphere, where it is genuinely strong.

---

## Narrative spine

1. DeFi is hard, and most explanations are hand-wavy or impenetrable.
2. **You already know the TradFi version of it.**
3. Every formula interactive, every idea in dependency order, and cited where it broke.
4. Free, live, go read it.

Beat 2 is the differentiator and it lands at 0:08. No other DeFi learning site makes that
claim, and it is defensible because the anchor metadata is on all 51 topics.

---

## Shot list — 10 shots, 45s

`[R]` Runway · `[C]` capture. Captured at **1440×810** (16:9 natively, no crop) at 2× scale.

| # | t | Src | Shot | Type |
|---|---|---|---|---|
| 1 | 0:00–0:04 | **R** | Icy fluid drifting across pale field, dissolving to white | — |
| 2 | 0:04–0:08 | **C** | Dissolve into live hero, aurora settled, headline holds | *(in frame)* |
| 3 | 0:08–0:20 | **C** | **The money shot.** One unbroken slow scroll on `/learn/uniswap-v3` | "You already know the TradFi version." |
| 4 | 0:20–0:25 | **C** | `/playground` — drag Concentrated Liquidity past its upper bound | "Every formula is a thing you can move." |
| 5 | 0:25–0:29 | **R** | Navy particles converging into a sparse lattice on snow | "In the order that makes sense." |
| 6 | 0:29–0:33 | **C** | `/graph` — drag a node, dependencies trace, physics settles | — |
| 7 | 0:33–0:37 | **C** | `/learn/liquidations` — the Black Thursday `real` caveat | "Including where it broke." |
| 8 | 0:37–0:40 | **C** | `/quiz` — Core → Expert toggle, one scenario question | "And whether you got it." |
| 9 | 0:40–0:43 | **R** | Pull back through pale haze, brightening to white | — |
| 10 | 0:43–0:45 | **C** | Static hero, aurora only. URL. | **defigrail.xyz** |

### Shot 3 is the whole pitch — measured offsets

`/learn/uniswap-v3` at **1440×810**. Measured: at `scrollY 300` the TradFi anchor, both
prereq chips *and* the first caveat are all on screen at once.

```
HOLD  scrollY 300           ~4s   the whole thesis in one static frame
                                    y  84  TradFi chip — "Limit-order market making / short straddle"
                                    y 207  prereqs — "Uniswap v2" + "Impermanent Loss"
                                    y 497  caveat (misuse) — the ~4000x capital-efficiency one
SCROLL 300 → 1100           ~8s   ease-in-out, landing on the RangeLiquidity chart at y 187
```

Open held, then move. The held frame is the pitch; the scroll proves it keeps going.

**Two corrections this measurement caught.** v1 put this on `/learn/uniswap-v2`, which is
first in Foundations and has *no prereqs* — the chips would never have rendered. And v2's
`248 → 1287` overshot both ends: 248 wastes 4s on whitespace above the anchor, and 1287 pushes
the chart past the bottom edge.

### Shot 7 — measured offsets

`/learn/liquidations`, three caveats on the page:

```
document offsets      capture scrollY
1206  breaks                 —
1677  real  ← the shot     1417   frames it at y 260, fully in shot at 1440x810
2083  check                  —
```

Scroll to **1417** and hold. (1677 is where the caveat *sits*; scrolling there would push it
off the top edge — the framing offset is 1417.) That caveat is the single most persuasive frame in the product: a
dated, sourced, real-money failure, not a definition.

---

## Runway plates — GENERATED ✅

**The workspace is on Runway's free plan: every video model is gated** (`availableVideoModels`
came back empty). So the three atmospheric beats are **high-resolution stills, animated with
slow transforms in the edit** — which for soft drifting gradients is the better technique
anyway: fully controllable, no temporal flicker, no AI video artifacts.

Generated at **2752×1536** (2K, 16:9) with `nano-banana-pro`, 20 credits each, 120 total.
Files in `assets/launch-video/` (git-ignored — regenerable from the prompts below).

| File | Shot | What landed | Motion in the edit |
|---|---|---|---|
| `shot1-opener-a.png` | 1 | Icy band across upper third, clean white lower half | Slow drift left→right + gentle scale 1.00→1.06 |
| `shot1-opener-b.png` | 1 | alt variant | — |
| `shot5-lattice-a.png` | 5 | Navy dot grid, connected lattice cluster top-right, 2/3 empty left | **Pan left→right into the lattice** |
| `shot9-closer-a.png` | 9 | Soft blue field, bright centre | Slow pull-back + exposure ramp toward white |

**Shot 5 came out better than specified.** The lattice cluster is top-right with two-thirds
empty on the left, so a slow pan from the empty side *into* the connected cluster literally
performs the "in the order that makes sense" beat. Use that asymmetry; do not centre it.

**Shot 9 is more saturated than 1 and 5 — that is correct.** It is the *start* frame of a
brighten-to-white move. Ramp exposure up across its 3s so it lands on snow before cutting to
the hero, otherwise the 9→10 dissolve is a visible colour jump.

### Prompts used (reproducible)

Palette: snow `#FFFAFA`, navy `#000080`, icy `#ADD8E6`, slate `#6D8196`.

**Shot 1 — opener (4s)**
```
Soft icy blue liquid light drifting slowly across a pale off-white field,
gentle horizontal flow, dissolving toward white at the bottom edge.
Minimal, calm, no text, no objects. Slow drift, shallow depth.
```

**Shot 5 — lattice (4s)**
```
Tiny deep navy particles on a snow white field slowly converging into a
sparse connected lattice, thin lines forming between points.
Calm, precise, minimal. No text. Slow, deliberate motion.
```

**Shot 9 — closer (3s)**
```
Slow camera pull-back through pale blue atmospheric haze, brightening
to clean white. Empty, minimal, no objects, no text.
```

**Use image-to-video, not text-to-video, for shots 1 and 9.** Feed a still frame of the real
hero as the first frame. The generated motion then starts from the actual site colours, so
the 1→2 dissolve and the 9→10 landing blend instead of jump-cutting between two different
palettes. This is the single biggest quality lever available in Runway here.

**Settings:** 16:9, 5s each (trim), Gen-4. Generate 3–4 variants per prompt — hit rate on
"calm and minimal" is roughly 1 in 3, because these models default to drama. Reject any
variant that fills the frame; shots 1, 5 and 9 all need negative space for type.

---

## Capture — SHOT ✅

`node scripts/capture-launch.mjs [shot ...]` against a **production** build (`next start`, not
`next dev` — the dev overlay badge sits in frame). Eight files in `assets/launch-video/clips`,
all **1920×1080 H.264**, git-ignored and reproducible from the script.

| File | Shot | Length | How it was captured |
|---|---|---|---|
| `shot02-hero.mp4` | 2 | 6.5s | real-time — the flow cycles, the aurora drifts |
| `shot03-uniswap-v3.mp4` | 3 | 12.0s | frame-stepped, hold 300 → ease to 1100 |
| `shot04-playground-il.mp4` | 4 | 5.5s | frame-stepped, IL current price 2000 → 3000 |
| `shot04b-playground-range.mp4` | 4 alt | 6.5s | **recommended** — real slider drag, see below |
| `shot06-graph.mp4` | 6 | 4.9s | real-time — hover trace, drag, physics settle |
| `shot07-liquidations.mp4` | 7 | 4.0s | still at 1417, held |
| `shot08-quiz-expert.mp4` | 8 | 7.6s | real-time — Core → Expert switch |
| `shot10-hero-endcard.mp4` | 10 | 2.0s | still |

Clips run long on purpose. Trim to the shot list in the edit; the extra head and tail is
handle, not filler.

**Two capture techniques, and why each.** Text-dense shots (3, 4, 7) are *frame-stepped*:
screenshot at `deviceScaleFactor: 2`, one frame per scroll position, encoded at 30fps. That
gives a 2880×1620 source downscaled to 1080p, so the body copy stays crisp, and the scroll is
perfectly smooth because it is computed rather than performed. Shots whose motion is real —
a CSS animation cycle, a force simulation, a click transition — are captured through Chrome's
own screencast with true frame timestamps, so playback speed is real.

### Five things the plan had wrong, found by shooting it

1. **Shot 4 was specified as a drag; `ILCurve` has no drag.** It has two number inputs. Three
   *other* playground charts do have real `type="range"` sliders — including **Concentrated
   Liquidity**, which is the exact topic shot 3 spends twelve seconds explaining. `shot04b`
   drags its price slider past the upper bound, where the readout flips to `OUT OF RANGE —
   all token1`. That is a better shot than the IL one *and* it cuts directly out of shot 3.
   Both are captured; 4b is the recommendation.
2. **The live price ticker is on every page, not just `/news`.** It dates the video exactly
   the way `/news` does — which is why `/news` was cut. Hidden for shots 2, 4, 6 and 8. Shots
   3 and 7 are scrolled well past it, so their measured offsets are untouched.
3. **Shot 8 scrolled past its own subject.** The old recipe scrolled a page only 171px taller
   than the viewport, pushing the Core/Expert toggle off the top and pulling the footer in.
   The switch *is* the motion: hold at scrollY 40 (toggle at 187, card 278→760, footer at 850
   just out of frame) and click Expert. Core 28 / theory question → Expert 17 / a real quant
   scenario, in one cut.
4. **Graph node coordinates cannot be hardcoded.** The force layout settles somewhere
   different on every load, so the first capture dragged empty space. `ProtocolGraph` sets
   `cursor: pointer` on hover, which is its own hit test — the script ring-scans outward from
   centre and takes the first real hit. It lands on a hub node (Uniswap v2 both runs), whose
   hover traces ~12 dependencies in navy while the rest fades.
5. **Shot 4's framing buried the payoff.** `scrollIntoViewIfNeeded` left the `IL =` readout
   jammed on the bottom edge. Offsets are now measured off the real card geometry.

### Two live-site bugs the capture surfaced

Both are fixed in this commit — a video is a slow, careful look at your own product.

- **The sticky nav had no backdrop blur at all, in every browser that matters.** `globals.css`
  declared `backdrop-filter` then `-webkit-backdrop-filter`; lightningcss collapses that pair
  down to whichever comes *last*, so production shipped the `-webkit-` spelling alone, which
  Chrome ignores. The nav fell back to its `.88` background and scrolled body copy read
  straight through it — glaringly, in the middle of the money shot. Reproduced against
  lightningcss directly, independent of browser targets. Fix: standard property last.
- **The quiz Expert blurb said "Fifteen scenario problems"; the bank holds 17.** The count is
  already rendered on the toggle pill, so the fix was to delete the number from the prose
  rather than correct it. Same class of drift: the Impermanent Loss card said "Drag the price
  ratio" on a chart with no drag.

## Copy

Verified today: **51 topics · 12 tracks · 74 glossary terms · 45 quiz questions.**
Use at most two — a wall of stats reads as padding.

End card:
```
defigrail.xyz
free · no signup
```

---

## Assembly

- **Cuts:** hard throughout, except 1→2 (dissolve) and 9→10 (dissolve). Those two seams are
  where Runway meets reality and must blend.
- **Type:** JetBrains Mono, uppercase, wide tracking, navy on snow. Identical to the site.
- **Music:** one minimal track, slight build at shot 5, no drop. This is a reference tool,
  not a token launch.
- **Captions:** burn in. X autoplays muted.
- **Export:** 1920×1080 H.264. Cut 1:1 and 9:16 from the same timeline.

---

## Status

**Runway — done.** Free plan gates all video, so the three atmospheric beats shipped as 2K
stills to be animated with transforms in the edit. 380 of 500 credits remain.

**Capture — done.** Eight clips, 1920×1080, in `assets/launch-video/clips`, reproducible with
`node scripts/capture-launch.mjs`.

## Next

Assembly is the only step left: import the three plates, apply the transforms in the plate
table, cut against the eight clips, trim to the shot list. The 30s version drops shots 5 and 6.

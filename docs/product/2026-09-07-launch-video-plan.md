# DeFiGrail launch video — plan v3

*45 seconds, cut for X. v2 applies the 12-second decision and replaces v1's shot list with
measured capture offsets from the live site.*

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

`[R]` Runway · `[C]` capture. All capture at **1440×900**, crop to 16:9.

| # | t | Src | Shot | Type |
|---|---|---|---|---|
| 1 | 0:00–0:04 | **R** | Icy fluid drifting across pale field, dissolving to white | — |
| 2 | 0:04–0:08 | **C** | Dissolve into live hero, aurora settled, headline holds | *(in frame)* |
| 3 | 0:08–0:20 | **C** | **The money shot.** One unbroken slow scroll on `/learn/uniswap-v3` | "You already know the TradFi version." |
| 4 | 0:20–0:25 | **C** | `/playground` — drag the IL curve, number tracks the cursor | "Every formula is a thing you can move." |
| 5 | 0:25–0:29 | **R** | Navy particles converging into a sparse lattice on snow | "In the order that makes sense." |
| 6 | 0:29–0:33 | **C** | `/graph` — drag a node, dependencies trace, physics settles | — |
| 7 | 0:33–0:37 | **C** | `/learn/liquidations` — the Black Thursday `real` caveat | "Including where it broke." |
| 8 | 0:37–0:40 | **C** | `/quiz` — Core → Expert toggle, one scenario question | "And whether you got it." |
| 9 | 0:40–0:43 | **R** | Pull back through pale haze, brightening to white | — |
| 10 | 0:43–0:45 | **C** | Static hero, aurora only. URL. | **defigrail.xyz** |

### Shot 3 is the whole pitch — measured offsets

`/learn/uniswap-v3` at **1440×900**. Measured: at `scrollY 300` the TradFi anchor, both
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
1677  real  ← the shot     1417   frames it at y 260, fully in shot at 1440x900
2083  check                  —
```

Scroll to **1417** and hold. (1677 is where the caveat *sits*; scrolling there would push it
off the top edge — the framing offset is 1417.) That caveat is the single most persuasive frame in the product: a
dated, sourced, real-money failure, not a definition.

---

## Runway prompts

Palette: snow `#FFFAFA`, navy `#000080`, icy `#ADD8E6`, slate `#6D8196`. Short prompts —
Gen-4 degrades with long ones.

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

## Capture recipe

Record at 1440×900, no cursor except shots 4 and 6 where the drag *is* the point.

| Shot | URL | Action |
|---|---|---|
| 2, 10 | `/` | Hard reload, wait for aurora + headline to settle, hold still |
| 3 | `/learn/uniswap-v3` | Hold at 300 (~4s), then scroll 300 → 1100 (~8s), ease-in-out |
| 4 | `/playground` | Drag IL entry 2000 → current 3000, slowly |
| 6 | `/graph` | Drag one node, release, let physics settle |
| 7 | `/learn/liquidations` | Jump to 1417, hold 4s |
| 8 | `/quiz` | Click Expert, scroll one question into frame |

**Do not record:** `/news` (live prices date the video) · `/community` (empty until real
submissions land).

---

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

**Runway — blocked on one manual step.** The server was registered under project scope
`/Users/siddharthsingh` (home), so it never loaded in this repo. Re-added at **user** scope,
now reachable at `https://mcp.runwayml.com/mcp`, and reporting `Needs authentication`.
Authorise it with `/mcp` in an interactive terminal; the tools load after that. A backup of
`~/.claude.json` was written before the change.

**Capture — ready to shoot.** Every offset above is measured against the live site at
1440×900, not estimated. Shots 3 and 7 were both wrong in earlier drafts and are now correct.

## Next

1. Authorise Runway (`/mcp`), then generate shots 1, 5, 9 — 3–4 variants each, image-to-video
   seeded with a real hero frame for 1 and 9.
2. Shoot the six product clips against the recipe above.
3. Assemble. The 30s cut drops shots 5 and 6.

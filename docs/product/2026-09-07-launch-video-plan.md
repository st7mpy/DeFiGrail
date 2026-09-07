# DeFiGrail launch video — plan v2

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

`/learn/uniswap-v3`, document height 3619. One continuous scroll, ~12s, ease-in-out:

```
scrollY  248 → 1287   over ~12s

 248  h1 "Uniswap v3"
 384  TradFi chip — "Limit-order market making / short straddle"   ← hold ~1.5s
 507  prereq chips — "Uniswap v2" + "Impermanent Loss"             ← hold ~1.5s
 797  first caveat (kind=misuse) — the ~4000x capital efficiency one
1287  the interactive RangeLiquidity chart
```

That single move shows the anchor, the dependency chain, a typed caveat and an interactive
chart without a cut. **v1 had this on `/learn/uniswap-v2` — that was wrong: uniswap-v2 is the
first Foundations topic and has no prereqs, so the chips would not have rendered.**

### Shot 7 — measured offsets

`/learn/liquidations`, three caveats on the page:

```
1206  breaks — "Liquidation does not happen at the liquidation threshold…"
1677  real   — "Black Thursday, 12 March 2020…"      ← this is the shot
2083  check  — "Verify it yourself…"
```

Land on **1677** and hold. That caveat is the single most persuasive frame in the product: a
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
| 3 | `/learn/uniswap-v3` | Scroll 248 → 1287, ~12s, ease-in-out |
| 4 | `/playground` | Drag IL entry 2000 → current 3000, slowly |
| 6 | `/graph` | Drag one node, release, let physics settle |
| 7 | `/learn/liquidations` | Jump to 1600, ease to 1677, hold 2s |
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

## Next

1. Restart the session so the Runway MCP tools load, then generate shots 1, 5, 9 (3–4 variants each).
2. Capture the six product clips against the offsets above.
3. Assemble, and cut the 30s version by dropping shots 5 and 6.

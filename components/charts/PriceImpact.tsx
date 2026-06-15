"use client";

import { useState } from "react";
import { priceImpact } from "@/lib/defi-math";
import Axes from "./Axes";

const W = 700;
const H = 320;
const PAD = 44;

const F_MAX = 0.5; // plot trade size up to 50% of the reserve
const IMPACT_MAX = priceImpact(F_MAX) * 1.05;

const toPixelX = (f: number) => PAD + (f / F_MAX) * (W - 2 * PAD);
const toPixelY = (impact: number) => (H - PAD) - (impact / IMPACT_MAX) * (H - 2 * PAD);

const CURVE_POINTS = 200;
const CURVE_PATH = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= CURVE_POINTS; i++) {
    const f = (i / CURVE_POINTS) * F_MAX;
    pts.push(`${i === 0 ? "M" : "L"}${toPixelX(f).toFixed(1)},${toPixelY(priceImpact(f)).toFixed(1)}`);
  }
  return pts.join(" ");
})();

const X_TICKS = [0, 0.1, 0.2, 0.3, 0.4, 0.5].map((v) => ({
  value: v, label: `${(v * 100).toFixed(0)}%`, px: toPixelX(v),
}));
const Y_TICKS = [0, IMPACT_MAX * 0.25, IMPACT_MAX * 0.5, IMPACT_MAX * 0.75, IMPACT_MAX].map((v) => ({
  value: v, label: `${(v * 100).toFixed(0)}%`, py: toPixelY(v),
}));

export default function PriceImpact() {
  const [pct, setPct] = useState(10); // trade size as % of reserve
  const f = pct / 100;
  const impact = priceImpact(f);
  const mx = toPixelX(f), my = toPixelY(impact);

  return (
    <div className="my-6 not-prose" style={{ fontFamily: "var(--font-mono, monospace)" }}>
      <Axes width={W} height={H} padding={PAD} xLabel="Trade size (% of reserve)" yLabel="Price impact" xTicks={X_TICKS} yTicks={Y_TICKS}>
        <path d={CURVE_PATH} fill="none" stroke="var(--color-v1, #f59e0b)" strokeWidth={2} />
        <line x1={mx} y1={PAD} x2={mx} y2={H - PAD} stroke="var(--color-v0, #22c55e)" strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
        <circle cx={mx} cy={my} r={5} fill="var(--color-v0, #22c55e)" stroke="var(--color-bg, #000)" strokeWidth={1.5} />
      </Axes>

      <div style={{ marginTop: "12px", padding: "12px 16px", background: "var(--color-panel, rgba(0,0,0,0.2))", border: "1px solid var(--color-line2, #555)", borderRadius: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "10px", flexWrap: "wrap" }}>
          <label htmlFor="pi-slider" style={{ fontSize: "10px", letterSpacing: "1px", color: "var(--color-dim, #888)", whiteSpace: "nowrap" }}>
            TRADE SIZE
          </label>
          <input id="pi-slider" type="range" min={1} max={49} value={pct} onChange={(e) => setPct(parseInt(e.target.value))} style={{ flex: 1, minWidth: "120px", accentColor: "var(--color-v0, #22c55e)" }} />
          <span style={{ fontSize: "12px", color: "var(--color-v0, #22c55e)", minWidth: "120px" }}>
            {pct}% of reserve
          </span>
        </div>
        <div style={{ fontSize: "18px", color: "var(--color-v1, #f59e0b)", fontWeight: "bold" }}>
          Price impact ≈ {(impact * 100).toFixed(1)}%
        </div>
        <div style={{ fontSize: "10px", color: "var(--color-dim, #888)", marginTop: "4px" }}>
          Constant-product (x·y=k): impact = f / (1 − f). The deeper the pool relative to your trade, the smaller f — and impact stays near zero.
        </div>
      </div>
    </div>
  );
}

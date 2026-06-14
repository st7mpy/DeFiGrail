"use client";

import { useState } from "react";
import { kinkedRate } from "@/lib/defi-math";
import Axes from "./Axes";

const W = 700;
const H = 320;
const PAD = 44;

const U_MIN = 0;
const U_MAX = 1;
const RATE_MIN = 0;
const RATE_MAX = kinkedRate(1) * 1.05; // slight headroom

function toPixelX(u: number) {
  return PAD + ((u - U_MIN) / (U_MAX - U_MIN)) * (W - 2 * PAD);
}

function toPixelY(rate: number) {
  return (H - PAD) - ((rate - RATE_MIN) / (RATE_MAX - RATE_MIN)) * (H - 2 * PAD);
}

const CURVE_POINTS = 200;
function buildCurvePath() {
  const pts: string[] = [];
  for (let i = 0; i <= CURVE_POINTS; i++) {
    const u = i / CURVE_POINTS;
    const r = kinkedRate(u);
    const x = toPixelX(u);
    const y = toPixelY(r);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

const CURVE_PATH = buildCurvePath();

const X_TICKS = [0, 0.2, 0.4, 0.6, 0.8, 1.0].map((v) => ({
  value: v,
  label: `${(v * 100).toFixed(0)}%`,
  px: toPixelX(v),
}));

const maxRateLabel = (RATE_MAX * 100).toFixed(0);
const Y_TICKS = [0, RATE_MAX * 0.25, RATE_MAX * 0.5, RATE_MAX * 0.75, RATE_MAX].map((v) => ({
  value: v,
  label: `${(v * 100).toFixed(1)}%`,
  py: toPixelY(v),
}));

const KINK = 0.8;
const kinkX = toPixelX(KINK);
const kinkRate = kinkedRate(KINK);
const kinkY = toPixelY(kinkRate);

export default function KinkedRate() {
  const [uSlider, setUSlider] = useState(80); // 0..100 → u=0..1
  const u = uSlider / 100;
  const rate = kinkedRate(u);
  const markerX = toPixelX(u);
  const markerY = toPixelY(rate);

  return (
    <div className="my-6 not-prose" style={{ fontFamily: "var(--font-mono, monospace)" }}>
      <Axes
        width={W}
        height={H}
        padding={PAD}
        xLabel="Utilization U"
        yLabel="Borrow Rate"
        xTicks={X_TICKS}
        yTicks={Y_TICKS}
      >
        {/* curve */}
        <path
          d={CURVE_PATH}
          fill="none"
          stroke="var(--color-v1, #f59e0b)"
          strokeWidth={2}
        />

        {/* kink vertical guide */}
        <line
          x1={kinkX}
          y1={PAD}
          x2={kinkX}
          y2={H - PAD}
          stroke="var(--color-v2, #3b82f6)"
          strokeWidth={1}
          strokeDasharray="5 3"
        />
        <text x={kinkX + 4} y={PAD + 12} fontSize={9} fill="var(--color-v2, #3b82f6)">
          KINK 80%
        </text>
        <circle
          cx={kinkX}
          cy={kinkY}
          r={4}
          fill="var(--color-v2, #3b82f6)"
          stroke="var(--color-bg, #000)"
          strokeWidth={1.5}
        />

        {/* current marker */}
        <line
          x1={markerX}
          y1={PAD}
          x2={markerX}
          y2={H - PAD}
          stroke="var(--color-v0, #22c55e)"
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.7}
        />
        <circle
          cx={markerX}
          cy={markerY}
          r={5}
          fill="var(--color-v0, #22c55e)"
          stroke="var(--color-bg, #000)"
          strokeWidth={1.5}
        />
      </Axes>

      <div
        style={{
          marginTop: "12px",
          padding: "12px 16px",
          background: "var(--color-panel, rgba(0,0,0,0.2))",
          border: "1px solid var(--color-line2, #555)",
          borderRadius: "4px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "10px", flexWrap: "wrap" }}>
          <label
            htmlFor="kink-u-slider"
            style={{ fontSize: "10px", letterSpacing: "1px", color: "var(--color-dim, #888)", whiteSpace: "nowrap" }}
          >
            UTILIZATION
          </label>
          <input
            id="kink-u-slider"
            type="range"
            min={0}
            max={100}
            value={uSlider}
            onChange={(e) => setUSlider(parseInt(e.target.value))}
            style={{ flex: 1, minWidth: "120px", accentColor: "var(--color-v0, #22c55e)" }}
          />
          <span style={{ fontSize: "12px", color: "var(--color-v0, #22c55e)", minWidth: "90px" }}>
            U {uSlider}%
          </span>
        </div>
        <div style={{ fontSize: "18px", color: "var(--color-v1, #f59e0b)", fontWeight: "bold" }}>
          Rate = {(rate * 100).toFixed(2)}%
        </div>
        <div style={{ fontSize: "10px", color: "var(--color-dim, #888)", marginTop: "4px" }}>
          {u <= KINK
            ? `Below kink — gentle slope (base + U × m₁)`
            : `Above kink — steep slope (kink region exhausted)`}
        </div>
      </div>
    </div>
  );
}

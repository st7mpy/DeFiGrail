"use client";

import { ptPrice } from "@/lib/defi-math";
import Axes from "./Axes";

const W = 700;
const H = 320;
const PAD = 44;

// x axis: time to maturity, left=1.0 (far from maturity), right=0 (maturity)
const T_LEFT = 1.0;
const T_RIGHT = 0.0;
// y axis: PT price
const PT_MIN = 0.75;
const PT_MAX = 1.02;

const RATES = [
  { r: 0.05, label: "r = 5%", color: "var(--color-v0, #22c55e)" },
  { r: 0.10, label: "r = 10%", color: "var(--color-v1, #f59e0b)" },
  { r: 0.20, label: "r = 20%", color: "var(--color-esoteric, #a855f7)" },
];

function toPixelX(t: number) {
  // t=1.0 maps to left, t=0 maps to right (reverse: higher t = more time)
  return PAD + ((T_LEFT - t) / (T_LEFT - T_RIGHT)) * (W - 2 * PAD);
}

function toPixelY(pt: number) {
  return (H - PAD) - ((pt - PT_MIN) / (PT_MAX - PT_MIN)) * (H - 2 * PAD);
}

const N = 200;

function buildPath(r: number) {
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = T_LEFT - (i / N) * (T_LEFT - T_RIGHT);
    const pt = ptPrice(r, t);
    const x = toPixelX(t);
    const y = toPixelY(pt);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

const PATHS = RATES.map((entry) => ({
  ...entry,
  d: buildPath(entry.r),
}));

const X_TICKS = [1.0, 0.75, 0.5, 0.25, 0.0].map((t) => ({
  value: t,
  label: t === 0 ? "0 (maturity)" : `${t}y`,
  px: toPixelX(t),
}));

const Y_TICKS = [0.80, 0.85, 0.90, 0.95, 1.00].map((v) => ({
  value: v,
  label: v.toFixed(2),
  py: toPixelY(v),
}));

const parY = toPixelY(1.0);

export default function PTDecay() {
  return (
    <div className="my-6 not-prose" style={{ fontFamily: "var(--font-mono, monospace)" }}>
      <Axes
        width={W}
        height={H}
        padding={PAD}
        xLabel="Time to maturity"
        yLabel="PT price"
        xTicks={X_TICKS}
        yTicks={Y_TICKS}
      >
        {/* par line at PT=1 */}
        <line
          x1={PAD}
          y1={parY}
          x2={W - PAD}
          y2={parY}
          stroke="var(--color-line2, #555)"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <text
          x={W - PAD - 4}
          y={parY - 5}
          fontSize={9}
          fill="var(--color-dim, #888)"
          textAnchor="end"
        >
          par = 1.00
        </text>

        {/* curves */}
        {PATHS.map((entry) => (
          <path
            key={entry.r}
            d={entry.d}
            fill="none"
            stroke={entry.color}
            strokeWidth={2}
          />
        ))}

        {/* legend */}
        {PATHS.map((entry, i) => {
          const legendY = PAD + 16 + i * 18;
          return (
            <g key={entry.r}>
              <line
                x1={PAD + 8}
                y1={legendY}
                x2={PAD + 28}
                y2={legendY}
                stroke={entry.color}
                strokeWidth={2}
              />
              <text
                x={PAD + 34}
                y={legendY + 4}
                fontSize={9}
                fill={entry.color}
              >
                {entry.label}
              </text>
            </g>
          );
        })}
      </Axes>

      <div
        style={{
          marginTop: "8px",
          padding: "10px 16px",
          background: "var(--color-panel, rgba(0,0,0,0.2))",
          border: "1px solid var(--color-line2, #555)",
          borderRadius: "4px",
          fontSize: "10px",
          color: "var(--color-dim, #888)",
          lineHeight: "1.6",
        }}
      >
        <span style={{ color: "var(--color-v0, #22c55e)" }}>r=5%</span>:{" "}
        PT starts at {ptPrice(0.05, 1.0).toFixed(4)} · {" "}
        <span style={{ color: "var(--color-v1, #f59e0b)" }}>r=10%</span>:{" "}
        PT starts at {ptPrice(0.10, 1.0).toFixed(4)} · {" "}
        <span style={{ color: "var(--color-esoteric, #a855f7)" }}>r=20%</span>:{" "}
        PT starts at {ptPrice(0.20, 1.0).toFixed(4)} — all converge to 1.00 at maturity (pull-to-par).
      </div>
    </div>
  );
}

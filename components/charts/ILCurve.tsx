"use client";

import { useState, useMemo } from "react";
import { impermanentLoss } from "@/lib/defi-math";
import Axes from "./Axes";

const W = 700;
const H = 320;
const PAD = 44;

const P_MIN = 0.25;
const P_MAX = 4;
const IL_MIN = -0.22; // ~-22% at P=4
const IL_MAX = 0.01;  // slight headroom above 0

function toPixelX(P: number) {
  return PAD + ((P - P_MIN) / (P_MAX - P_MIN)) * (W - 2 * PAD);
}

function toPixelY(il: number) {
  return PAD + ((IL_MAX - il) / (IL_MAX - IL_MIN)) * (H - 2 * PAD);
}

// generate curve path points
const CURVE_POINTS = 200;
function buildCurvePath() {
  const pts: string[] = [];
  for (let i = 0; i <= CURVE_POINTS; i++) {
    const P = P_MIN + (i / CURVE_POINTS) * (P_MAX - P_MIN);
    const il = impermanentLoss(P);
    const x = toPixelX(P);
    const y = toPixelY(il);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

const CURVE_PATH = buildCurvePath();

// x ticks: 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4
const X_TICKS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4].map((v) => ({
  value: v,
  label: `${v}×`,
  px: toPixelX(v),
}));

// y ticks
const Y_TICKS = [0, -0.05, -0.10, -0.15, -0.20].map((v) => ({
  value: v,
  label: `${(v * 100).toFixed(0)}%`,
  py: toPixelY(v),
}));

export default function ILCurve() {
  const [entryStr, setEntryStr] = useState("2000");
  const [currentStr, setCurrentStr] = useState("3000");

  const entry = parseFloat(entryStr);
  const current = parseFloat(currentStr);

  const { il, ilPct, hodl, lp, delta, markerX, markerY, valid } = useMemo(() => {
    if (!isFinite(entry) || entry <= 0 || !isFinite(current) || current < 0) {
      return { il: 0, ilPct: "—", hodl: 0, lp: 0, delta: 0, markerX: 0, markerY: 0, valid: false };
    }
    const P = current / entry;
    if (!isFinite(P) || P <= 0) {
      return { il: 0, ilPct: "—", hodl: 0, lp: 0, delta: 0, markerX: 0, markerY: 0, valid: false };
    }
    const ilVal = impermanentLoss(P);
    const ilPctStr = (ilVal * 100).toFixed(2) + "%";
    const hodlVal = 10000 * (1 + P) / 2;
    const lpVal = 10000 * Math.sqrt(P);
    const deltaVal = lpVal - hodlVal;

    // clamp P for marker position on chart
    const Pclamped = Math.max(P_MIN, Math.min(P_MAX, P));
    const ilClamped = impermanentLoss(Pclamped);
    return {
      il: ilVal,
      ilPct: ilPctStr,
      hodl: hodlVal,
      lp: lpVal,
      delta: deltaVal,
      markerX: toPixelX(Pclamped),
      markerY: toPixelY(ilClamped),
      valid: true,
    };
  }, [entry, current]);

  const zeroX = toPixelX(1);
  const zeroY = toPixelY(0);

  return (
    <div className="my-6 not-prose" style={{ fontFamily: "var(--font-mono, monospace)" }}>
      <Axes
        width={W}
        height={H}
        padding={PAD}
        xLabel="Price ratio P = current / entry"
        yLabel="IL %"
        xTicks={X_TICKS}
        yTicks={Y_TICKS}
      >
        {/* zero-line at IL=0 */}
        <line
          x1={PAD}
          y1={zeroY}
          x2={W - PAD}
          y2={zeroY}
          stroke="var(--color-line2, #555)"
          strokeWidth={1}
          strokeDasharray="4 3"
        />

        {/* P=1 vertical guide */}
        <line
          x1={zeroX}
          y1={PAD}
          x2={zeroX}
          y2={H - PAD}
          stroke="var(--color-line2, #555)"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <text x={zeroX + 4} y={PAD + 12} fontSize={9} fill="var(--color-dim, #888)">
          P=1
        </text>

        {/* IL curve */}
        <path
          d={CURVE_PATH}
          fill="none"
          stroke="var(--color-esoteric, #a855f7)"
          strokeWidth={2}
        />

        {/* marker dot at current P */}
        {valid && (
          <>
            <line
              x1={markerX}
              y1={PAD}
              x2={markerX}
              y2={H - PAD}
              stroke="var(--color-v1, #f59e0b)"
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.7}
            />
            <circle
              cx={markerX}
              cy={markerY}
              r={5}
              fill="var(--color-v1, #f59e0b)"
              stroke="var(--color-bg, #000)"
              strokeWidth={1.5}
            />
          </>
        )}
      </Axes>

      {/* live calculator */}
      <div
        style={{
          marginTop: "12px",
          padding: "12px 16px",
          background: "var(--color-panel, rgba(0,0,0,0.2))",
          border: "1px solid var(--color-line2, #555)",
          borderRadius: "4px",
        }}
      >
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label
              htmlFor="il-entry-price"
              style={{ fontSize: "10px", letterSpacing: "1px", color: "var(--color-dim, #888)" }}
            >
              ENTRY PRICE
            </label>
            <input
              id="il-entry-price"
              type="number"
              value={entryStr}
              onChange={(e) => setEntryStr(e.target.value)}
              style={{
                width: "100px",
                padding: "4px 8px",
                background: "var(--color-bg, #000)",
                border: "1px solid var(--color-line2, #555)",
                color: "inherit",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "12px",
                borderRadius: "2px",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-esoteric, #a855f7)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--color-line2, #555)")}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label
              htmlFor="il-current-price"
              style={{ fontSize: "10px", letterSpacing: "1px", color: "var(--color-dim, #888)" }}
            >
              CURRENT PRICE
            </label>
            <input
              id="il-current-price"
              type="number"
              value={currentStr}
              onChange={(e) => setCurrentStr(e.target.value)}
              style={{
                width: "100px",
                padding: "4px 8px",
                background: "var(--color-bg, #000)",
                border: "1px solid var(--color-line2, #555)",
                color: "inherit",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "12px",
                borderRadius: "2px",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-esoteric, #a855f7)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--color-line2, #555)")}
            />
          </div>
        </div>

        {valid ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontSize: "20px", color: "var(--color-esoteric, #a855f7)", fontWeight: "bold" }}>
              IL = {ilPct}
            </div>
            <div style={{ fontSize: "11px", color: "var(--color-dim, #888)" }}>
              HODL ${hodl.toFixed(2)} vs LP ${lp.toFixed(2)}{" "}
              <span style={{ color: delta < 0 ? "var(--color-esoteric, #a855f7)" : "var(--color-v0, #22c55e)" }}>
                (Δ ${delta.toFixed(2)}, fees excluded)
              </span>
            </div>
            <div style={{ fontSize: "10px", color: "var(--color-dim, #888)" }}>
              P = {(current / entry).toFixed(4)}× · $10,000 initial position
            </div>
          </div>
        ) : (
          <div style={{ fontSize: "14px", color: "var(--color-dim, #888)" }}>IL = —</div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { v3Amounts } from "@/lib/defi-math";
import Axes from "./Axes";

const W = 700;
const H = 320;
const PAD = 44;

const AXIS_MIN = 500;
const AXIS_MAX = 4000;

function toPixelX(p: number) {
  return PAD + ((p - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * (W - 2 * PAD);
}

const X_TICKS = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000].map((v) => ({
  value: v,
  label: `$${v}`,
  px: toPixelX(v),
}));

export default function RangeLiquidity() {
  const [Pa, setPa] = useState(1000);
  const [Pb, setPb] = useState(3000);
  const [P, setP] = useState(2000);

  // clamp and order Pa < Pb
  const paEff = Math.max(AXIS_MIN, Math.min(Pa, Pb - 50));
  const pbEff = Math.min(AXIS_MAX, Math.max(Pb, Pa + 50));
  const pEff = Math.max(AXIS_MIN, Math.min(P, AXIS_MAX));

  const L = 1;
  const { x: xAmt, y: yAmt } = v3Amounts(L, pEff, paEff, pbEff);

  const totalAmt = xAmt + yAmt;
  const xFrac = totalAmt > 0 ? xAmt / totalAmt : 0.5;
  const yFrac = totalAmt > 0 ? yAmt / totalAmt : 0.5;

  const plotLeft = PAD;
  const plotRight = W - PAD;
  const plotTop = PAD;
  const plotBottom = H - PAD;
  const plotHeight = plotBottom - plotTop;
  const plotWidth = plotRight - plotLeft;

  const paX = toPixelX(Math.max(AXIS_MIN, paEff));
  const pbX = toPixelX(Math.min(AXIS_MAX, pbEff));
  const pX = toPixelX(pEff);

  // composition bar at bottom section
  const BAR_Y = plotTop + plotHeight * 0.6;
  const BAR_H = 28;
  const BAR_W = plotWidth * 0.6;
  const BAR_X = plotLeft + (plotWidth - BAR_W) / 2;

  return (
    <div className="my-6 not-prose" style={{ fontFamily: "var(--font-mono, monospace)" }}>
      <Axes
        width={W}
        height={H}
        padding={PAD}
        xLabel="Price ($)"
        xTicks={X_TICKS}
      >
        {/* active range band */}
        <rect
          x={paX}
          y={plotTop}
          width={pbX - paX}
          height={plotHeight}
          fill="var(--color-v2, #3b82f6)"
          opacity={0.12}
        />

        {/* Pa line */}
        <line
          x1={paX}
          y1={plotTop}
          x2={paX}
          y2={plotBottom}
          stroke="var(--color-v2, #3b82f6)"
          strokeWidth={1.5}
          strokeDasharray="5 3"
        />
        <text x={paX + 3} y={plotTop + 14} fontSize={9} fill="var(--color-v2, #3b82f6)">
          Pa ${paEff}
        </text>

        {/* Pb line */}
        <line
          x1={pbX}
          y1={plotTop}
          x2={pbX}
          y2={plotBottom}
          stroke="var(--color-v2, #3b82f6)"
          strokeWidth={1.5}
          strokeDasharray="5 3"
        />
        <text x={pbX - 3} y={plotTop + 14} fontSize={9} fill="var(--color-v2, #3b82f6)" textAnchor="end">
          Pb ${pbEff}
        </text>

        {/* Current price line */}
        <line
          x1={pX}
          y1={plotTop}
          x2={pX}
          y2={plotBottom}
          stroke="var(--color-v0, #22c55e)"
          strokeWidth={2}
        />
        <text x={pX + 3} y={plotTop + 26} fontSize={9} fill="var(--color-v0, #22c55e)">
          P ${pEff}
        </text>
        <circle cx={pX} cy={plotBottom} r={4} fill="var(--color-v0, #22c55e)" />

        {/* composition bar */}
        <text x={BAR_X} y={BAR_Y - 8} fontSize={9} fill="var(--color-dim, #888)">
          TOKEN COMPOSITION (L=1)
        </text>
        {/* x (token0) portion */}
        <rect
          x={BAR_X}
          y={BAR_Y}
          width={BAR_W * xFrac}
          height={BAR_H}
          fill="var(--color-v1, #f59e0b)"
          opacity={0.85}
        />
        {/* y (token1) portion */}
        <rect
          x={BAR_X + BAR_W * xFrac}
          y={BAR_Y}
          width={BAR_W * yFrac}
          height={BAR_H}
          fill="var(--color-v2, #3b82f6)"
          opacity={0.85}
        />
        {/* bar border */}
        <rect
          x={BAR_X}
          y={BAR_Y}
          width={BAR_W}
          height={BAR_H}
          fill="none"
          stroke="var(--color-line2, #555)"
          strokeWidth={1}
        />
        <text x={BAR_X} y={BAR_Y + BAR_H + 14} fontSize={9} fill="var(--color-v1, #f59e0b)">
          ■ token0 (x)
        </text>
        <text x={BAR_X + 90} y={BAR_Y + BAR_H + 14} fontSize={9} fill="var(--color-v2, #3b82f6)">
          ■ token1 (y)
        </text>
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
        <div style={{ display: "grid", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <label
              htmlFor="rl-pa"
              style={{ fontSize: "10px", letterSpacing: "1px", color: "var(--color-dim, #888)", minWidth: "90px" }}
            >
              RANGE LOW Pa
            </label>
            <input
              id="rl-pa"
              type="range"
              min={AXIS_MIN}
              max={AXIS_MAX - 100}
              step={50}
              value={Pa}
              onChange={(e) => setPa(parseInt(e.target.value))}
              style={{ flex: 1, minWidth: "100px", accentColor: "var(--color-v2, #3b82f6)" }}
            />
            <span style={{ fontSize: "11px", color: "var(--color-v2, #3b82f6)", minWidth: "60px" }}>
              ${paEff}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <label
              htmlFor="rl-pb"
              style={{ fontSize: "10px", letterSpacing: "1px", color: "var(--color-dim, #888)", minWidth: "90px" }}
            >
              RANGE HIGH Pb
            </label>
            <input
              id="rl-pb"
              type="range"
              min={AXIS_MIN + 100}
              max={AXIS_MAX}
              step={50}
              value={Pb}
              onChange={(e) => setPb(parseInt(e.target.value))}
              style={{ flex: 1, minWidth: "100px", accentColor: "var(--color-v2, #3b82f6)" }}
            />
            <span style={{ fontSize: "11px", color: "var(--color-v2, #3b82f6)", minWidth: "60px" }}>
              ${pbEff}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <label
              htmlFor="rl-price"
              style={{ fontSize: "10px", letterSpacing: "1px", color: "var(--color-dim, #888)", minWidth: "90px" }}
            >
              CURRENT PRICE
            </label>
            <input
              id="rl-price"
              type="range"
              min={AXIS_MIN}
              max={AXIS_MAX}
              step={10}
              value={P}
              onChange={(e) => setP(parseInt(e.target.value))}
              style={{ flex: 1, minWidth: "100px", accentColor: "var(--color-v0, #22c55e)" }}
            />
            <span style={{ fontSize: "11px", color: "var(--color-v0, #22c55e)", minWidth: "60px" }}>
              ${pEff}
            </span>
          </div>
        </div>

        <div style={{ marginTop: "10px", display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "10px", color: "var(--color-dim, #888)", letterSpacing: "1px" }}>TOKEN0 (x)</div>
            <div style={{ fontSize: "16px", color: "var(--color-v1, #f59e0b)", fontWeight: "bold" }}>
              {xAmt.toFixed(4)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "var(--color-dim, #888)", letterSpacing: "1px" }}>TOKEN1 (y)</div>
            <div style={{ fontSize: "16px", color: "var(--color-v2, #3b82f6)", fontWeight: "bold" }}>
              {yAmt.toFixed(4)}
            </div>
          </div>
          <div style={{ fontSize: "10px", color: "var(--color-dim, #888)", alignSelf: "flex-end", paddingBottom: "2px" }}>
            {pEff < paEff
              ? "OUT OF RANGE — all token0"
              : pEff > pbEff
              ? "OUT OF RANGE — all token1"
              : "IN RANGE — active earning"}
          </div>
        </div>
      </div>
    </div>
  );
}

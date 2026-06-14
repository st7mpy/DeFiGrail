import React from "react";

interface AxesProps {
  width?: number;
  height?: number;
  padding?: number;
  xLabel?: string;
  yLabel?: string;
  xTicks?: { value: number; label: string; px: number }[];
  yTicks?: { value: number; label: string; py: number }[];
  children?: React.ReactNode;
}

export default function Axes({
  width = 700,
  height = 320,
  padding = 44,
  xLabel,
  yLabel,
  xTicks,
  yTicks,
  children,
}: AxesProps) {
  const plotLeft = padding;
  const plotRight = width - padding;
  const plotTop = padding;
  const plotBottom = height - padding;

  const numXGridLines = 5;
  const numYGridLines = 5;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", maxWidth: width, fontFamily: "var(--font-mono, monospace)" }}
      aria-hidden="true"
    >
      {/* panel background */}
      <rect
        x={plotLeft}
        y={plotTop}
        width={plotRight - plotLeft}
        height={plotBottom - plotTop}
        fill="var(--color-panel, rgba(0,0,0,0.2))"
        rx={2}
      />

      {/* gridlines */}
      {Array.from({ length: numYGridLines + 1 }).map((_, i) => {
        const py = plotTop + (i / numYGridLines) * (plotBottom - plotTop);
        return (
          <line
            key={`hg-${i}`}
            x1={plotLeft}
            y1={py}
            x2={plotRight}
            y2={py}
            stroke="var(--color-line, #333)"
            strokeWidth={0.5}
          />
        );
      })}
      {Array.from({ length: numXGridLines + 1 }).map((_, i) => {
        const px = plotLeft + (i / numXGridLines) * (plotRight - plotLeft);
        return (
          <line
            key={`vg-${i}`}
            x1={px}
            y1={plotTop}
            x2={px}
            y2={plotBottom}
            stroke="var(--color-line, #333)"
            strokeWidth={0.5}
          />
        );
      })}

      {/* axes */}
      <line x1={plotLeft} y1={plotBottom} x2={plotRight} y2={plotBottom} stroke="var(--color-line2, #555)" strokeWidth={1} />
      <line x1={plotLeft} y1={plotTop} x2={plotLeft} y2={plotBottom} stroke="var(--color-line2, #555)" strokeWidth={1} />

      {/* x tick labels */}
      {xTicks?.map((t) => (
        <text
          key={t.label}
          x={t.px}
          y={plotBottom + 14}
          textAnchor="middle"
          fontSize={9}
          fill="var(--color-dim, #888)"
        >
          {t.label}
        </text>
      ))}

      {/* y tick labels */}
      {yTicks?.map((t) => (
        <text
          key={t.label}
          x={plotLeft - 6}
          y={t.py + 3}
          textAnchor="end"
          fontSize={9}
          fill="var(--color-dim, #888)"
        >
          {t.label}
        </text>
      ))}

      {/* axis labels */}
      {xLabel && (
        <text
          x={(plotLeft + plotRight) / 2}
          y={height - 6}
          textAnchor="middle"
          fontSize={10}
          fill="var(--color-dim, #888)"
        >
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text
          x={12}
          y={(plotTop + plotBottom) / 2}
          textAnchor="middle"
          fontSize={10}
          fill="var(--color-dim, #888)"
          transform={`rotate(-90, 12, ${(plotTop + plotBottom) / 2})`}
        >
          {yLabel}
        </text>
      )}

      {children}
    </svg>
  );
}

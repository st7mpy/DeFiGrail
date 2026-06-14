"use client";
import { useEffect, useRef } from "react";

// Market sparkline board — 1:1 port of the design's drawCharts().
const DATASETS = [
  { title: "ETH/USD", val: "$3,905", chg: "+3.4%", up: true, data: [3420, 3380, 3510, 3490, 3600, 3750, 3680, 3820, 3790, 3870, 3910, 3905] },
  { title: "BTC/USD", val: "$71,240", chg: "+2.1%", up: true, data: [65200, 64800, 66100, 67300, 68900, 69200, 70100, 69800, 70500, 71000, 71200, 71240] },
  { title: "DeFi TVL", val: "$112.4B", chg: "-0.8%", up: false, data: [118, 122, 119, 125, 121, 118, 115, 117, 114, 113, 112, 112.4] },
  { title: "ETH Gas (gwei)", val: "28", chg: "-5.2%", up: false, data: [42, 38, 45, 35, 30, 32, 28, 31, 27, 29, 28, 28] },
];

function Sparkline({ data }: { data: number[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    function draw() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = cv!.parentElement!.getBoundingClientRect();
      const W = rect.width - 40, H = 120;
      cv!.width = W * dpr; cv!.height = H * dpr;
      cv!.style.width = W + "px"; cv!.style.height = H + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, W, H);
      const min = Math.min(...data) * 0.995, max = Math.max(...data) * 1.005;
      const pad = 8, xStep = (W - pad * 2) / (data.length - 1);
      const pts = data.map((v, j) => ({ x: pad + j * xStep, y: H - pad - ((v - min) / (max - min)) * (H - pad * 2) }));
      const grad = ctx!.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "rgba(26,24,19,.08)");
      grad.addColorStop(1, "rgba(26,24,19,0)");
      ctx!.beginPath();
      ctx!.moveTo(pts[0].x, H);
      pts.forEach((p) => ctx!.lineTo(p.x, p.y));
      ctx!.lineTo(pts[pts.length - 1].x, H);
      ctx!.closePath();
      ctx!.fillStyle = grad; ctx!.fill();
      ctx!.beginPath();
      ctx!.moveTo(pts[0].x, pts[0].y);
      pts.forEach((p) => ctx!.lineTo(p.x, p.y));
      ctx!.strokeStyle = "rgba(26,24,19,.7)"; ctx!.lineWidth = 1.5; ctx!.lineJoin = "round"; ctx!.stroke();
      const last = pts[pts.length - 1];
      ctx!.beginPath(); ctx!.arc(last.x, last.y, 3, 0, Math.PI * 2); ctx!.fillStyle = "#1a1813"; ctx!.fill();
    }
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [data]);
  return <canvas ref={ref} className="chart-canvas" />;
}

export default function MarketBoard() {
  return (
    <div>
      <div className="hero-eyebrow" style={{ margin: "40px 0 24px" }}>Live market data</div>
      <div className="charts-grid">
        {DATASETS.map((d) => (
          <div className="chart-card" key={d.title}>
            <div className="chart-title">{d.title}</div>
            <div className="chart-value">{d.val}</div>
            <div className="chart-chg" style={{ color: d.up ? "rgba(26,24,19,.8)" : "rgba(26,24,19,.45)" }}>{d.chg}</div>
            <Sparkline data={d.data} />
          </div>
        ))}
      </div>
    </div>
  );
}

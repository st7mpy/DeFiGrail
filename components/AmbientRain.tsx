"use client";
import { useEffect, useRef } from "react";

// Translucent formula rain — 1:1 from the design's initRain().
// Respects prefers-reduced-motion and pauses when the tab is hidden.
const RAIN_GLYPHS = [
  "x·y = k", "(3,3)", "IL = 2√P/(1+P)−1", "PT = par/(1+y)ᵗ",
  "L = Δx/(1/√Pa − 1/√Pb)", "rate = f(util)", "aToken", "cToken",
  "MEV", "√P", "Δy/Δx", "0.30%", "asset = PT + YT", "tick", "k", "y", "APY",
];

export default function AmbientRain() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;

    function resize() {
      cv!.width = window.innerWidth * dpr;
      cv!.height = window.innerHeight * dpr;
      cv!.style.width = window.innerWidth + "px";
      cv!.style.height = window.innerHeight + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const drops = Array.from({ length: 46 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      v: 0.18 + Math.random() * 0.42,
      g: RAIN_GLYPHS[(Math.random() * RAIN_GLYPHS.length) | 0],
      sz: 11 + ((Math.random() * 7) | 0),
      a: 0.032 + Math.random() * 0.028,
    }));
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function frame() {
      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (!document.hidden) {
        for (const d of drops) {
          if (!reduced) {
            d.y += d.v;
            if (d.y > window.innerHeight + 20) {
              d.y = -20;
              d.x = Math.random() * window.innerWidth;
              d.g = RAIN_GLYPHS[(Math.random() * RAIN_GLYPHS.length) | 0];
            }
          }
          ctx!.font = d.sz + "px var(--font-jetbrains), monospace";
          ctx!.fillStyle = "rgba(26,24,19," + d.a + ")";
          ctx!.fillText(d.g, d.x, d.y);
        }
      }
      raf = requestAnimationFrame(frame);
    }
    frame();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas id="rain" ref={ref} aria-hidden="true" />;
}

"use client";
import { useEffect, useRef } from "react";

// Translucent "cryptic numbers" rain for the landing page only.
// Respects prefers-reduced-motion and pauses when the tab is hidden.

// Cryptic number string: hex hashes, long decimals, padded digit clusters.
function crypticNumber(): string {
  const r = Math.random();
  if (r < 0.42) {
    const len = 6 + ((Math.random() * 8) | 0);
    let s = "0x";
    for (let i = 0; i < len; i++) s += "0123456789abcdef"[(Math.random() * 16) | 0];
    return s;
  }
  if (r < 0.72) {
    return (Math.random() * 10 ** (2 + ((Math.random() * 6) | 0))).toFixed(Math.random() < 0.5 ? 2 : 6);
  }
  const len = 6 + ((Math.random() * 8) | 0);
  let s = "";
  for (let i = 0; i < len; i++) s += "0123456789"[(Math.random() * 10) | 0];
  return s;
}

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

    const drops = Array.from({ length: 52 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      v: 0.16 + Math.random() * 0.4,
      g: crypticNumber(),
      sz: 11 + ((Math.random() * 7) | 0),
      a: 0.03 + Math.random() * 0.03,
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
              d.g = crypticNumber();
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

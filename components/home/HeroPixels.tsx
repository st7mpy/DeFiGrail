"use client";
import { useEffect, useRef } from "react";

// Hero headline that assembles from scattered pixels on load, then crossfades
// to the crisp DOM <h1> (kept for SEO/a11y). Falls back to a plain fade on
// reduced-motion or narrow viewports.
export default function HeroPixels({ text }: { text: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current, cv = canvasRef.current, h1 = h1Ref.current;
    if (!wrap || !cv || !h1) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const reveal = () => wrap.classList.add("revealed");

    if (reduced || window.innerWidth < 640) { reveal(); return; }

    let raf = 0;
    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      const rect = h1.getBoundingClientRect();
      const W = Math.ceil(rect.width), H = Math.ceil(rect.height);
      if (W < 10 || H < 10) { reveal(); return; }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const ctx = cv.getContext("2d");
      if (!ctx) { reveal(); return; }
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + "px"; cv.style.height = H + "px";
      ctx.scale(dpr, dpr);

      // render the text once to read its pixel mask, matching the h1's font
      const cs = getComputedStyle(h1);
      const font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#1a1813";
      ctx.fillText(text, W / 2, H / 2 + 2);

      const step = 5; // sample stride — the "pixel" grain
      const img = ctx.getImageData(0, 0, W * dpr, H * dpr).data;
      const targets: { tx: number; ty: number }[] = [];
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          const idx = ((y * dpr) * (W * dpr) + x * dpr) * 4 + 3; // alpha channel
          if (img[idx] > 130) targets.push({ tx: x, ty: y });
        }
      }
      if (targets.length === 0) { reveal(); return; }

      const particles = targets.map((t) => ({
        x: Math.random() * W,
        y: Math.random() * H,
        tx: t.tx,
        ty: t.ty,
        d: Math.random() * 0.25, // staggered start
      }));

      const DURATION = 1050;
      const t0 = performance.now();
      const ease = (p: number) => 1 - Math.pow(1 - p, 3);
      const sz = step - 1;

      const frame = (now: number) => {
        if (cancelled) return;
        const elapsed = (now - t0) / DURATION;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#1a1813";
        let done = true;
        for (const p of particles) {
          const local = Math.min(1, Math.max(0, (elapsed - p.d) / (1 - p.d)));
          const e = ease(local);
          if (local < 1) done = false;
          const x = p.x + (p.tx - p.x) * e;
          const y = p.y + (p.ty - p.y) * e;
          ctx.globalAlpha = 0.25 + 0.75 * e;
          ctx.fillRect(x, y, sz, sz);
        }
        ctx.globalAlpha = 1;
        if (done) { reveal(); return; }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };

    // wait for the web font so the pixel mask matches the final heading
    const start = () => requestAnimationFrame(run);
    if (document.fonts?.ready) document.fonts.ready.then(start);
    else start();

    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, [text]);

  return (
    <div className="hero-pixels" ref={wrapRef}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <h1 className="hero-h1" ref={h1Ref}>{text}</h1>
    </div>
  );
}

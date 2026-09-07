"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export type ProximitySection = { id: string; label: string; level?: 2 | 3 };

const RADIUS = 40;          // px of cursor travel over which a dash reacts
const MAX_DASH = 96;        // the scaleX(1) width every dash is measured against
const IDLE_RESET = 90;      // ms before a scroll-driven pulse relaxes

// Ported from the supplied motion/react component. The spring is a CSS
// transition here rather than a JS spring: this repo carries no animation
// dependency (the graph and charts are hand-rolled), and one sidebar does not
// justify ~30KB. Swap in `motion` if the spring feel matters more than the byte.
const WIDTHS: Record<2 | 3, { base: number; bump: number }> = {
  2: { base: 34, bump: 62 },
  3: { base: 24, bump: 48 },
};

export default function ProximitySidebar({
  sections,
  side = "left",
  activeOffset = 0.4,
}: {
  sections: ProximitySection[];
  side?: "left" | "right";
  activeOffset?: number;
}) {
  const dashes = useRef(new Map<string, HTMLButtonElement>());
  const pointerInside = useRef(false);
  const resetTimer = useRef<number | null>(null);
  const [activeId, setActiveId] = useState(sections[0]?.id);

  const apply = useCallback((cursorY: number) => {
    for (const [, node] of dashes.current) {
      const lvl = (Number(node.dataset.level) === 3 ? 3 : 2) as 2 | 3;
      const { base, bump } = WIDTHS[lvl];
      const r = node.getBoundingClientRect();
      const d = Math.abs(cursorY - (r.top + r.height / 2));
      const t = Number.isFinite(cursorY) ? Math.max(0, 1 - d / RADIUS) : 0;
      // Set on the line itself rather than the button: the custom property is
      // consumed there, and relying on inheritance adds a hop for no benefit.
      const line = node.firstElementChild as HTMLElement | null;
      line?.style.setProperty("--dash", String((base + bump * t) / MAX_DASH));
    }
  }, []);

  const pulse = useCallback((id?: string) => {
    if (resetTimer.current) { window.clearTimeout(resetTimer.current); resetTimer.current = null; }
    const node = id ? dashes.current.get(id) : undefined;
    if (!node) { apply(Infinity); return; }
    const r = node.getBoundingClientRect();
    apply(r.top + r.height / 2);
    if (pointerInside.current) return;
    resetTimer.current = window.setTimeout(() => { apply(Infinity); resetTimer.current = null; }, IDLE_RESET);
  }, [apply]);

  const select = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
    pulse(id);
  }, [pulse]);

  // Scroll spy: whichever section straddles the anchor line wins.
  useEffect(() => {
    if (!sections.length) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const anchor = window.innerHeight * activeOffset;
      let best = sections[0]?.id;
      let nearest = Infinity;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const inside = r.top <= anchor && r.bottom >= anchor;
        const d = inside ? 0 : Math.min(Math.abs(r.top - anchor), Math.abs(r.bottom - anchor));
        if (d < nearest) { nearest = d; best = s.id; }
      }
      setActiveId(best);
      if (!pointerInside.current) pulse(best);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    };
  }, [sections, activeOffset, pulse]);

  if (sections.length < 2) return null;

  return (
    <nav
      aria-label="Page sections"
      className={`prox prox-${side}`}
      onPointerMove={(e) => { pointerInside.current = true; apply(e.clientY); }}
      onPointerLeave={() => { pointerInside.current = false; apply(Infinity); }}
    >
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          ref={(n) => { if (n) dashes.current.set(s.id, n); else dashes.current.delete(s.id); }}
          data-level={s.level ?? 2}
          aria-current={s.id === activeId ? "location" : undefined}
          aria-label={`Go to ${s.label}`}
          title={s.label}
          className={`prox-dash${s.id === activeId ? " is-active" : ""}`}
          onClick={() => select(s.id)}
        >
          <span className="prox-line" />
        </button>
      ))}
    </nav>
  );
}

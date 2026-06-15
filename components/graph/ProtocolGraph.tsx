"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Glyph, { ERA_LABELS } from "@/components/Glyph";

export type GraphNode = {
  id: string; era: string; name: string; tagline: string; tradfi: string; connects: string[]; significance: number;
};

type Sim = GraphNode & {
  short: string; r: number; x: number; y: number; vx: number; vy: number; fx: number; fy: number;
};

export default function ProtocolGraph({ nodes }: { nodes: GraphNode[] }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const byId = useRef<Record<string, Sim>>({});

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const TAU = Math.PI * 2;

    const sims: Sim[] = nodes.map((n) => ({
      ...n,
      short: n.name.length > 12 ? n.name.split(" ")[0] : n.name,
      r: 9 + (n.significance / 30) * 9,
      x: 0, y: 0, vx: 0, vy: 0, fx: 0, fy: 0,
    }));
    const map: Record<string, Sim> = {};
    sims.forEach((s) => (map[s.id] = s));
    byId.current = map;

    const seen = new Set<string>();
    const edges: [string, string][] = [];
    sims.forEach((n) =>
      n.connects.forEach((tid) => {
        const k = [n.id, tid].sort().join("|");
        if (!seen.has(k) && map[tid]) { seen.add(k); edges.push([n.id, tid]); }
      })
    );

    let W = 0, H = 0, placed = false;
    let hoverId: string | null = null, dragId: string | null = null;
    let dragMoved = 0, lastX = 0, lastY = 0, downEmpty = false;
    const specks = Array.from({ length: 70 }, () => ({
      x: Math.random(), y: Math.random(), s: Math.random() * 1.3 + 0.4,
      vx: (Math.random() - 0.5) * 0.00007, vy: (Math.random() - 0.5) * 0.00007,
    }));

    function geom() {
      const cx = W * 0.5, cy = H * 0.48;
      const Rx = Math.min(W * 0.46, H * 0.95);
      const Ry = Math.min(H * 0.42, W * 0.42);
      return { cx, cy, Rx, Ry };
    }

    function place() {
      const g = geom();
      const eras = ["v0", "v1", "v2", "esoteric", "ref", "infra"];
      const counts: Record<string, number> = {}, idx: Record<string, number> = {};
      sims.forEach((n) => (counts[n.era] = (counts[n.era] || 0) + 1));
      sims.forEach((n) => {
        const k = idx[n.era] || 0; idx[n.era] = k + 1;
        const ei = Math.max(0, eras.indexOf(n.era));
        const within = (k + 0.5) / counts[n.era];
        const ang = (ei / eras.length) * TAU + (within - 0.5) * 1.4;
        const zig = k % 2 === 0 ? 1.08 : 0.8;
        const R = Math.min(g.Rx, g.Ry) * 0.92;
        n.x = g.cx + Math.cos(ang) * R * zig + (Math.random() - 0.5) * 8;
        n.y = g.cy + Math.sin(ang) * R * zig * (g.Ry / g.Rx) + (Math.random() - 0.5) * 8;
      });
      placed = true;
    }

    function resize() {
      const rect = cv!.parentElement!.getBoundingClientRect();
      W = rect.width; H = rect.height;
      cv!.width = W * dpr; cv!.height = H * dpr;
      cv!.style.width = W + "px"; cv!.style.height = H + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!placed && W > 0) place();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv.parentElement!);

    function step() {
      const { cx, cy, Rx, Ry } = geom();
      for (let i = 0; i < sims.length; i++) {
        const a = sims[i];
        let fx = 0, fy = 0;
        for (let j = 0; j < sims.length; j++) {
          if (i === j) continue;
          const b = sims[j];
          let dx = a.x - b.x, dy = a.y - b.y;
          let d2 = dx * dx + dy * dy; if (d2 < 1) d2 = 1;
          const f = 14000 / d2, d = Math.sqrt(d2);
          fx += (dx / d) * f; fy += (dy / d) * f;
        }
        fx += (cx - a.x) * 0.0011; fy += (cy - a.y) * 0.0026;
        a.fx = fx; a.fy = fy;
      }
      for (const e of edges) {
        const a = map[e[0]], b = map[e[1]];
        let dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (d - 120) * 0.007, ux = dx / d, uy = dy / d;
        a.fx += ux * f; a.fy += uy * f; b.fx -= ux * f; b.fy -= uy * f;
      }
      for (const a of sims) {
        if (a.id === dragId) continue;
        a.vx = (a.vx + a.fx) * 0.82; a.vy = (a.vy + a.fy) * 0.82;
        const sp = Math.hypot(a.vx, a.vy);
        if (sp > 5) { a.vx *= 5 / sp; a.vy *= 5 / sp; }
        a.x += a.vx; a.y += a.vy;
        const nx = (a.x - cx) / Rx, ny = (a.y - cy) / Ry, rr = Math.hypot(nx, ny);
        if (rr > 1) { a.x = cx + (nx / rr) * Rx; a.y = cy + (ny / rr) * Ry; a.vx *= 0.4; a.vy *= 0.4; }
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      for (const s of specks) {
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0) s.x += 1; if (s.x > 1) s.x -= 1;
        if (s.y < 0) s.y += 1; if (s.y > 1) s.y -= 1;
        ctx!.fillStyle = "rgba(26,24,19,0.055)";
        ctx!.fillRect(s.x * W, s.y * H, s.s, s.s);
      }
      const active = selectedRef.current || hoverId;
      const nb = new Set<string>();
      if (active) {
        for (const e of edges) { if (e[0] === active) nb.add(e[1]); if (e[1] === active) nb.add(e[0]); }
        nb.add(active);
      }
      for (const e of edges) {
        const a = map[e[0]], b = map[e[1]];
        const hot = active && (e[0] === active || e[1] === active);
        ctx!.strokeStyle = hot ? "rgba(26,24,19,.6)" : active ? "rgba(26,24,19,.055)" : "rgba(26,24,19,.15)";
        ctx!.lineWidth = hot ? 1.5 : 1;
        ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y); ctx!.stroke();
      }
      // label backplates
      ctx!.font = '11px var(--font-jetbrains), monospace';
      ctx!.textAlign = "center"; ctx!.textBaseline = "top";
      for (const n of sims) {
        const isNb = active && nb.has(n.id);
        const ly = n.y + n.r + 7;
        const tw = ctx!.measureText(n.short).width;
        ctx!.fillStyle = "rgba(232,227,214," + (active ? (isNb ? 0.88 : 0.4) : 0.8) + ")";
        ctx!.fillRect(n.x - tw / 2 - 4, ly - 2, tw + 8, 15);
      }
      // nodes
      for (const n of sims) {
        const isActive = active && n.id === active;
        const dim = active && !nb.has(n.id);
        const r = n.r;
        ctx!.save();
        ctx!.globalAlpha = dim ? 0.22 : 1;
        ctx!.strokeStyle = "#1a1813"; ctx!.fillStyle = "#1a1813"; ctx!.lineWidth = 1.6;
        if (n.era === "esoteric") {
          ctx!.beginPath();
          ctx!.moveTo(n.x, n.y - r); ctx!.lineTo(n.x + r, n.y); ctx!.lineTo(n.x, n.y + r); ctx!.lineTo(n.x - r, n.y); ctx!.closePath();
          isActive ? ctx!.fill() : ctx!.stroke();
        } else if (n.era === "ref") {
          ctx!.beginPath(); ctx!.rect(n.x - r, n.y - r, r * 2, r * 2);
          isActive ? ctx!.fill() : ctx!.stroke();
        } else if (n.era === "infra") {
          ctx!.beginPath(); ctx!.moveTo(n.x, n.y - r); ctx!.lineTo(n.x, n.y + r); ctx!.stroke();
          ctx!.beginPath(); ctx!.moveTo(n.x - r, n.y); ctx!.lineTo(n.x + r, n.y); ctx!.stroke();
        } else {
          ctx!.beginPath(); ctx!.arc(n.x, n.y, r, 0, TAU);
          if (n.era === "v0" || isActive) ctx!.fill();
          if (n.era !== "v0") ctx!.stroke();
          if (n.era === "v2") {
            ctx!.beginPath(); ctx!.arc(n.x, n.y, r * 0.34, 0, TAU);
            ctx!.fillStyle = isActive ? "#efeadd" : "#1a1813"; ctx!.fill();
          }
        }
        if (isActive) {
          ctx!.globalAlpha = 0.4; ctx!.lineWidth = 1;
          ctx!.beginPath(); ctx!.arc(n.x, n.y, r + 8, 0, TAU); ctx!.stroke();
        }
        ctx!.restore();
      }
      // labels
      ctx!.font = '11px var(--font-jetbrains), monospace';
      ctx!.textAlign = "center"; ctx!.textBaseline = "top";
      for (const n of sims) {
        const isActive = active && n.id === active, isNb = active && nb.has(n.id);
        const al = active ? (isActive ? 0.95 : isNb ? 0.78 : 0.14) : 0.64;
        ctx!.fillStyle = "rgba(26,24,19," + al + ")";
        ctx!.fillText(n.short, n.x, n.y + n.r + 7);
      }
    }

    let raf = 0;
    function loop() { if (placed) step(); draw(); raf = requestAnimationFrame(loop); }
    loop();

    function pick(x: number, y: number) {
      let best: Sim | null = null, bd = Infinity;
      for (const n of sims) { const d = Math.hypot(n.x - x, n.y - y); if (d < n.r + 9 && d < bd) { bd = d; best = n; } }
      return best;
    }
    function pt(e: PointerEvent) { const rect = cv!.getBoundingClientRect(); return { x: e.clientX - rect.left, y: e.clientY - rect.top }; }

    function onMove(e: PointerEvent) {
      const { x, y } = pt(e);
      if (dragId) { const n = map[dragId]; dragMoved += Math.hypot(x - lastX, y - lastY); n.x = x; n.y = y; n.vx = 0; n.vy = 0; lastX = x; lastY = y; return; }
      const b = pick(x, y); hoverId = b ? b.id : null; cv!.style.cursor = hoverId ? "pointer" : "default";
    }
    function onDown(e: PointerEvent) {
      const { x, y } = pt(e); const b = pick(x, y);
      dragMoved = 0; lastX = x; lastY = y;
      if (b) { dragId = b.id; downEmpty = false; } else { dragId = null; downEmpty = true; }
    }
    function onUp() {
      if (dragId) {
        if (dragMoved < 5) { selectedRef.current = dragId; setSelectedId(dragId); }
        dragId = null;
      } else if (downEmpty && dragMoved < 5) {
        if (selectedRef.current) { selectedRef.current = null; setSelectedId(null); }
      }
      downEmpty = false;
    }
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [nodes]);

  const sel = selectedId ? byId.current[selectedId] : null;

  function selectNode(id: string) { selectedRef.current = id; setSelectedId(id); }
  function close() { selectedRef.current = null; setSelectedId(null); }

  return (
    <div className="graph-screen">
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", width: "92vh", height: "92vh", margin: "auto", border: "1px dashed rgba(26,24,19,.055)", pointerEvents: "none", animation: "ringSpin 160s linear infinite", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", width: "60vh", height: "60vh", margin: "auto", border: "1px dotted rgba(26,24,19,.045)", pointerEvents: "none", animation: "ringSpinR 110s linear infinite", zIndex: 0 }} />
      <canvas ref={canvasRef} className="graph-canvas" style={{ position: "absolute", inset: 0, zIndex: 1 }} />
      <header className="graph-header">
        <div className="graph-title">DeFiGrail</div>
        <div className="graph-subtitle">An interactive map of decentralized finance</div>
        <div className="graph-count">{nodes.length} protocols &amp; concepts</div>
      </header>
      <div className="graph-legend">
        <div className="graph-legend-item"><Glyph era="v0" /> Foundational · v0</div>
        <div className="graph-legend-item"><Glyph era="v1" /> Composability · v1</div>
        <div className="graph-legend-item"><Glyph era="v2" /> Modern Frontier · v2</div>
        <div className="graph-legend-item"><Glyph era="esoteric" /> Esoteric</div>
      </div>
      {!sel && (
        <div className="graph-hint">
          <div className="graph-hint-text">Select a node to read its deep-dive</div>
          <div className="graph-hint-sub">drag to rearrange · hover to trace links</div>
        </div>
      )}
      {sel && (
        <div className="graph-panel">
          <button className="graph-panel-close" onClick={close}>✕</button>
          <div className="graph-panel-era">{ERA_LABELS[sel.era] ?? sel.era}</div>
          <h2 className="graph-panel-h1">{sel.name}</h2>
          <div className="graph-panel-tagline">{sel.tagline}</div>
          <div className="graph-panel-divider" />
          {sel.tradfi && (
            <div style={{ marginBottom: 22 }}>
              <div className="graph-panel-label">TradFi anchor</div>
              <p>{sel.tradfi}</p>
            </div>
          )}
          <div>
            <div className="graph-panel-label">Connected concepts</div>
            <div className="connected-chips">
              {sel.connects.filter((id) => byId.current[id]).map((cid) => (
                <button key={cid} className="connected-chip" onClick={() => selectNode(cid)}>
                  {byId.current[cid].name} ↗
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <button className="btn-secondary" style={{ fontSize: 12, padding: "9px 16px" }} onClick={() => router.push(`/learn/${sel.id}`)}>
              Open full deep-dive →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

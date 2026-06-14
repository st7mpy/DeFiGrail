// Era glyph — monochrome shape encodes the era (no color), 1:1 from the design.
// v0 filled circle · v1 ring · v2 ring+dot · esoteric diamond · ref square · infra cross
export const ERA_LABELS: Record<string, string> = {
  v0: "Foundational · v0",
  v1: "Composability · v1",
  v2: "Modern Frontier · v2",
  esoteric: "Esoteric",
  ref: "Reference",
  infra: "Infrastructure",
};

export default function Glyph({ era, size = 12 }: { era: string; size?: number }) {
  const s = size, h = s / 2, ink = "#1a1813";
  const sw = 1.5;
  if (era === "v0")
    return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><circle cx={h} cy={h} r={h} fill={ink} /></svg>;
  if (era === "v1")
    return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><circle cx={h} cy={h} r={h - sw} fill="none" stroke={ink} strokeWidth={sw} /></svg>;
  if (era === "v2")
    return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><circle cx={h} cy={h} r={h - sw} fill="none" stroke={ink} strokeWidth={sw} /><circle cx={h} cy={h} r={h * 0.33} fill={ink} /></svg>;
  if (era === "esoteric" || era === "eso") {
    const p = h * 0.18;
    return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><polygon points={`${h},${p} ${s - p},${h} ${h},${s - p} ${p},${h}`} fill="none" stroke={ink} strokeWidth={sw} /></svg>;
  }
  if (era === "ref")
    return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><rect x={1.5} y={1.5} width={s - 3} height={s - 3} fill="none" stroke={ink} strokeWidth={sw} /></svg>;
  if (era === "infra")
    return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><line x1={h} y1={0} x2={h} y2={s} stroke={ink} strokeWidth={sw} /><line x1={0} y1={h} x2={s} y2={h} stroke={ink} strokeWidth={sw} /></svg>;
  return null;
}

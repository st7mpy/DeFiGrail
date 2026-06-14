import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "100px 0 120px", maxWidth: 560 }}>
      <div style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(26,24,19,.5)" }}>
        ERR 404 · route not indexed
      </div>
      <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 44, lineHeight: 1.05, marginTop: 14 }}>
        This page isn&rsquo;t on the map.
      </h1>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: 18, lineHeight: 1.55, color: "rgba(26,24,19,.7)", marginTop: 14 }}>
        The link may be stale, or the topic was renamed. Try the knowledge graph or press
        {" "}<kbd style={{ fontFamily: "var(--font-mono)", fontSize: 12, border: "1px solid rgba(26,24,19,.25)", borderRadius: 4, padding: "1px 6px" }}>⌘K</kbd>{" "}
        to search.
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
        <Link className="btn-primary" href="/">Back to home →</Link>
        <Link className="btn-secondary" href="/graph">Open the graph</Link>
      </div>
    </div>
  );
}

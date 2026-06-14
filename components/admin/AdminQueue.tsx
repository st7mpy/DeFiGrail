"use client";
import { useState } from "react";

export type PendingItem = { id: string; title: string; author: string; category: string; date: string; body: string };

export default function AdminQueue({ initial }: { initial: PendingItem[] }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function review(id: string, action: "approve" | "reject") {
    setBusy(id);
    setErr(null);
    try {
      // browser attaches the cached Basic-auth creds automatically (same origin)
      const res = await fetch("/api/admin/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) setItems((xs) => xs.filter((x) => x.id !== id));
      else setErr(`Review failed (${res.status}).`);
    } catch {
      setErr("Network error.");
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return <p style={{ fontFamily: "var(--font-serif)", fontSize: 17, color: "rgba(26,24,19,.6)" }}>No pending submissions. 🎉</p>;
  }

  return (
    <div>
      {err && <div style={{ color: "#9a2b1e", fontSize: 12, marginBottom: 12 }}>{err}</div>}
      {items.map((s) => (
        <div className="submission-card" key={s.id}>
          <div className="submission-header">
            <div>
              <span className="status-badge pending">pending</span>
              <span style={{ fontSize: 11, color: "rgba(26,24,19,.45)", marginLeft: 10 }}>{s.category} · {s.date}</span>
            </div>
            <span style={{ fontSize: 11, color: "rgba(26,24,19,.5)" }}>by {s.author}</span>
          </div>
          <div className="submission-title">{s.title}</div>
          <div className="submission-body" style={{ whiteSpace: "pre-wrap" }}>{s.body.slice(0, 600)}{s.body.length > 600 ? "…" : ""}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn-primary" disabled={busy === s.id} onClick={() => review(s.id, "approve")}>
              {busy === s.id ? "…" : "Approve"}
            </button>
            <button className="btn-secondary" disabled={busy === s.id} onClick={() => review(s.id, "reject")}>
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

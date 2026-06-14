"use client";
import { useState } from "react";

const CATEGORIES = [
  { v: "v0", label: "Foundations" },
  { v: "v1", label: "Composability" },
  { v: "v2", label: "Modern Frontier" },
  { v: "esoteric", label: "Esoteric" },
  { v: "infra", label: "Infrastructure" },
  { v: "general", label: "General" },
];

type Errors = Record<string, string[] | undefined>;

export default function CommunityForm() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    setErrors({});
    const f = new FormData(e.currentTarget);
    const payload = {
      title: String(f.get("title") || ""),
      category: String(f.get("category") || "general"),
      bodyMd: String(f.get("bodyMd") || ""),
      authorName: String(f.get("authorName") || ""),
      authorContact: String(f.get("authorContact") || ""),
      authorLink: String(f.get("authorLink") || ""),
      website: String(f.get("website") || ""), // honeypot
    };
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSent(true);
      } else if (res.status === 400) {
        setErrors(data.errors || {});
        setMessage("Please fix the highlighted fields.");
      } else {
        setMessage(data.message || "Something went wrong — please try again.");
      }
    } catch {
      setMessage("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="submit-form">
        <div className="submit-h3">Thanks — submission received</div>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: 16, lineHeight: 1.6, color: "rgba(26,24,19,.75)" }}>
          Your piece is queued for editorial review. Approved guides appear in the Featured section,
          usually within a few days.
        </p>
        <button className="btn-secondary" style={{ marginTop: 18 }} onClick={() => setSent(false)}>
          Submit another →
        </button>
      </div>
    );
  }

  const err = (k: string) => (errors[k] ? <div style={{ color: "#9a2b1e", fontSize: 11, marginTop: 5 }}>{errors[k]![0]}</div> : null);

  return (
    <form className="submit-form" onSubmit={onSubmit}>
      <div className="submit-h3">Submit a piece</div>
      <div className="form-field">
        <label className="form-label">Title</label>
        <input className="form-input" name="title" required placeholder="e.g. A visual guide to concentrated liquidity" />
        {err("title")}
      </div>
      <div className="form-field">
        <label className="form-label">Category</label>
        <select className="form-select" name="category" defaultValue="general">
          {CATEGORIES.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
        </select>
      </div>
      <div className="form-field">
        <label className="form-label">Content (Markdown)</label>
        <textarea className="form-textarea" name="bodyMd" required placeholder="Write your guide here… (min ~200 characters)" />
        {err("bodyMd")}
      </div>
      <div className="form-field">
        <label className="form-label">Your handle</label>
        <input className="form-input" name="authorName" required placeholder="0xYou" />
        {err("authorName")}
      </div>
      <div className="form-field">
        <label className="form-label">Email (private — for review contact only)</label>
        <input className="form-input" name="authorContact" type="email" required placeholder="you@example.com" />
        {err("authorContact")}
      </div>
      <div className="form-field">
        <label className="form-label">Link (optional)</label>
        <input className="form-input" name="authorLink" placeholder="https://your-site.xyz" />
        {err("authorLink")}
      </div>
      {/* honeypot — visually hidden, off the tab order */}
      <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      {message && <div style={{ color: "#9a2b1e", fontSize: 12, marginBottom: 12 }}>{message}</div>}
      <button className="btn-primary" type="submit" disabled={busy}>
        {busy ? "Submitting…" : "Submit for review →"}
      </button>
    </form>
  );
}

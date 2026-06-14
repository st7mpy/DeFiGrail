"use client";
import { useState } from "react";

// Submit form — UI 1:1 with the design. Wires to the real /api/submissions
// pipeline in a later task; for now it confirms receipt client-side.
export default function CommunityForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="submit-form">
        <div className="submit-h3">Thanks — submission received</div>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: 16, lineHeight: 1.6, color: "rgba(26,24,19,.75)" }}>
          Your piece is queued for editorial review. Approved guides appear in the Featured section.
        </p>
        <button className="btn-secondary" style={{ marginTop: 18 }} onClick={() => setSent(false)}>
          Submit another →
        </button>
      </div>
    );
  }

  return (
    <form
      className="submit-form"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div className="submit-h3">Submit a piece</div>
      <div className="form-field">
        <label className="form-label">Title</label>
        <input className="form-input" required placeholder="e.g. A visual guide to concentrated liquidity" />
      </div>
      <div className="form-field">
        <label className="form-label">Category</label>
        <select className="form-select">
          <option>Foundations</option>
          <option>Composability</option>
          <option>Modern Frontier</option>
          <option>Esoteric</option>
          <option>Infrastructure</option>
        </select>
      </div>
      <div className="form-field">
        <label className="form-label">Content (Markdown)</label>
        <textarea className="form-textarea" required placeholder="Write your guide here…" />
      </div>
      <div className="form-field">
        <label className="form-label">Your handle</label>
        <input className="form-input" required placeholder="0xYou" />
      </div>
      <button className="btn-primary" type="submit">Submit for review →</button>
    </form>
  );
}

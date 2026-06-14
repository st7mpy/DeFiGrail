"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div style={{ padding: "100px 0 120px", maxWidth: 560 }}>
      <div style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(26,24,19,.5)" }}>
        ERR · unexpected fault
      </div>
      <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 44, lineHeight: 1.05, marginTop: 14 }}>
        Something broke on our end.
      </h1>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: 18, lineHeight: 1.55, color: "rgba(26,24,19,.7)", marginTop: 14 }}>
        This view hit an error while rendering. You can retry, and if it persists the issue is on our side.
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
        <button className="btn-primary" onClick={reset}>Try again →</button>
        <a className="btn-secondary" href="/">Back to home</a>
      </div>
    </div>
  );
}

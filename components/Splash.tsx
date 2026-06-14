"use client";
import { useEffect, useState } from "react";

// Brief load splash — 1:1 from the design. Fades after content is ready.
export default function Splash() {
  const [phase, setPhase] = useState<"show" | "hiding" | "gone">("show");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hiding"), 600);
    const t2 = setTimeout(() => setPhase("gone"), 1050);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  if (phase === "gone") return null;
  return (
    <div id="splash" className={phase === "hiding" ? "hidden" : ""}>
      <div style={{ textAlign: "center" }}>
        <div className="splash-title">DeFiGrail</div>
        <div className="splash-sub">LOADING CONTENT INDEX…</div>
      </div>
    </div>
  );
}

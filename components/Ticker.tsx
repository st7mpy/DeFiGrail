"use client";
import { useEffect, useState } from "react";

type Asset = { sym: string; price: string; chg: string; up: boolean };

// Renders nothing until live data arrives from /api/news — no placeholder prices.
export default function Ticker() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [asOf, setAsOf] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/news")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.assets?.length) {
          setAssets(d.assets);
          setAsOf(d.asOf);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (assets.length === 0) return null;

  return (
    <div className="ticker">
      <div className="ticker-inner">
        <span className="ticker-live"><span className="ticker-dot" />LIVE</span>
        <div className="ticker-items">
          {assets.map((a) => (
            <span className="ticker-item" key={a.sym}>
              <span className="ticker-sym">{a.sym}</span>
              <span className="ticker-price">{a.price}</span>
              <span className={a.up ? "ticker-up" : "ticker-dn"}>{a.chg}</span>
            </span>
          ))}
        </div>
        <span className="ticker-asof">DATA AS OF {asOf}</span>
      </div>
    </div>
  );
}

import { MARKET } from "@/lib/site-data";

export default function Ticker() {
  return (
    <div className="ticker">
      <div className="ticker-inner">
        <span className="ticker-live"><span className="ticker-dot" />LIVE</span>
        <div className="ticker-items">
          {MARKET.assets.map((a) => (
            <span className="ticker-item" key={a.sym}>
              <span className="ticker-sym">{a.sym}</span>
              <span className="ticker-price">{a.price}</span>
              <span className={a.up ? "ticker-up" : "ticker-dn"}>{a.chg}</span>
            </span>
          ))}
        </div>
        <span className="ticker-asof">DATA AS OF {MARKET.asOf}</span>
      </div>
    </div>
  );
}

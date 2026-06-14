import type { Metadata } from "next";
import { getNewsData } from "@/lib/news";

export const metadata: Metadata = { title: "News" };
export const revalidate = 1800;

export default async function NewsPage() {
  const data = await getNewsData();
  return (
    <div className="news-layout">
      <div className="page-head">
        <div className="page-head-h1">Market &amp; headlines</div>
        <div className="page-head-sub">
          Live DeFi news and market data · data as of {data.asOf}
          {data.degraded.length > 0 && " · some sources warming up"}
        </div>
      </div>

      <div className="market-grid" style={{ paddingBottom: 24 }}>
        <div className="news-full-list">
          {data.headlines.map((h, i) => {
            const external = h.url && h.url !== "#";
            const inner = (
              <>
                <span className="news-source">{h.source}</span>
                <span className="news-title">{h.title}</span>
                <span className="news-time">{h.time}</span>
              </>
            );
            return external ? (
              <a key={i} className="news-full-row" href={h.url} target="_blank" rel="noopener noreferrer">{inner}</a>
            ) : (
              <div key={i} className="news-full-row">{inner}</div>
            );
          })}
        </div>
        <div className="tvl-card">
          <div className="tvl-label">TVL by chain</div>
          <div className="tvl-rows">
            {data.chains.map((c) => (
              <div key={c.name}>
                <div className="tvl-row-top"><span>{c.name}</span><span className="tvl-row-val">{c.tvl}</span></div>
                <div className="tvl-bar"><div className="tvl-bar-fill" style={{ width: `${Math.min(100, c.share)}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

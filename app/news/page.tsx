import type { Metadata } from "next";
import { NEWS_ITEMS, MARKET } from "@/lib/site-data";

export const metadata: Metadata = { title: "News" };

export default function NewsPage() {
  return (
    <div className="news-layout">
      <div className="page-head">
        <div className="page-head-h1">Market &amp; headlines</div>
        <div className="page-head-sub">DeFi news and protocol updates · data as of {MARKET.asOf}</div>
      </div>
      <div className="news-full-list">
        {NEWS_ITEMS.map((h, i) => (
          <div className="news-full-row" key={i}>
            <span className="news-source">{h.source}</span>
            <span className="news-title">{h.title}</span>
            <span className="news-time">{h.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

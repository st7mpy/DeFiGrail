import Link from "next/link";
import TrackSection from "@/components/home/TrackSection";
import { topicCards, trackViews } from "@/lib/topic-cards";
import { FEATURED } from "@/lib/site-data";
import { getNewsData } from "@/lib/news";
import glossary from "@/content/glossary.json";

export const revalidate = 1800;

export default async function Home() {
  const topics = topicCards();
  const tracks = trackViews();
  const glossaryCount = (glossary as unknown[]).length;
  const market = await getNewsData();

  return (
    <>
      <section className="home-hero">
        <div className="hero-eyebrow">An interactive DeFi curriculum</div>
        <h1 className="hero-h1">Learn DeFi the way a trading desk would teach it.</h1>
        <p className="hero-sub">
          Every protocol anchored to its TradFi equivalent, every formula made interactive, every
          advanced idea preceded by exactly what you must read first.
        </p>
        <div className="hero-ctas">
          <Link className="btn-primary" href="/learn/uniswap-v2">Start the Foundations track →</Link>
          <Link className="btn-secondary" href="/graph">Open the knowledge graph</Link>
        </div>
        <div className="hero-stats">
          <div><div className="stat-num">{topics.length}</div><div className="stat-label">Topics</div></div>
          <div><div className="stat-num">{tracks.length}</div><div className="stat-label">Tracks</div></div>
          <div><div className="stat-num">4</div><div className="stat-label">Live charts</div></div>
          <div><div className="stat-num">{glossaryCount}</div><div className="stat-label">Glossary terms</div></div>
        </div>
      </section>

      <TrackSection tracks={tracks} totalTopics={topics.length} />

      <section style={{ padding: "8px 0 0" }}>
        <div className="section-header">
          <h2 className="section-h2">Featured from the community</h2>
          <Link className="section-link" href="/community">SUBMIT YOURS →</Link>
        </div>
        <div className="featured-grid">
          {FEATURED.map((f) => (
            <div className="featured-card" key={f.slug}>
              <div className="featured-card-top"><span>{f.category}</span><span>{f.read}</span></div>
              <h3 className="featured-title">{f.title}</h3>
              <p className="featured-blurb">{f.blurb}</p>
              <div className="featured-byline">by {f.author} · {f.date}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "8px 0 0" }}>
        <div className="section-header">
          <h2 className="section-h2">Market &amp; headlines</h2>
          <Link className="section-link" href="/news">ALL NEWS →</Link>
        </div>
        <div className="market-grid">
          <div className="news-list">
            {market.headlines.slice(0, 4).map((h, i) => (
              <div className="news-row" key={i}>
                <span className="news-source">{h.source}</span>
                <span className="news-title">{h.title}</span>
                <span className="news-time">{h.time}</span>
              </div>
            ))}
          </div>
          <div className="tvl-card">
            <div className="tvl-label">TVL by chain</div>
            <div className="tvl-rows">
              {market.chains.map((c) => (
                <div key={c.name}>
                  <div className="tvl-row-top"><span>{c.name}</span><span className="tvl-row-val">{c.tvl}</span></div>
                  <div className="tvl-bar"><div className="tvl-bar-fill" style={{ width: `${Math.min(100, c.share)}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

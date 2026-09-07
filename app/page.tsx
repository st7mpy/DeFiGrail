import Link from "next/link";
import HeroPixels from "@/components/home/HeroPixels";
import TrackSection from "@/components/home/TrackSection";
import { topicCards, trackViews } from "@/lib/topic-cards";
import { getNewsData } from "@/lib/news";
import { listApproved } from "@/lib/submissions";
import glossary from "@/content/glossary.json";

// Cached until /api/admin/review invalidates it — the featured grid is the
// only DB-backed content here, and approval is its only source of change.
export const revalidate = false;

export default async function Home() {
  const topics = topicCards();
  const tracks = trackViews();
  const glossaryCount = (glossary as unknown[]).length;
  const market = await getNewsData();
  const approved = await listApproved(3);
  const featured = approved.map((a) => ({ slug: a.slug, title: a.title, author: a.author, date: a.date, category: a.category, blurb: a.blurb, read: a.read, href: `/featured/${a.slug}` }));

  return (
    <>
      <section className="home-hero">
        <div className="hero-aurora" aria-hidden="true" />
        <div className="hero-eyebrow">An interactive DeFi curriculum</div>
        <HeroPixels text="DeFi, For Everyone" />
        <p className="hero-sub">
          Every protocol anchored to its TradFi equivalent, every formula made interactive, every
          advanced idea preceded by exactly what you must read first.
        </p>
        <div className="hero-ctas">
          <Link className="btn-primary" href="/learn/uniswap-v2">Start the Foundations track →</Link>
          <Link className="btn-secondary" href="/graph">Open the knowledge graph</Link>
          <Link className="btn-secondary" href="/community">Submit your content →</Link>
        </div>
        <div className="hero-stats">
          <div><div className="stat-num">{topics.length}</div><div className="stat-label">Topics</div></div>
          <div><div className="stat-num">{tracks.length}</div><div className="stat-label">Tracks</div></div>
          <div><div className="stat-num">5</div><div className="stat-label">Interactive tools</div></div>
          <div><div className="stat-num">{glossaryCount}</div><div className="stat-label">Glossary terms</div></div>
        </div>
      </section>

      <TrackSection tracks={tracks} totalTopics={topics.length} />

      <section style={{ padding: "8px 0 0" }}>
        <div className="section-header">
          <h2 className="section-h2">Featured from the community</h2>
          <Link className="section-link" href="/community">SUBMIT YOURS →</Link>
        </div>
        {featured.length === 0 ? (
          <div className="featured-empty">
            No community pieces published yet.{" "}
            <Link href="/community">Write the first one →</Link>
          </div>
        ) : (
        <div className="featured-grid">
          {featured.map((f) => (
            <Link key={f.slug} href={f.href} className="featured-card" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <div className="featured-card-top"><span>{f.category}</span><span>{f.read}</span></div>
              <h3 className="featured-title">{f.title}</h3>
              <p className="featured-blurb">{f.blurb}</p>
              <div className="featured-byline">by {f.author} · {f.date}</div>
            </Link>
          ))}
        </div>
        )}
      </section>

      <section style={{ padding: "8px 0 0" }}>
        <div className="section-header">
          <h2 className="section-h2">Market &amp; headlines</h2>
          <Link className="section-link" href="/news">ALL NEWS →</Link>
        </div>
        <div className="market-grid">
          <div className="news-list">
            {market.headlines.slice(0, 4).map((h, i) => {
              const inner = (
                <>
                  <span className="news-source">{h.source}</span>
                  <span className="news-title">{h.title}</span>
                  <span className="news-time">{h.time}</span>
                </>
              );
              // Same guard as /news: the fallback path emits url "#", which is
              // not a destination — render those as plain rows, not dead links.
              return h.url && h.url !== "#" ? (
                <a className="news-row is-link" key={i} href={h.url} target="_blank" rel="noopener noreferrer">{inner}</a>
              ) : (
                <div className="news-row" key={i}>{inner}</div>
              );
            })}
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

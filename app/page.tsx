import Link from "next/link";
import HeroPixels from "@/components/home/HeroPixels";
import TrackSection from "@/components/home/TrackSection";
import { topicCards, trackViews } from "@/lib/topic-cards";
import { getNewsData } from "@/lib/news";
import { listApproved } from "@/lib/submissions";

// Cached until /api/admin/review invalidates it — the featured grid is the
// only DB-backed content here, and approval is its only source of change.
export const revalidate = false;

export default async function Home() {
  const topics = topicCards();
  const tracks = trackViews();
  const market = await getNewsData();
  const approved = await listApproved(3);
  // Link posts now — the card goes straight to where it was published.
  const featured = approved.map((a) => ({ slug: a.slug, title: a.title, author: a.author, date: a.date, category: a.category, blurb: a.blurb, read: a.domain, href: a.url }));

  return (
    <>
      <section className="home-hero">
        <div className="hero-aurora" aria-hidden="true" />
        <HeroPixels text="DeFi, For Everyone" />
        <p className="hero-sub">
          DeFi mechanics have a lot to dump on your brain, we made every formula interactive,
          every idea preceded by exactly what you need to know first.
        </p>
        <ol className="hero-flow" aria-label="How every topic is structured">
          {["Concept", "Mechanics", "Formulas", "Edge cases"].map((step, i) => (
            <li className="hero-flow-step" key={step}>
              <span className="hero-flow-pill" style={{ animationDelay: `${(i * 1.15).toFixed(2)}s` }}>{step}</span>
            </li>
          ))}
        </ol>

        <div className="hero-ctas">
          <Link className="btn-primary" href="/learn/uniswap-v2">Start the Foundations track →</Link>
          <Link className="btn-secondary" href="/graph">Open the knowledge graph</Link>
          <Link className="btn-secondary" href="/community">Submit your content →</Link>
        </div>
      </section>

      <TrackSection tracks={tracks} totalTopics={topics.length} />

      <section style={{ padding: "8px 0 0" }}>
        <div className="section-header">
          <h2 className="section-h2">DeFi&rsquo;s best writeups</h2>
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
            <a key={f.slug} href={f.href} target="_blank" rel="noopener noreferrer nofollow" className="featured-card" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <div className="featured-card-top"><span>{f.category}</span><span>{f.read}</span></div>
              <h3 className="featured-title">{f.title}</h3>
              <p className="featured-blurb">{f.blurb}</p>
              <div className="featured-byline">by {f.author} · {f.date}</div>
            </a>
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
              {/* /news carries the full ten; the landing page stays compact. */}
              {market.chains.slice(0, 5).map((c) => (
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

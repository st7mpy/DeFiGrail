import type { Metadata } from "next";
import CommunityForm from "@/components/community/CommunityForm";
import { listApproved } from "@/lib/submissions";

export const metadata: Metadata = {
  title: "DeFi's Best Writeups",
  description:
    "A running list of the best DeFi writeups on X, Substack, Medium and Mirror — submitted by readers, reviewed before they land.",
};
// Cached until /api/admin/review invalidates it.
export const revalidate = false;

export default async function CommunityPage() {
  const posts = await listApproved();
  return (
    <div className="forum-layout">
      <div className="page-head">
        <div className="page-head-h1">DeFi&rsquo;s Best Writeups</div>
        <div className="page-head-sub">
          The good stuff, wherever it was published. Read something that made a mechanism click?
          Post the link.
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="forum-empty">
          <p>No writeups posted yet.</p>
          <p className="forum-empty-sub">Be the first — the form is below.</p>
        </div>
      ) : (
        <ol className="forum-list">
          {posts.map((p, i) => (
            <li className="forum-row" key={p.slug}>
              <span className="forum-rank">{String(i + 1).padStart(2, "0")}</span>
              <div className="forum-main">
                <a className="forum-title" href={p.url} target="_blank" rel="noopener noreferrer nofollow">
                  {p.title} <span className="forum-domain">{p.domain} ↗</span>
                </a>
                <p className="forum-blurb">{p.blurb}</p>
                <div className="forum-meta">
                  <span className="forum-cat">{p.category}</span>
                  <span>·</span>
                  <span>
                    posted by{" "}
                    {p.authorLink ? (
                      <a href={p.authorLink} target="_blank" rel="noopener noreferrer nofollow">{p.author}</a>
                    ) : (
                      p.author
                    )}
                  </span>
                  <span>·</span>
                  <span>{p.date}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      <CommunityForm />
    </div>
  );
}

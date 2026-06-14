import type { Metadata } from "next";
import Link from "next/link";
import CommunityForm from "@/components/community/CommunityForm";
import { listApproved } from "@/lib/submissions";

export const metadata: Metadata = { title: "Community" };
export const revalidate = 300;

export default async function CommunityPage() {
  const approved = await listApproved();
  return (
    <div className="community-layout">
      <div className="page-head">
        <div className="page-head-h1">Community</div>
        <div className="page-head-sub">Member-submitted guides and essays</div>
      </div>

      <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(26,24,19,.5)", marginBottom: 14 }}>
        Featured pieces
      </div>

      {approved.length === 0 ? (
        <p style={{ fontFamily: "var(--font-serif)", fontSize: 17, color: "rgba(26,24,19,.6)", marginBottom: 8 }}>
          No published pieces yet — be the first to submit one below.
        </p>
      ) : (
        <div className="featured-grid" style={{ paddingBottom: 8 }}>
          {approved.map((f) => (
            <Link key={f.slug} href={`/featured/${f.slug}`} className="featured-card" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <div className="featured-card-top"><span>{f.category}</span><span>{f.read}</span></div>
              <h3 className="featured-title">{f.title}</h3>
              <p className="featured-blurb">{f.blurb}</p>
              <div className="featured-byline">by {f.author} · {f.date}</div>
            </Link>
          ))}
        </div>
      )}

      <CommunityForm />
    </div>
  );
}

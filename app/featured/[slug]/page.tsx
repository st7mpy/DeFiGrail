import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApprovedBySlug } from "@/lib/submissions";
import { renderCommunityMarkdown } from "@/lib/sanitize";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const item = await getApprovedBySlug((await params).slug);
  return item ? { title: item.title, description: item.blurb } : { title: "Featured" };
}

export default async function FeaturedArticle({ params }: { params: Promise<{ slug: string }> }) {
  const item = await getApprovedBySlug((await params).slug);
  if (!item) notFound();
  const html = await renderCommunityMarkdown(item.body);

  return (
    <article className="topic-detail">
      <div className="topic-breadcrumb">
        <Link href="/community">← Community</Link>
      </div>
      <div className="topic-era-tag">{item.category} · community</div>
      <h1 className="topic-h1">{item.title}</h1>
      <div className="featured-byline" style={{ marginTop: 14 }}>
        by {item.authorLink ? <a href={item.authorLink} target="_blank" rel="nofollow noopener noreferrer" style={{ color: "#1a1813", textDecoration: "underline" }}>{item.author}</a> : item.author} · {item.date} · {item.read}
      </div>
      <div className="topic-divider" />
      <div className="prose-paper" dangerouslySetInnerHTML={{ __html: html }} />
      <div className="topic-divider" />
      <p style={{ fontSize: 11, color: "rgba(26,24,19,.5)", fontFamily: "var(--font-mono)" }}>
        Community contribution — not reviewed for financial accuracy. Nothing here is financial advice.
      </p>
    </article>
  );
}

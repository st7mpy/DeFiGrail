import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { loadTopics, getTopic } from "@/lib/mdx";
import { remarkGlossary, type GlossaryEntry } from "@/lib/glossary-remark";
import { nextInTrack } from "@/lib/tracks";
import { trackViews } from "@/lib/topic-cards";
import GlossaryProvider from "@/components/glossary/GlossaryProvider";
import GlossaryTerm from "@/components/glossary/GlossaryTerm";
import MarkAsRead from "@/components/topic/MarkAsRead";
import Glyph, { ERA_LABELS } from "@/components/Glyph";
import ILCurve from "@/components/charts/ILCurve";
import KinkedRate from "@/components/charts/KinkedRate";
import RangeLiquidity from "@/components/charts/RangeLiquidity";
import PTDecay from "@/components/charts/PTDecay";
import glossary from "@/content/glossary.json";

const glossaryTerms = glossary as GlossaryEntry[];
const glossaryDefs = Object.fromEntries(glossaryTerms.map((g) => [g.term, g.def]));

export const dynamicParams = false;
export function generateStaticParams() {
  return loadTopics().map((t) => ({ slug: t.meta.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const t = getTopic((await params).slug);
  return { title: t?.meta.title, description: t?.meta.summary };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const topic = getTopic((await params).slug);
  if (!topic) notFound();

  const prereqs = topic.meta.prereqs
    .map((s) => getTopic(s))
    .filter(Boolean)
    .map((t) => ({ slug: t!.meta.slug, title: t!.meta.title }));
  const related = topic.meta.related
    .map((s) => getTopic(s))
    .filter(Boolean)
    .map((t) => ({ slug: t!.meta.slug, title: t!.meta.title }));
  const next = nextInTrack(topic.meta.slug);
  const trackLabel = trackViews().find((t) => t.id === topic.meta.track)?.name ?? "Learn";

  return (
    <GlossaryProvider defs={glossaryDefs}>
      <article className="topic-detail">
        <div className="topic-breadcrumb">
          <Link href={`/learn?track=${topic.meta.track}`}>← {trackLabel}</Link>
        </div>
        <div className="topic-era-tag">
          <Glyph era={topic.meta.era} size={10} />
          {ERA_LABELS[topic.meta.era] ?? topic.meta.era}
        </div>
        <h1 className="topic-h1">{topic.meta.title}</h1>
        <div className="topic-tagline-text">{topic.meta.summary}</div>
        {topic.meta.tradfiAnchor && (
          <div className="topic-tradfi-tag">
            <span className="topic-tradfi-label">TradFi →</span>
            <span>{topic.meta.tradfiAnchor}</span>
          </div>
        )}

        {prereqs.length > 0 && (
          <>
            <div className="topic-divider" />
            <div className="topic-section">
              <div className="topic-section-label">Prerequisites</div>
              <div className="prereq-chips">
                {prereqs.map((p) => (
                  <Link key={p.slug} href={`/learn/${p.slug}`} className="prereq-chip">{p.title} ↗</Link>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="topic-divider" />

        <div className="prose-paper">
          <MDXRemote
            source={topic.body}
            components={{ GlossaryTerm, ILCurve, KinkedRate, RangeLiquidity, PTDecay }}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm, [remarkGlossary, { terms: glossaryTerms }]] } }}
          />
        </div>

        {related.length > 0 && (
          <div className="topic-section" style={{ marginTop: 30 }}>
            <div className="topic-section-label">Connected concepts</div>
            <div className="connected-chips">
              {related.map((r) => (
                <Link key={r.slug} href={`/learn/${r.slug}`} className="connected-chip">{r.title} ↗</Link>
              ))}
            </div>
          </div>
        )}

        <div className="topic-divider" />
        <div className="topic-nav-btns">
          <MarkAsRead slug={topic.meta.slug} />
          {next && (
            <Link className="btn-secondary" href={`/learn/${next.slug}`}>Next: {next.title} →</Link>
          )}
        </div>
      </article>
    </GlossaryProvider>
  );
}

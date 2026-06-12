import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { loadTopics, getTopic } from "@/lib/mdx";
import { remarkGlossary, type GlossaryEntry } from "@/lib/glossary-remark";
import PrereqChain from "@/components/PrereqChain";
import GlossaryProvider from "@/components/glossary/GlossaryProvider";
import GlossaryTerm from "@/components/glossary/GlossaryTerm";
import glossary from "@/content/glossary.json";

const glossaryTerms = glossary as GlossaryEntry[];
const glossaryDefs = Object.fromEntries(glossaryTerms.map(g => [g.term, g.def]));

export const dynamicParams = false;
export function generateStaticParams() {
  return loadTopics().map(t => ({ slug: t.meta.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const t = getTopic((await params).slug);
  return { title: t?.meta.title, description: t?.meta.summary };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const topic = getTopic((await params).slug);
  if (!topic) notFound();
  const prereqs = topic.meta.prereqs
    .map(s => getTopic(s)).filter(Boolean)
    .map(t => ({ slug: t!.meta.slug, title: t!.meta.title }));
  return (
    <GlossaryProvider defs={glossaryDefs}>
      <article className="prose-defigrail mx-auto max-w-3xl pt-10">
        <p className="font-mono text-[10px] tracking-[2px] text-faint">{topic.meta.era.toUpperCase()} · {topic.meta.track.toUpperCase()}</p>
        <h1 className="text-3xl font-extrabold">{topic.meta.title}</h1>
        {topic.meta.tradfiAnchor && (
          <p className="mt-1 inline-block rounded border border-dashed border-ref/40 px-2 py-1 font-mono text-[10.5px] text-ref">
            TRADFI ANCHOR ≡ {topic.meta.tradfiAnchor.toUpperCase()}
          </p>
        )}
        <PrereqChain items={prereqs} />
        <MDXRemote
          source={topic.body}
          components={{ GlossaryTerm }}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm, [remarkGlossary, { terms: glossaryTerms }]],
            },
          }}
        />
      </article>
    </GlossaryProvider>
  );
}

import Link from "next/link";

export default function PrereqChain({ items }: { items: { slug: string; title: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div className="my-4 flex flex-wrap items-center gap-2 rounded-md border border-esoteric/25 bg-esoteric/5 px-4 py-2 font-mono text-[11px] text-dim">
      <span className="text-[9.5px] font-bold tracking-[1.4px] text-esoteric">PREREQ CHAIN</span>
      {items.map(p => (
        <span key={p.slug} className="flex items-center gap-2">
          <Link href={`/learn/${p.slug}`} className="border-b border-dotted border-esoteric text-txt hover:text-esoteric">{p.title}</Link>
          <span className="text-esoteric/70">→</span>
        </span>
      ))}
      <span className="text-esoteric">THIS MODULE</span>
    </div>
  );
}

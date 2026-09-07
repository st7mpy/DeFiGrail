"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import glossary from "@/content/glossary.json";
import { ERA_LABELS } from "@/components/Glyph";

type SearchTopic = { slug: string; name: string; era: string; tradfi: string; summary: string };
type SearchDoc = SearchTopic & { text: string };
type Result =
  | { type: "topic"; slug: string; name: string; meta: string }
  | { type: "glossary"; name: string; meta: string };

const GLOSSARY = glossary as { term: string; def: string }[];

export default function SearchPalette({ topics }: { topics: SearchTopic[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset in the handlers that open the palette, not in an effect reacting to
  // `open` — resetting there is a second render pass for state we already know
  // at the moment of the event.
  const openFresh = useCallback(() => {
    setQ("");
    setActive(0);
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((o) => {
          if (o) return false;
          setQ("");
          setActive(0);
          return true;
        });
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => openFresh();
    document.addEventListener("keydown", onKey);
    window.addEventListener("dg:open-search", onOpen as EventListener);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("dg:open-search", onOpen as EventListener);
    };
  }, [openFresh]);

  // Focus is a DOM side-effect, not state — this one belongs in an effect.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open || docs) return;
    fetch("/search-index")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: SearchDoc[] | null) => d && setDocs(d))
      .catch(() => { /* fall back to metadata-only search */ });
  }, [open, docs]);

  const results = useMemo<Result[]>(() => {
    const s = q.toLowerCase().trim();
    if (!s) return [];
    const out: Result[] = [];
    const source: SearchDoc[] = docs ?? topics.map((t) => ({ ...t, text: "" }));
    const bodyHits: Result[] = [];
    for (const t of source) {
      const meta = `${t.name} ${t.summary} ${t.tradfi}`.toLowerCase();
      if (meta.includes(s)) {
        out.push({ type: "topic", slug: t.slug, name: t.name, meta: ERA_LABELS[t.era] ?? t.era });
        continue;
      }
      const i = t.text.toLowerCase().indexOf(s);
      if (i !== -1) {
        const from = Math.max(0, i - 40);
        bodyHits.push({
          type: "topic",
          slug: t.slug,
          name: t.name,
          meta: `…${t.text.slice(from, i + s.length + 60).trim()}…`,
        });
      }
    }
    out.push(...bodyHits);
    for (const g of GLOSSARY) {
      if (g.term.toLowerCase().includes(s) || g.def.toLowerCase().includes(s))
        out.push({ type: "glossary", name: g.term, meta: g.def.slice(0, 80) + "…" });
    }
    return out.slice(0, 8);
  }, [q, topics, docs]);

  function go(r: Result) {
    setOpen(false);
    if (r.type === "topic") router.push(`/learn/${r.slug}`);
    else router.push("/glossary");
  }

  if (!open) return null;
  return (
    <div className="search-overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="search-box">
        <div className="search-input-row">
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Search topics, glossary, protocols…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
              if (e.key === "Enter" && results[active]) go(results[active]);
            }}
            autoComplete="off"
          />
          <span className="search-esc">ESC</span>
        </div>
        <div className="search-results">
          {q && results.length === 0 && <div className="search-empty">No results for &ldquo;{q}&rdquo;</div>}
          {results.map((r, i) => (
            <button key={i} className={`search-result${i === active ? " active" : ""}`} onClick={() => go(r)} onMouseEnter={() => setActive(i)}>
              <div className="search-result-name">{r.name}</div>
              <div className="search-result-meta">{r.meta}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

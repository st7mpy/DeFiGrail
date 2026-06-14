"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import glossary from "@/content/glossary.json";
import { ERA_LABELS } from "@/components/Glyph";

type SearchTopic = { slug: string; name: string; era: string; tradfi: string; summary: string };
type Result =
  | { type: "topic"; slug: string; name: string; meta: string }
  | { type: "glossary"; name: string; meta: string };

const GLOSSARY = glossary as { term: string; def: string }[];

export default function SearchPalette({ topics }: { topics: SearchTopic[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("dg:open-search", onOpen as EventListener);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("dg:open-search", onOpen as EventListener);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const s = q.toLowerCase().trim();
    if (!s) return [];
    const out: Result[] = [];
    for (const t of topics) {
      if (t.name.toLowerCase().includes(s) || t.summary.toLowerCase().includes(s) || t.tradfi.toLowerCase().includes(s))
        out.push({ type: "topic", slug: t.slug, name: t.name, meta: ERA_LABELS[t.era] ?? t.era });
    }
    for (const g of GLOSSARY) {
      if (g.term.toLowerCase().includes(s) || g.def.toLowerCase().includes(s))
        out.push({ type: "glossary", name: g.term, meta: g.def.slice(0, 80) + "…" });
    }
    return out.slice(0, 8);
  }, [q, topics]);

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

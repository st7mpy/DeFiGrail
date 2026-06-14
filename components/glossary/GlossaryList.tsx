"use client";
import { useMemo, useState } from "react";
import glossary from "@/content/glossary.json";

const GLOSSARY = glossary as { term: string; def: string }[];

export default function GlossaryList() {
  const [q, setQ] = useState("");
  const terms = useMemo(() => {
    const f = q.toLowerCase().trim();
    if (!f) return GLOSSARY;
    return GLOSSARY.filter((g) => g.term.toLowerCase().includes(f) || g.def.toLowerCase().includes(f));
  }, [q]);

  return (
    <div className="glossary-layout">
      <div className="page-head">
        <div className="page-head-h1">Glossary</div>
        <div className="page-head-sub">{GLOSSARY.length} terms</div>
      </div>
      <input
        className="glossary-search"
        placeholder="Filter terms…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="glossary-list">
        {terms.length ? (
          terms.map((g) => (
            <div className="glossary-term" key={g.term}>
              <div className="glossary-term-word">{g.term}</div>
              <div className="glossary-term-def">{g.def}</div>
            </div>
          ))
        ) : (
          <div className="glossary-term" style={{ color: "rgba(26,24,19,.45)" }}>No terms match.</div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { useGlossary } from "./GlossaryProvider";

export default function GlossaryTerm({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  const defs = useGlossary();
  const def = defs[term];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  if (!def) return <>{children}</>;

  return (
    <span ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="cursor-help border-b border-dotted border-v2 text-inherit"
      >
        {children}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-0 top-full z-50 mt-1 block w-72 max-w-[80vw] rounded-md border border-line2 bg-panel px-3 py-2 font-mono text-[11.5px] leading-relaxed text-dim shadow-xl"
        >
          <span className="mb-1 block text-[9.5px] font-bold tracking-[1.5px] text-v2">
            {term.toUpperCase()}
          </span>
          {def}
        </span>
      )}
    </span>
  );
}

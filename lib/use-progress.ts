"use client";
import { useCallback, useEffect, useState } from "react";

const KEY = "defigrail_progress";
const EVENT = "dg:progress";

function readStore(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

// localStorage-backed reading progress, synced across components via a custom event.
export function useProgress() {
  const [map, setMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMap(readStore());
    const sync = () => setMap(readStore());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((slug: string) => {
    const next = readStore();
    if (next[slug]) delete next[slug];
    else next[slug] = true;
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setMap(next);
    window.dispatchEvent(new CustomEvent(EVENT));
  }, []);

  const isRead = useCallback((slug: string) => !!map[slug], [map]);
  const countRead = useCallback((slugs: string[]) => slugs.filter((s) => map[s]).length, [map]);

  return { map, toggle, isRead, countRead };
}

"use client";
import { useCallback, useSyncExternalStore } from "react";

const KEY = "defigrail_progress";
const EVENT = "dg:progress";

// getSnapshot must return a STABLE reference or useSyncExternalStore loops
// forever, since it compares with Object.is. Parse only when the raw string
// actually changed, and hand back the same object otherwise.
let cachedRaw = "";
let cachedMap: Record<string, boolean> = {};
const EMPTY: Record<string, boolean> = {};

function readStore(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(KEY) || "{}";
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedMap = JSON.parse(raw);
    }
    return cachedMap;
  } catch {
    return EMPTY;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// localStorage-backed reading progress, synced across components via a custom
// event. useSyncExternalStore rather than setState-in-effect: this is external
// state with a real subscription, and EMPTY is the server snapshot.
export function useProgress() {
  const map = useSyncExternalStore(subscribe, readStore, () => EMPTY);

  const toggle = useCallback((slug: string) => {
    const next = { ...readStore() };
    if (next[slug]) delete next[slug];
    else next[slug] = true;
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent(EVENT));
  }, []);

  const isRead = useCallback((slug: string) => !!map[slug], [map]);
  const countRead = useCallback((slugs: string[]) => slugs.filter((s) => map[s]).length, [map]);

  return { map, toggle, isRead, countRead };
}

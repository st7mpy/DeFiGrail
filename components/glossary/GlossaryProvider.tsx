"use client";
import { createContext, useContext } from "react";

const GlossaryContext = createContext<Record<string, string>>({});

export const useGlossary = () => useContext(GlossaryContext);

export default function GlossaryProvider({
  defs,
  children,
}: {
  defs: Record<string, string>;
  children: React.ReactNode;
}) {
  return <GlossaryContext.Provider value={defs}>{children}</GlossaryContext.Provider>;
}

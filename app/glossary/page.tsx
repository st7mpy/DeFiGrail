import type { Metadata } from "next";
import GlossaryList from "@/components/glossary/GlossaryList";

export const metadata: Metadata = { title: "Glossary" };

export default function GlossaryPage() {
  return <GlossaryList />;
}

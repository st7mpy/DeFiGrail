import type { Metadata } from "next";
import LearnBrowser from "@/components/learn/LearnBrowser";
import { trackViews } from "@/lib/topic-cards";

export const metadata: Metadata = { title: "Learn" };

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const { track } = await searchParams;
  return <LearnBrowser tracks={trackViews()} initialTrack={track} />;
}

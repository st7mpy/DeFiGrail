import type { Metadata } from "next";
import MarketBoard from "@/components/charts/MarketBoard";

export const metadata: Metadata = { title: "Charts" };

export default function ChartsPage() {
  return <MarketBoard />;
}

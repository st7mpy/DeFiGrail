import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import SiteNav from "@/components/SiteNav";
import Ticker from "@/components/Ticker";
import SiteFooter from "@/components/SiteFooter";
import SearchPalette from "@/components/SearchPalette";
import { topicCards } from "@/lib/topic-cards";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains",
});

const BASE_URL = "https://defigrail.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: "DeFiGrail — DeFi mechanics, made interactive", template: "%s · DeFiGrail" },
  description:
    "DeFi mechanics have a lot to dump on your brain. Every formula made interactive, every idea preceded by exactly what you need to know first.",
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "DeFiGrail",
    title: "DeFiGrail — DeFi mechanics, made interactive",
    description:
      "DeFi mechanics have a lot to dump on your brain. Every formula made interactive, every idea preceded by exactly what you need to know first.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeFiGrail — DeFi mechanics, made interactive",
    description:
      "DeFi mechanics have a lot to dump on your brain. Every formula made interactive, every idea preceded by exactly what you need to know first.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const topics = topicCards().map((t) => ({
    slug: t.slug, name: t.name, era: t.era, tradfi: t.tradfi, summary: t.summary,
  }));
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <div id="app">
          <SiteNav />
          <Ticker />
          <main className="dg-main">{children}</main>
          <SiteFooter />
        </div>
        <SearchPalette topics={topics} />
        <Analytics />
      </body>
    </html>
  );
}

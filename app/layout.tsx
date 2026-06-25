import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import SiteNav from "@/components/SiteNav";
import Ticker from "@/components/Ticker";
import SiteFooter from "@/components/SiteFooter";
import Splash from "@/components/Splash";
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
  title: { default: "DeFiGrail — An interactive DeFi curriculum", template: "%s · DeFiGrail" },
  description:
    "Learn DeFi the way a trading desk would teach it — every protocol anchored to its TradFi equivalent, every formula made interactive.",
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "DeFiGrail",
    title: "DeFiGrail — An interactive DeFi curriculum",
    description:
      "Learn DeFi the way a trading desk would teach it — every protocol anchored to its TradFi equivalent, every formula made interactive.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeFiGrail — An interactive DeFi curriculum",
    description:
      "Learn DeFi the way a trading desk would teach it — every protocol anchored to its TradFi equivalent, every formula made interactive.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const topics = topicCards().map((t) => ({
    slug: t.slug, name: t.name, era: t.era, tradfi: t.tradfi, summary: t.summary,
  }));
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <Splash />
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

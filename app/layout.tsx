import type { Metadata } from "next";
import { JetBrains_Mono, Newsreader } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import Ticker from "@/components/Ticker";
import SiteFooter from "@/components/SiteFooter";
import AmbientRain from "@/components/AmbientRain";
import Splash from "@/components/Splash";
import SearchPalette from "@/components/SearchPalette";
import { topicCards } from "@/lib/topic-cards";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  variable: "--font-newsreader",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: { default: "DeFiGrail — An interactive DeFi curriculum", template: "%s · DeFiGrail" },
  description:
    "Learn DeFi the way a trading desk would teach it — every protocol anchored to its TradFi equivalent, every formula made interactive.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const topics = topicCards().map((t) => ({
    slug: t.slug, name: t.name, era: t.era, tradfi: t.tradfi, summary: t.summary,
  }));
  return (
    <html lang="en" className={`${newsreader.variable} ${mono.variable}`}>
      <body>
        <Splash />
        <AmbientRain />
        <div id="app">
          <SiteNav />
          <Ticker />
          <main className="dg-main">{children}</main>
          <SiteFooter />
        </div>
        <SearchPalette topics={topics} />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { JetBrains_Mono, Sora } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: { default: "DeFiGrail — Learn DeFi from first principles", template: "%s · DeFiGrail" },
  description: "A one-stop DeFi learning platform: structured tracks, interactive charts, live market context.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${mono.variable}`}>
      <body>
        <SiteNav />
        <main className="mx-auto max-w-6xl px-6 pb-20">{children}</main>
      </body>
    </html>
  );
}

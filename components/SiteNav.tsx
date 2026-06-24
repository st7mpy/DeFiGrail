"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/learn", label: "Learn", key: "learn" },
  { href: "/graph", label: "Graph", key: "graph" },
  { href: "/playground", label: "Playground", key: "playground" },
  { href: "/quiz", label: "Quiz", key: "quiz" },
  { href: "/glossary", label: "Glossary", key: "glossary" },
  { href: "/news", label: "News", key: "news" },
  { href: "/community", label: "Community", key: "community" },
];

export default function SiteNav() {
  const pathname = usePathname() || "/";
  const seg = pathname.split("/")[1] || "home";

  return (
    <nav className="dg-nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          <span className="nav-logo-dot" />
          <span className="nav-logo-text">DeFiGrail</span>
        </Link>
        <div className="nav-links">
          {TABS.map((t) => (
            <Link key={t.key} href={t.href} className={`nav-link${seg === t.key ? " active" : ""}`}>
              {t.label}
            </Link>
          ))}
        </div>
        <div className="nav-spacer" />
        <button
          className="nav-search"
          onClick={() => window.dispatchEvent(new CustomEvent("dg:open-search"))}
        >
          <span>Search</span>
          <kbd>⌘K</kbd>
        </button>
      </div>
    </nav>
  );
}

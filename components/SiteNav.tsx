import Link from "next/link";

const TABS = [
  { href: "/", label: "HOME", color: "var(--color-v0)" },
  { href: "/learn/uniswap-v2", label: "LEARN", color: "var(--color-v2)" },
  { href: "/news", label: "NEWS", color: "var(--color-ref)" },
  { href: "/featured", label: "FEATURED", color: "var(--color-v1)" },
  { href: "/submit", label: "SUBMIT", color: "var(--color-esoteric)" },
];

export default function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 flex h-13 items-center gap-1 border-b border-line bg-bg/90 px-5 backdrop-blur font-mono text-xs tracking-wider">
      <Link href="/" className="mr-5 flex items-center gap-2 font-bold">
        <span className="h-2 w-2 rounded-xs bg-v0 shadow-[0_0_10px_var(--color-v0)]" />
        DEFI/GRAIL <span className="font-normal text-faint">EDU TERMINAL</span>
      </Link>
      {TABS.map(t => (
        <Link key={t.href} href={t.href} className="px-3 py-2 text-dim hover:text-txt">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: t.color }} />
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

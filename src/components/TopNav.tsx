"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage, t } from "@/lib/language-context";
import LanguageSwitch from "@/components/LanguageSwitch";

const NAV_ITEMS = [
  { href: "/songs", key: "songs" as const },
  { href: "/connections", key: "connections" as const },
  { href: "/story", key: "story" as const },
  { href: "/about", key: "about" as const },
];

export default function TopNav() {
  const pathname = usePathname();
  const { lang } = useLanguage();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-6 border-b border-[var(--paper-edge-shadow)] bg-[var(--paper-cream-light)]/95 px-6 py-3 backdrop-blur-sm sm:px-10">
      <Link href="/" className="handwritten-jp text-xl text-ink-main shrink-0">
        ヨルシカ
      </Link>
      <nav className="flex flex-1 items-center justify-center gap-8 sm:gap-12">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`handwritten ink-underline text-lg sm:text-xl text-ink-main ${active ? "is-active" : ""}`}
            >
              {t(item.key, lang)}
            </Link>
          );
        })}
      </nav>
      <LanguageSwitch />
    </header>
  );
}

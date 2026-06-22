"use client";

import Link from "next/link";
import { useLanguage, t, handwrittenClass } from "@/lib/language-context";

const ENTRY_CARDS = [
  {
    href: "/songs",
    titleKey: "homeSongsTitle" as const,
    descKey: "homeSongsDesc" as const,
    tilt: -1.2,
    accent: "var(--highlight-gold)",
    featured: false,
  },
  {
    href: "/connections",
    titleKey: "homeConnectionsTitle" as const,
    descKey: "homeConnectionsDesc" as const,
    tilt: 0.3,
    accent: "var(--elma-accent)",
    featured: true,
  },
  {
    href: "/story",
    titleKey: "homeStoryTitle" as const,
    descKey: "homeStoryDesc" as const,
    tilt: 1.2,
    accent: "var(--dakara-accent)",
    featured: false,
  },
];

export default function HomePage() {
  const { lang } = useLanguage();

  return (
    <main className="notebook-paper-aged min-h-[calc(100vh-61px)] px-6 py-16">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <span className="handwritten-jp text-5xl tracking-wide text-ink-main sm:text-6xl">
          ヨルシカ
        </span>
        <span className="mt-1 text-[0.65rem] uppercase tracking-[0.35em] text-ink-faint">
          yorushika
        </span>

        <p className="mx-auto mt-8 max-w-md text-sm leading-7 text-ink-soft sm:text-base">
          {t("homeIntro", lang)}
        </p>

        <div className="mt-14 grid w-full grid-cols-1 items-center gap-6 sm:grid-cols-3">
          {ENTRY_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group relative flex flex-col items-center justify-center gap-3 border border-[var(--paper-edge-shadow)] bg-paper-cream-light shadow-[2px_4px_10px_rgba(40,30,15,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[4px_8px_18px_rgba(40,30,15,0.22)] ${
                card.featured
                  ? "z-10 min-h-[13rem] px-7 py-12 sm:min-h-[14rem]"
                  : "min-h-[10.5rem] px-5 py-8 opacity-85 sm:min-h-[11rem]"
              }`}
              style={{
                transform: `rotate(${card.tilt}deg)`,
              }}
            >
              <span
                className={`absolute left-0 top-0 w-full ${
                  card.featured ? "h-2" : "h-1.5"
                }`}
                style={{ backgroundColor: card.accent, opacity: card.featured ? 0.75 : 0.55 }}
              />

              <span
                className={`${handwrittenClass(lang)} text-ink-main ${
                  card.featured ? "text-4xl sm:text-[2.65rem]" : "text-2xl sm:text-3xl"
                }`}
              >
                {t(card.titleKey, lang)}
              </span>

              <span
                className={`leading-5 text-ink-faint ${
                  card.featured ? "text-sm sm:text-[0.95rem]" : "text-xs sm:text-sm"
                }`}
              >
                {t(card.descKey, lang)}
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-16 text-xs text-ink-faint">
          {t("homeAboutNote", lang)}{" "}
          <Link href="/about" className="ink-underline text-ink-soft">
            {t("homeAboutLink", lang)}
          </Link>
        </p>
      </div>
    </main>
  );
}
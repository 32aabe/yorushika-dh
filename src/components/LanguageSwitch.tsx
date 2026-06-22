"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import type { Lang } from "@/types/song";

const LABELS: Record<Lang, string> = { jp: "日本語", en: "English", kr: "한국어" };
const ORDER: Lang[] = ["jp", "en", "kr"];

export default function LanguageSwitch() {
  const { lang, setLang } = useLanguage();
  const [transitioning, setTransitioning] = useState(false);

  function handleSelect(next: Lang) {
    if (next === lang || transitioning) return;
    setTransitioning(true);
    // erase, then swap + rewrite — matches the spec's "text erases and
    // rewrites quickly" requirement for language change
    setTimeout(() => {
      setLang(next);
      setTransitioning(false);
    }, 160);
  }

  return (
    <div className="flex shrink-0 items-center gap-1 text-sm">
      {ORDER.map((code, i) => (
        <span key={code} className="flex items-center">
          <button
            onClick={() => handleSelect(code)}
            className={`px-1.5 py-1 transition-opacity duration-150 ${
              lang === code ? "text-ink-main font-semibold" : "text-ink-faint hover:text-ink-soft"
            } ${transitioning && lang !== code ? "opacity-0" : "opacity-100"}`}
            style={{
              fontFamily:
                code === "jp"
                  ? "var(--font-jp-serif)"
                  : code === "kr"
                  ? "var(--font-kr-serif)"
                  : "var(--font-en-serif)",
              letterSpacing: transitioning ? "0.15em" : "0",
              transition: "letter-spacing 0.16s ease, opacity 0.16s ease",
            }}
            aria-pressed={lang === code}
          >
            {LABELS[code]}
          </button>
          {i < ORDER.length - 1 && <span className="text-ink-faint/50">/</span>}
        </span>
      ))}
    </div>
  );
}

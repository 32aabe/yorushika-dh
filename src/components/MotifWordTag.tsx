"use client";

import { handwrittenClass } from "@/lib/language-context";
import { getWordGloss } from "@/lib/data";
import type { Lang } from "@/types/song";

interface MotifWordTagProps {
  word: string;
  lang: Lang;
  emphasis?: "signature" | "bridge";
  onClick: () => void;
}

/** A single clickable motif word arranged around a focused song on the
 * scene's small fixed canvas. The canvas itself can be panned/zoomed
 * (see SceneViewport), but its *content* still only ever shows a
 * handful of curated motifs rather than the full word network -- this
 * stays plain handwritten text, not a sized-by-degree node, since at
 * most four or five of these are ever in one scene. Signature words
 * (unique to this song) read slightly larger/bolder than bridge words
 * (shared with the rest of the network). */
export default function MotifWordTag({ word, lang, emphasis = "bridge", onClick }: MotifWordTagProps) {
  const gloss = lang !== "jp" ? getWordGloss(word, lang) : null;
  const big = emphasis === "signature";

  return (
    <button
      onClick={onClick}
      className={`${handwrittenClass(lang)} group flex flex-col items-center text-center leading-none text-ink-main transition-transform duration-200 hover:-translate-y-0.5 hover:text-[var(--highlight-gold)]`}
    >
      <span
        className="ink-underline"
        style={{ fontSize: big ? 34 : 24, fontWeight: big ? 600 : 500 }}
      >
        {word}
      </span>
      {gloss && <span className="mt-1 text-sm font-normal leading-snug opacity-75">{gloss}</span>}
    </button>
  );
}

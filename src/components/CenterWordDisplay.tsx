"use client";

import { handwrittenClass } from "@/lib/language-context";
import { getWordGloss } from "@/lib/data";
import type { Lang } from "@/types/song";

interface CenterWordDisplayProps {
  word: string;
  lang: Lang;
}

/** The single large handwritten word anchoring the word-focus scene --
 * deliberately just text, no card or background, like a word written
 * directly onto the notebook page. Always at full size and never
 * dimmed; everything else in the scene (postcards, the side panel) is
 * arranged around it. */
export default function CenterWordDisplay({ word, lang }: CenterWordDisplayProps) {
  const gloss = lang !== "jp" ? getWordGloss(word, lang) : null;

  return (
    <div className={`${handwrittenClass(lang)} flex flex-col items-center text-center leading-none text-ink-main`}>
      <span className="text-7xl font-semibold">{word}</span>
      {gloss && <span className="mt-2 text-lg font-normal opacity-75">{gloss}</span>}
    </div>
  );
}

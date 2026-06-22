"use client";

import type { Song } from "@/types/song";
import { useLanguage, t } from "@/lib/language-context";

interface PinnedNoteProps {
  song: Song;
  onClick: () => void;
}

/** The corresponding song, shown as its own small pinned note rather
 * than mixed in among the motif words -- deliberately a different
 * shape and material (a tilted sticky note with a "pin", not a
 * postcard) so the corresponding-song relationship never blurs
 * together with the motif relationships surrounding the focused song,
 * per the brief's requirement that the two stay visually separate. */
export default function PinnedNote({ song, onClick }: PinnedNoteProps) {
  const { lang } = useLanguage();

  return (
    <button
      onClick={onClick}
      className="group relative flex w-[170px] flex-col items-start gap-1 bg-[#ede0b8] px-3 py-3 text-left transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        transform: "rotate(-2deg)",
        boxShadow: "2px 4px 10px rgba(40,30,15,0.25)",
      }}
    >
      <span
        aria-hidden
        className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-[var(--highlight-gold)]"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
      />
      <span className="text-[10px] uppercase tracking-wide text-[#8a7a4a]">{t("correspondingSong", lang)}</span>
      <span className="text-sm leading-snug text-[#5c5236] group-hover:underline">{song.title[lang]}</span>
    </button>
  );
}

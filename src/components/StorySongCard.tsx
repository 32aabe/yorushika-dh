"use client";

import Link from "next/link";
import { getSongById, localizeAlbum } from "@/lib/data";
import { useLanguage } from "@/lib/language-context";

interface StorySongCardProps {
  songId: string;
}

/** A small song reference inserted into a story passage -- enough to
 * place the scene in the archive without pulling focus away from the
 * narrative. Links out to the full song page rather than duplicating
 * its content here. */
export default function StorySongCard({ songId }: StorySongCardProps) {
  const { lang } = useLanguage();
  const song = getSongById(songId);
  if (!song) return null;

  return (
    <Link
      href={`/songs/${song.album}/${song.id}`}
      className="group flex items-center gap-3 rounded-sm border border-[var(--paper-edge-shadow)] bg-paper-cream px-3 py-2 transition-colors hover:bg-paper-aged"
    >
      <span
        className="h-9 w-9 shrink-0 rounded-sm"
        style={{
          background: `linear-gradient(135deg, ${song.color.main}88, ${song.color.secondary ?? song.color.main}44)`,
        }}
      />
      <span className="flex flex-col">
        <span className="text-sm leading-tight text-ink-main group-hover:underline">{song.title[lang]}</span>
        <span className="text-[0.7rem] leading-tight text-ink-faint">{localizeAlbum(song.album, lang)}</span>
      </span>
    </Link>
  );
}

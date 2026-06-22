"use client";

import type { Song } from "@/types/song";
import { useLanguage } from "@/lib/language-context";

interface CenterSongCardProps {
  song: Song;
}

/** The large postcard sitting at the center of the song-focus scene --
 * this is the one node on the page that's always full-size and never
 * dimmed, the anchor everything else (motifs, the pinned corresponding
 * note) is arranged around. It is the focus already, so it isn't
 * clickable itself -- only the things around it are. */
export default function CenterSongCard({ song }: CenterSongCardProps) {
  const { lang } = useLanguage();

  return (
    <div
      className="flex w-[220px] flex-col items-stretch"
      style={{ filter: "drop-shadow(3px 6px 14px rgba(40,30,15,0.3))" }}
    >
      <span className="block aspect-[4/3] w-full overflow-hidden border-[3px] border-paper-cream-light bg-paper-cream-light">
        {song.mvThumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={song.mvThumbnail} alt={song.title[lang]} className="h-full w-full object-cover" />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center text-xs text-ink-faint"
            style={{
              background: `linear-gradient(135deg, ${song.color.main}66, ${song.color.secondary ?? song.color.main}33)`,
            }}
          >
            {song.mainObject ?? ""}
          </span>
        )}
      </span>
      <span className="border-x-[3px] border-b-[3px] border-paper-cream-light bg-paper-cream-light px-3 py-2.5">
        <span
          className="block text-center text-lg leading-snug text-ink-main"
          style={{
            fontFamily:
              lang === "jp" ? "var(--font-jp-serif)" : lang === "kr" ? "var(--font-kr-serif)" : "var(--font-en-serif)",
          }}
        >
          {song.title[lang]}
        </span>
      </span>
    </div>
  );
}

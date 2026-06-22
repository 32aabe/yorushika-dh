"use client";

import type { Song } from "@/types/song";
import { useLanguage } from "@/lib/language-context";

interface OrbitPostcardProps {
  song: Song;
  onClick: () => void;
}

/** A smaller clickable postcard used around a focused word -- visually
 * the same family as CenterSongCard, just sized down since several of
 * these sit together around one word rather than standing alone. */
export default function OrbitPostcard({ song, onClick }: OrbitPostcardProps) {
  const { lang } = useLanguage();

  return (
    <button
      onClick={onClick}
      className="group flex w-[160px] flex-col items-stretch transition-transform duration-200 hover:-translate-y-1"
      style={{ filter: "drop-shadow(2px 4px 9px rgba(40,30,15,0.25))" }}
    >
      <span className="block aspect-[4/3] w-full overflow-hidden border-[3px] border-paper-cream-light bg-paper-cream-light">
        {song.mvThumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={song.mvThumbnail} alt={song.title[lang]} className="h-full w-full object-cover" />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center text-[10px] text-ink-faint"
            style={{
              background: `linear-gradient(135deg, ${song.color.main}66, ${song.color.secondary ?? song.color.main}33)`,
            }}
          >
            {song.mainObject ?? ""}
          </span>
        )}
      </span>
      <span className="border-x-[3px] border-b-[3px] border-paper-cream-light bg-paper-cream-light px-2 py-1.5">
        <span
          className="block text-center text-sm leading-snug text-ink-main group-hover:underline"
          style={{
            fontFamily:
              lang === "jp" ? "var(--font-jp-serif)" : lang === "kr" ? "var(--font-kr-serif)" : "var(--font-en-serif)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {song.title[lang]}
        </span>
      </span>
    </button>
  );
}

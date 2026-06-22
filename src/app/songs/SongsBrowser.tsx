"use client";

import { useState } from "react";
import { getSongsByAlbum, ALBUM_LABEL } from "@/lib/data";
import { useLanguage, handwrittenClass } from "@/lib/language-context";
import CassetteCard from "@/components/CassetteCard";
import type { AlbumId } from "@/types/song";

export default function SongsBrowser() {
  const { lang } = useLanguage();
  const [album, setAlbum] = useState<AlbumId>("dakara");
  const tracks = getSongsByAlbum(album);

  return (
    <main className="notebook-paper min-h-[calc(100vh-61px)] px-6 py-12 sm:px-12">
      <div className="mb-10 flex items-center justify-center gap-10">
        {(["dakara", "elma"] as AlbumId[]).map((id) => (
          <button
            key={id}
            onClick={() => setAlbum(id)}
            className={`${handwrittenClass(lang)} text-2xl transition-opacity sm:text-3xl ${
              album === id ? "text-ink-main underline" : "text-ink-faint hover:text-ink-soft"
            }`}
          >
            {ALBUM_LABEL[id][lang]}
          </button>
        ))}
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {tracks.map((song) => (
          <CassetteCard key={song.id} song={song} />
        ))}
      </div>
    </main>
  );
}

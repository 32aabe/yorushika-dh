"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Song } from "@/types/song";
import { getCorrespondingSong, getWordsForSong, getLyricsForSong, localize, formatNetworkWord } from "@/lib/data";
import { useLanguage, t, handwrittenClass } from "@/lib/language-context";
import { assetPath } from "@/lib/asset-path";

interface SongDetailProps {
  song: Song;
}

export default function SongDetail({ song }: SongDetailProps) {
  const { lang } = useLanguage();
  const router = useRouter();
  const [flipping, setFlipping] = useState(false);

  const corresponding = getCorrespondingSong(song);
  const words = getWordsForSong(song.id);
  const lyricsLocalized = getLyricsForSong(song.id);
  const lyricsText = lyricsLocalized ? localize(lyricsLocalized, lang) : null;
  const repLyric = localize(song.representativeLyric, lang);

  function handleFlip() {
    if (!corresponding) return;
    setFlipping(true);
    setTimeout(() => {
      router.push(`/songs/${corresponding.album}/${corresponding.id}`);
    }, 300);
  }

  return (
    <main
      className={`notebook-paper min-h-[calc(100vh-61px)] px-6 py-12 transition-all duration-300 sm:px-12 ${
        flipping ? "translate-x-8 opacity-0" : "translate-x-0 opacity-100"
      }`}
    >
      <div className="mx-auto max-w-4xl">
        <Link href="/songs" className="ink-underline mb-6 inline-block text-sm text-ink-faint">
          ← {t("trackList", lang)}
        </Link>

        <div className="mb-8 border-b border-[var(--paper-line)] pb-4">
          <h1
            className="text-3xl font-semibold text-ink-main sm:text-4xl"
            style={{
              fontFamily:
                lang === "jp" ? "var(--font-jp-serif)" : lang === "kr" ? "var(--font-kr-serif)" : "var(--font-en-serif)",
            }}
          >
            Track {String(song.trackNo).padStart(2, "0")}. {song.title[lang]}
          </h1>
          {corresponding && (
            <button
              onClick={handleFlip}
              className="mt-3 inline-flex max-w-full items-center gap-2 rounded-sm border border-[var(--paper-edge-shadow)] bg-paper-cream-light px-4 py-1.5 text-sm text-ink-soft hover:bg-paper-aged"
            >
              <span className="whitespace-nowrap">{t("correspondingSong", lang)}:</span>
              <span className="truncate">{corresponding.title[lang]}</span>
              <span className="whitespace-nowrap">⇄</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          <div>
            <div
              className="mb-4 aspect-video w-full overflow-hidden rounded-sm border border-[var(--paper-edge-shadow)]"
              style={{
                background: `linear-gradient(135deg, ${song.color.main}66, ${song.color.secondary ?? song.color.main}33)`,
              }}
            >
              {song.mvThumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={assetPath(song.mvThumbnail)} alt={song.title[lang]} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              {song.youtubeUrl && (
                <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" className="ink-underline text-ink-soft">
                  {t("watchOnYoutube", lang)}
                </a>
              )}
              {song.youtubeMusicUrl && (
                <a href={song.youtubeMusicUrl} target="_blank" rel="noopener noreferrer" className="ink-underline text-ink-soft">
                  {t("listenOnYoutubeMusic", lang)}
                </a>
              )}
            </div>

            {repLyric && (
              <blockquote className="mt-6 border-l-2 border-[var(--highlight-gold-soft)] pl-4 text-xl italic text-ink-soft">
                “{repLyric}”
              </blockquote>
            )}
          </div>

          <div>
            {song.summary[lang] && <p className="mb-4 text-sm leading-7 text-ink-soft">{song.summary[lang]}</p>}
            {song.description[lang] && <p className="mb-4 text-sm leading-7 text-ink-soft">{song.description[lang]}</p>}

            {words.length > 0 && (
              <div className="mb-6">
                <h3 className={`${handwrittenClass(lang)} mb-2 text-lg text-ink-main`}>{t("bridgeWords", lang)}</h3>
                <div className="mb-3 flex flex-wrap gap-2">
                  {words
                    .filter((w) => w.role === "bridge")
                    .map((w) => (
                      <span
                        key={w.word}
                        className={`${handwrittenClass(lang)} rounded-sm border border-[var(--highlight-gold-soft)] bg-paper-cream-light px-2 py-0.5 text-base font-medium text-ink-main`}
                      >
                        {formatNetworkWord(w.word, lang)}
                      </span>
                    ))}
                </div>
                <h3 className={`${handwrittenClass(lang)} mb-2 text-lg text-ink-main`}>{t("signatureWords", lang)}</h3>
                <div className="flex flex-wrap gap-2">
                  {words
                    .filter((w) => w.role === "signature")
                    .map((w) => (
                    <span
                      key={w.word}
                      className={`${handwrittenClass(lang)} rounded-sm border border-[var(--paper-edge-shadow)] bg-paper-cream px-2 py-0.5 text-base font-medium text-ink-main`}
                    >
                      {formatNetworkWord(w.word, lang)}
                    </span>
                    ))}
                </div>
              </div>
            )}

            {song.interviewExcerpts.length > 0 && (
              <div>
                <h3 className={`${handwrittenClass(lang)} mb-2 text-lg text-ink-main`}>{t("artistComment", lang)}</h3>
                <div className="space-y-4 border-l-2 border-[var(--dakara-accent-soft)] pl-4">
                  {song.interviewExcerpts.map((ex, i) => (
                    <blockquote key={i} className="text-sm leading-6 text-ink-soft">
                      <p className="italic">“{localize(ex.quote, lang)}”</p>
                      <cite className="mt-1 block text-xs not-italic text-ink-faint">
                        {t("source", lang)}: {ex.source}
                      </cite>
                    </blockquote>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {lyricsText && (
          <details className="mt-10 border-t border-[var(--paper-line)] pt-6 text-sm text-ink-soft">
            <summary className={`${handwrittenClass(lang)} cursor-pointer text-lg text-ink-main`}>
              {t("lyrics", lang)}
            </summary>
            {lang !== "jp" && lyricsLocalized && !lyricsLocalized[lang] && (
              <p className="mt-3 text-xs italic text-ink-faint">
                {lang === "kr"
                  ? "이 곡의 전체 가사 번역은 아직 준비 중입니다. 원문(일본어)을 표시합니다."
                  : "A full translation of this song's lyrics isn't ready yet. Showing the Japanese original."}
              </p>
            )}
            <p className="mt-3 whitespace-pre-line leading-7">{lyricsText}</p>
          </details>
        )}

        <div className="mt-10">
          <Link href={`/connections?song=${song.id}`} className="ink-underline text-sm text-ink-soft">
            {t("viewOnMap", lang)} →
          </Link>
        </div>
      </div>
    </main>
  );
}

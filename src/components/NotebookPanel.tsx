"use client";

import { useState } from "react";
import Link from "next/link";
import type { Song } from "@/types/song";
import { useLanguage, t, handwrittenClass } from "@/lib/language-context";
import { getCorrespondingSong, getWordsForSong, getLyricsForSong, localize, formatNetworkWord, localizeAlbum } from "@/lib/data";

interface NotebookPanelProps {
  song: Song | null;
  onClose: () => void;
  onCompare: (songId: string) => void;
}

export default function NotebookPanel({ song, onClose, onCompare }: NotebookPanelProps) {
  const { lang } = useLanguage();
  const [displayedSong, setDisplayedSong] = useState<Song | null>(song);
  const [prevSongProp, setPrevSongProp] = useState<Song | null>(song);
  const [flipping, setFlipping] = useState(false);

  // Derive displayed song during render (no effect needed): keep showing
  // the previous song while the panel is closed/animating out, but adopt
  // the new one as soon as a song prop is actually passed in.
  if (song !== prevSongProp) {
    setPrevSongProp(song);
    if (song) setDisplayedSong(song);
  }

  const open = !!song;
  const corresponding = displayedSong ? getCorrespondingSong(displayedSong) : undefined;
  const words = displayedSong ? getWordsForSong(displayedSong.id) : [];
  const lyricsLocalized = displayedSong ? getLyricsForSong(displayedSong.id) : null;
  const lyricExcerpt = lyricsLocalized ? localize(lyricsLocalized, lang) : null;
  const repLyric = displayedSong ? localize(displayedSong.representativeLyric, lang) : null;

  function handleToggleCorresponding() {
    if (!corresponding || !displayedSong) return;
    setFlipping(true);
    setTimeout(() => {
      onCompare(displayedSong.id);
      setFlipping(false);
    }, 260);
  }

  return (
    <aside
      className={`fixed right-0 top-0 z-40 h-full w-full max-w-md border-l border-[var(--paper-edge-shadow)] bg-paper-cream-light shadow-[-6px_0_24px_rgba(40,30,15,0.25)] transition-transform duration-400 ease-out ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ top: "61px", height: "calc(100% - 61px)" }}
      aria-hidden={!open}
    >
      {displayedSong && (
        <div
          className={`flex h-full flex-col overflow-y-auto px-7 py-8 transition-all duration-300 ${
            flipping ? "translate-x-6 opacity-0" : "translate-x-0 opacity-100"
          }`}
        >
          <button
            onClick={onClose}
            className={`${handwrittenClass(lang)} mb-4 self-start text-base text-ink-faint hover:text-ink-main`}
          >
            « {t("close", lang)}
          </button>

          <div
            className="mb-4 aspect-video w-full overflow-hidden rounded-sm border border-[var(--paper-edge-shadow)]"
            style={{
              background: `linear-gradient(135deg, ${displayedSong.color.main}66, ${
                displayedSong.color.secondary ?? displayedSong.color.main
              }33)`,
            }}
          >
            {displayedSong.mvThumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayedSong.mvThumbnail}
                alt={displayedSong.title[lang]}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <h2
            className="mb-1 text-2xl font-semibold text-ink-main"
            style={{
              fontFamily:
                lang === "jp" ? "var(--font-jp-serif)" : lang === "kr" ? "var(--font-kr-serif)" : "var(--font-en-serif)",
            }}
          >
            {displayedSong.title[lang]}
          </h2>
          <p className="mb-5 text-xs uppercase tracking-wide text-ink-faint">
            {localizeAlbum(displayedSong.album, lang)} · Track {displayedSong.trackNo}
          </p>

          <div className="mb-5 flex flex-wrap gap-3 text-sm">
            {displayedSong.youtubeUrl && (
              <a
                href={displayedSong.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ink-underline text-ink-soft"
              >
                {t("watchOnYoutube", lang)}
              </a>
            )}
            {displayedSong.youtubeMusicUrl && (
              <a
                href={displayedSong.youtubeMusicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ink-underline text-ink-soft"
              >
                {t("listenOnYoutubeMusic", lang)}
              </a>
            )}
          </div>

          {repLyric && (
            <blockquote className="mb-5 border-l-2 border-[var(--highlight-gold-soft)] pl-4 text-lg italic text-ink-soft">
              “{repLyric}”
            </blockquote>
          )}

          {displayedSong.summary[lang] && (
            <p className="mb-5 text-sm leading-6 text-ink-soft">{displayedSong.summary[lang]}</p>
          )}

          {displayedSong.description[lang] && (
            <p className="mb-5 text-sm leading-6 text-ink-soft">{displayedSong.description[lang]}</p>
          )}

          {lyricExcerpt && (
            <details className="mb-5 text-sm text-ink-soft">
              <summary className={`cursor-pointer ${handwrittenClass(lang)} text-base text-ink-main`}>
                {t("lyrics", lang)}
              </summary>
              {lang !== "jp" && lyricsLocalized && !lyricsLocalized[lang] && (
                <p className="mt-2 text-xs italic text-ink-faint">
                  {lang === "kr"
                    ? "이 곡의 전체 가사 번역은 아직 준비 중입니다. 원문(일본어)을 표시합니다."
                    : "A full translation of this song's lyrics isn't ready yet. Showing the Japanese original."}
                </p>
              )}
              <p className="mt-2 whitespace-pre-line leading-7">{lyricExcerpt}</p>
            </details>
          )}

          {words.length > 0 && (
            <div className="mb-5">
              <h3 className={`${handwrittenClass(lang)} mb-2 text-base text-ink-main`}>{t("bridgeWords", lang)}</h3>
              <div className="flex flex-wrap gap-2">
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
              <h3 className={`${handwrittenClass(lang)} mb-2 mt-3 text-base text-ink-main`}>{t("signatureWords", lang)}</h3>
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

          {displayedSong.interviewExcerpts.length > 0 && (
            <div className="mb-5">
              <h3 className={`${handwrittenClass(lang)} mb-2 text-base text-ink-main`}>{t("artistComment", lang)}</h3>
              <div className="space-y-3 border-l-2 border-[var(--dakara-accent-soft)] pl-4">
                {displayedSong.interviewExcerpts.map((ex, i) => (
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

          {corresponding && (
            <button
              onClick={handleToggleCorresponding}
              className="mt-2 flex w-full max-w-full items-center gap-2 self-start rounded-sm border border-[var(--paper-edge-shadow)] bg-paper-cream px-4 py-2 text-sm text-ink-main transition-colors hover:bg-paper-aged"
            >
              <span className="whitespace-nowrap">{t("correspondingSong", lang)}:</span>
              <span className="truncate underline">{corresponding.title[lang]}</span>
              <span aria-hidden className="whitespace-nowrap">⇄</span>
            </button>
          )}

          <div className="mt-6 border-t border-[var(--paper-line)] pt-4">
            <Link
              href={`/songs/${displayedSong.album}/${displayedSong.id}`}
              className="ink-underline text-sm text-ink-soft"
            >
              {t("viewSongPage", lang)} →
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}

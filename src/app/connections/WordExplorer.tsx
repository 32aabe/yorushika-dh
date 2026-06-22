"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getSongById,
  getInterludeSongs,
  getKeyMotifsForSong,
  getCorrespondingSong,
  getStrongSongsForWord,
  getAllSongsForWord,
  getWordNote,
  getRelatedWordsSplit,
  formatNetworkWord,
  localizeAlbum,
  CURATED_ENTRY_WORDS,
  DEFAULT_FOCUS_SONG_ID,
} from "@/lib/data";
import { useLanguage, t, handwrittenClass } from "@/lib/language-context";

const interludeSongs = getInterludeSongs();

type MobileView = { mode: "song"; songId: string } | { mode: "word"; word: string };

/** Mobile counterpart to the desktop notebook-style Connections page --
 * the same progressive, one-focus-at-a-time structure (song -> motifs
 * -> word -> related songs), just read top-to-bottom as a single
 * scrolling card instead of arranged spatially. Crucially this never
 * shows the full word list or full network at once, matching the
 * desktop redesign's first requirement. */
export default function WordExplorer() {
  const { lang } = useLanguage();
  const [view, setView] = useState<MobileView>({ mode: "song", songId: DEFAULT_FOCUS_SONG_ID });
  const [history, setHistory] = useState<MobileView[]>([]);

  function push(next: MobileView) {
    setHistory((h) => [...h, view]);
    setView(next);
  }

  function goBack() {
    setHistory((h) => {
      if (h.length === 0) return h;
      setView(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }

  if (view.mode === "word") {
    const word = view.word;
    const note = getWordNote(word, lang);
    const strongSongs = getStrongSongsForWord(word, 3);
    const allSongs = getAllSongsForWord(word);
    const hasMore = allSongs.length > strongSongs.length;
    const { relatedWords, relatedMotifs } = getRelatedWordsSplit(word, 3);

    return (
      <div className="notebook-paper-aged min-h-[calc(100vh-61px)] px-5 py-8">
        <button onClick={goBack} className="handwritten mb-6 text-base text-ink-faint">
          « {t("backToFocus", lang)}
        </button>

        <p className="mb-1 text-xs uppercase tracking-wide text-ink-faint">
          {lang === "jp" ? "言葉" : lang === "kr" ? "단어" : "Word"}
        </p>
        <h1 className="handwritten-jp mb-6 text-4xl text-ink-main">{formatNetworkWord(word, lang)}</h1>

        {note && (
          <div className="mb-6">
            <h2 className={`${handwrittenClass(lang)} mb-2 text-lg text-ink-main`}>{t("notes", lang)}</h2>
            <p className="text-sm leading-6 text-ink-soft">{note}</p>
          </div>
        )}

        <div className="mb-6">
          <h2 className={`${handwrittenClass(lang)} mb-2 text-lg text-ink-main`}>{t("connectedSongs", lang)}</h2>
          <div className="flex flex-col gap-3">
            {strongSongs.map((s) => (
              <button
                key={s.id}
                onClick={() => push({ mode: "song", songId: s.id })}
                className="flex flex-col items-start rounded-sm border border-[var(--paper-edge-shadow)] bg-paper-cream-light px-4 py-3 text-left"
              >
                <span className="text-sm font-medium text-ink-main">{s.title[lang]}</span>
                <span className="text-xs text-ink-faint">{localizeAlbum(s.album, lang)}</span>
              </button>
            ))}
          </div>
          {hasMore && (
            <p className="mt-2 text-xs italic text-ink-faint">
              {lang === "jp"
                ? `他に${allSongs.length - strongSongs.length}曲でも使われている`
                : lang === "kr"
                  ? `이 외에도 ${allSongs.length - strongSongs.length}곡에서 더 사용된다`
                  : `Also appears in ${allSongs.length - strongSongs.length} more song${allSongs.length - strongSongs.length === 1 ? "" : "s"}`}
            </p>
          )}
        </div>

        {relatedWords.length > 0 && (
          <div className="mb-6">
            <h2 className={`${handwrittenClass(lang)} mb-2 text-lg text-ink-main`}>{t("relatedWords", lang)}</h2>
            <div className="flex flex-col gap-1.5">
              {relatedWords.map((w) => (
                <button
                  key={w.word}
                  onClick={() => push({ mode: "word", word: w.word })}
                  className="handwritten-jp text-left text-base text-ink-main"
                >
                  {w.word}
                </button>
              ))}
            </div>
          </div>
        )}

        {relatedMotifs.length > 0 && (
          <div className="mb-6">
            <h2 className={`${handwrittenClass(lang)} mb-2 text-lg text-ink-main`}>{t("relatedMotifs", lang)}</h2>
            <div className="flex flex-wrap gap-2">
              {relatedMotifs.map((w) => (
                <button
                  key={w.word}
                  onClick={() => push({ mode: "word", word: w.word })}
                  className={`${handwrittenClass(lang)} rounded-sm border border-[var(--highlight-gold-soft)] bg-paper-cream-light px-2 py-0.5 text-base font-medium text-ink-main`}
                >
                  {formatNetworkWord(w.word, lang)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // mode === "song"
  const song = getSongById(view.songId);
  if (!song) return null;
  const motifs = getKeyMotifsForSong(song.id, 4);
  const corresponding = getCorrespondingSong(song);

  return (
    <div className="notebook-paper-aged min-h-[calc(100vh-61px)] px-5 py-8">
      {history.length > 0 && (
        <button onClick={goBack} className="handwritten mb-6 text-base text-ink-faint">
          « {t("backToFocus", lang)}
        </button>
      )}

      <p className="mb-1 text-xs uppercase tracking-wide text-ink-faint">
        {lang === "jp" ? "曲" : lang === "kr" ? "곡" : "Song"}
      </p>
      <h1
        className="mb-1 text-2xl font-semibold text-ink-main"
        style={{
          fontFamily:
            lang === "jp" ? "var(--font-jp-serif)" : lang === "kr" ? "var(--font-kr-serif)" : "var(--font-en-serif)",
        }}
      >
        {song.title[lang]}
      </h1>
      <Link href={`/songs/${song.album}/${song.id}`} className="ink-underline mb-6 inline-block text-sm text-ink-soft">
        {t("viewSongPage", lang)} →
      </Link>

      <div className="mb-6">
        <h2 className={`${handwrittenClass(lang)} mb-2 text-lg text-ink-main`}>{t("keyMotifs", lang)}</h2>
        <div className="flex flex-wrap gap-2">
          {motifs.map((m) => (
            <button
              key={m.word}
              onClick={() => push({ mode: "word", word: m.word })}
              className={`handwritten-jp rounded-full border px-3 py-1 ${
                m.role === "signature"
                  ? "border-[var(--highlight-gold)] text-lg text-ink-main"
                  : "border-[var(--paper-edge-shadow)] text-base text-ink-soft"
              }`}
            >
              {m.word}
            </button>
          ))}
        </div>
      </div>

      {corresponding && (
        <div className="mb-6">
          <h2 className="mb-2 text-xs uppercase tracking-wide text-ink-faint">{t("correspondingSong", lang)}</h2>
          <button
            onClick={() => push({ mode: "song", songId: corresponding.id })}
            className="flex items-center gap-2 rounded-sm bg-[#ede0b8] px-4 py-3 text-left text-[#5c5236]"
          >
            <span className="text-sm leading-snug underline">{corresponding.title[lang]}</span>
            <span aria-hidden>⇄</span>
          </button>
        </div>
      )}

      <button
        onClick={() => push({ mode: "word", word: CURATED_ENTRY_WORDS[0] })}
        className="ink-underline mb-8 inline-block text-sm text-ink-soft"
      >
        {t("startFromWord", lang)} →
      </button>

      <details className="border-t border-[var(--paper-line)] pt-4">
        <summary className={`cursor-pointer ${handwrittenClass(lang)} text-base text-ink-main`}>
          {lang === "jp" ? "間奏・インスト曲" : lang === "kr" ? "간주·인스트루멘탈" : "Interludes"}
        </summary>
        <div className="mt-3 flex flex-col gap-2">
          {interludeSongs.map((s) => (
            <Link
              key={s.id}
              href={`/songs/${s.album}/${s.id}`}
              className="flex items-center justify-between rounded-sm border border-[var(--paper-edge-shadow)] bg-paper-cream-light px-4 py-2.5 text-sm text-ink-soft"
            >
              <span>{s.title[lang]}</span>
              <span className="text-xs text-ink-faint">{localizeAlbum(s.album, lang)}</span>
            </Link>
          ))}
        </div>
      </details>
    </div>
  );
}

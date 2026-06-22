"use client";

import type { Song } from "@/types/song";
import { useLanguage, t, handwrittenClass } from "@/lib/language-context";
import { formatNetworkWord, getWordNote, getRelatedWordsSplit, getAllSongsForWord } from "@/lib/data";

interface WordPanelProps {
  word: string | null;
  /** The small curated set of strongly related songs already shown as
   * postcards in the word-focus scene -- listed here too so the panel
   * stays useful even if the visitor never looks at the scene itself. */
  songs: Song[];
  onClose: () => void;
  onSelectSong: (songId: string) => void;
  onSelectWord: (word: string) => void;
}

/** Notebook side panel for a focused word -- Notes, Related Words, and
 * Related Motifs, in that order, each its own short labeled section
 * rather than one long undifferentiated list. This is the word's
 * counterpart to NotebookPanel (which covers songs): the two are never
 * shown at the same time, and a word's connected songs never carry
 * motif information here -- that split lives in the scene itself. */
export default function WordPanel({ word, songs, onClose, onSelectSong, onSelectWord }: WordPanelProps) {
  const { lang } = useLanguage();
  const open = !!word;

  const note = word ? getWordNote(word, lang) : null;
  const { relatedWords, relatedMotifs } = word ? getRelatedWordsSplit(word, 3) : { relatedWords: [], relatedMotifs: [] };
  const allSongs = word ? getAllSongsForWord(word) : [];
  const hasMore = allSongs.length > songs.length;

  return (
    <aside
      className={`fixed right-0 top-0 z-40 h-full w-full max-w-md border-l border-[var(--paper-edge-shadow)] bg-paper-cream-light shadow-[-6px_0_24px_rgba(40,30,15,0.25)] transition-transform duration-400 ease-out ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ top: "61px", height: "calc(100% - 61px)" }}
      aria-hidden={!open}
    >
      {word && (
        <div className="flex h-full flex-col overflow-y-auto px-7 py-8">
          <button onClick={onClose} className="handwritten mb-4 self-start text-base text-ink-faint hover:text-ink-main">
            « {t("close", lang)}
          </button>

          <p className="mb-1 text-xs uppercase tracking-wide text-ink-faint">
            {lang === "jp" ? "言葉" : lang === "kr" ? "단어" : "Word"}
          </p>
          <h2 className="handwritten-jp mb-6 text-4xl text-ink-main">{formatNetworkWord(word, lang)}</h2>

          {note && (
            <div className="mb-6">
              <h3 className={`${handwrittenClass(lang)} mb-2 text-base text-ink-main`}>{t("notes", lang)}</h3>
              <p className="text-sm leading-6 text-ink-soft">{note}</p>
            </div>
          )}

          {songs.length > 0 && (
            <div className="mb-6">
              <h3 className={`${handwrittenClass(lang)} mb-2 text-base text-ink-main`}>{t("connectedSongs", lang)}</h3>
              <div className="flex flex-col gap-2">
                {songs.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSelectSong(s.id)}
                    className="flex flex-col items-start rounded-sm border border-[var(--paper-edge-shadow)] bg-paper-cream px-3 py-2 text-left text-sm text-ink-main transition-colors hover:bg-paper-aged"
                  >
                    {s.title[lang]}
                  </button>
                ))}
              </div>
              {hasMore && (
                <p className="mt-2 text-xs italic text-ink-faint">
                  {lang === "jp"
                    ? `他に${allSongs.length - songs.length}曲でも使われている`
                    : lang === "kr"
                      ? `이 외에도 ${allSongs.length - songs.length}곡에서 더 사용된다`
                      : `Also appears in ${allSongs.length - songs.length} more song${allSongs.length - songs.length === 1 ? "" : "s"}`}
                </p>
              )}
            </div>
          )}

          {relatedWords.length > 0 && (
            <div className="mb-6">
              <h3 className={`${handwrittenClass(lang)} mb-2 text-base text-ink-main`}>{t("relatedWords", lang)}</h3>
              <div className="flex flex-col gap-1.5">
                {relatedWords.map((w) => (
                  <button
                    key={w.word}
                    onClick={() => onSelectWord(w.word)}
                    className="flex items-center justify-between text-left text-sm text-ink-soft hover:text-ink-main"
                  >
                    <span className="handwritten-jp text-base text-ink-main">{w.word}</span>
                    <span className="text-xs text-ink-faint">{formatNetworkWord(w.word, lang).split("/")[1]?.trim()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {relatedMotifs.length > 0 && (
            <div className="mb-6">
              <h3 className={`${handwrittenClass(lang)} mb-2 text-base text-ink-main`}>{t("relatedMotifs", lang)}</h3>
              <div className="flex flex-wrap gap-2">
                {relatedMotifs.map((w) => (
                  <button
                    key={w.word}
                    onClick={() => onSelectWord(w.word)}
                    className={`${handwrittenClass(lang)} rounded-sm border border-[var(--highlight-gold-soft)] bg-paper-cream-light px-2 py-0.5 text-base font-medium text-ink-main hover:bg-paper-aged`}
                  >
                    {formatNetworkWord(w.word, lang)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

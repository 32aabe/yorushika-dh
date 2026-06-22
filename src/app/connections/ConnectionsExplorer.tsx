"use client";

import { useEffect, useState } from "react";
import {
  getSongById,
  getCorrespondingSong,
  getStrongSongsForWord,
  CURATED_ENTRY_WORDS,
  DEFAULT_FOCUS_SONG_ID,
} from "@/lib/data";
import { useLanguage, t } from "@/lib/language-context";
import SceneViewport from "@/components/SceneViewport";
import SongFocusScene, { SONG_FOCUS_CANVAS, getSongFocusBounds } from "@/components/SongFocusScene";
import WordFocusScene, { WORD_FOCUS_CANVAS, getWordFocusBounds } from "@/components/WordFocusScene";
import CompareScene, { COMPARE_CANVAS, getCompareBounds } from "@/components/CompareScene";
import NotebookPanel from "@/components/NotebookPanel";
import WordPanel from "@/components/WordPanel";

type Mode = "song" | "word" | "compare";

interface ViewState {
  mode: Mode;
  songId: string;
  word: string;
  compareWith: string | null;
}

const INITIAL_STATE: ViewState = {
  mode: "song",
  songId: DEFAULT_FOCUS_SONG_ID,
  word: CURATED_ENTRY_WORDS[0],
  compareWith: null,
};

/** The redesigned Connections page: a notebook-style exploration path
 * rather than a force-directed graph, but still a real board you can
 * move around on. At any moment exactly one scene is the *content* --
 * a focused song, a focused word, or a side-by-side comparison, each
 * with only a handful of nodes -- but that content sits on a small
 * fixed canvas that SceneViewport lets the visitor pan and zoom, so
 * nothing is ever clipped or stuck off-screen. Moving from one focus
 * to another is still always a deliberate click (a motif, a postcard,
 * a corresponding-song note); panning/zooming only changes how much
 * of the *current* scene's small canvas you're looking at, it never
 * reveals other songs or words that weren't already part of it. */
export default function ConnectionsExplorer() {
  const { lang } = useLanguage();
  const [view, setView] = useState<ViewState>(INITIAL_STATE);
  const [deepDiveSongId, setDeepDiveSongId] = useState<string | null>(null);
  const [history, setHistory] = useState<ViewState[]>([]);

    useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const songId = params.get("song");

    if (!songId) return;

    const song = getSongById(songId);
    if (!song) return;

    setView({
      mode: "song",
      songId: song.id,
      word: CURATED_ENTRY_WORDS[0],
      compareWith: null,
    });
    setDeepDiveSongId(null);
    setHistory([]);
  }, []);

  function pushView(next: ViewState) {
    setHistory((h) => [...h, view]);
    setView(next);
    setDeepDiveSongId(null);
  }

  function goBack() {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setView(prev);
      setDeepDiveSongId(null);
      return h.slice(0, -1);
    });
  }

  function focusSong(songId: string) {
    pushView({ ...view, mode: "song", songId });
  }

  function focusWord(word: string) {
    pushView({ ...view, mode: "word", word });
  }

  function openCompare(songId: string) {
    const song = getSongById(songId);
    const corresponding = song ? getCorrespondingSong(song) : undefined;
    if (!song || !corresponding) return;
    pushView({ ...view, mode: "compare", songId, compareWith: corresponding.id });
  }

  // Selecting a word from inside a scene or side panel: jump straight
  // to that word's own focus scene, no intermediate state. Selecting a
  // song does the same for the song-focus scene.
  function handleSelectWordFromScene(word: string) {
    focusWord(word);
  }

  function handleSelectSongFromScene(songId: string) {
    focusSong(songId);
  }

  function closeWordFocus() {
    pushView({ ...view, mode: "song", songId: DEFAULT_FOCUS_SONG_ID });
  }

  const focusedSong = view.mode === "song" || view.mode === "compare" ? getSongById(view.songId) : null;
  const compareSong = view.mode === "compare" && view.compareWith ? getSongById(view.compareWith) : null;

  // The word panel is always open while a word is the focus -- it is
  // the primary content of that scene, not an optional deep dive (see
  // mockup screen 2). The song notebook panel, by contrast, is opened
  // deliberately from the song-focus scene (mockup screen 4 calls it
  // an "optional deep dive").
  const wordPanelWord = view.mode === "word" ? view.word : null;
  const wordPanelSongs = wordPanelWord ? getStrongSongsForWord(wordPanelWord, 3) : [];
  const deepDiveSong = deepDiveSongId ? getSongById(deepDiveSongId) ?? null : null;

  // resetKey changes whenever the *focus* changes (a new song, a new
  // word, or a new comparison pair) -- this is what tells SceneViewport
  // to re-fit its view around the new scene's content instead of
  // keeping whatever pan/zoom the visitor had left on the old one.
  const resetKey =
    view.mode === "song"
      ? `song:${view.songId}`
      : view.mode === "word"
        ? `word:${view.word}`
        : `compare:${view.songId}:${view.compareWith}`;

  return (
    <div className="relative flex h-[calc(100vh-61px)] w-full flex-col overflow-hidden">
      {/* Top strip: back navigation + a quiet way to switch entry mode,
          never a toolbar that implies there's a bigger map underneath. */}
      <div className="notebook-paper-aged flex items-center justify-between px-5 pt-5 sm:px-10">
        <button
          onClick={goBack}
          disabled={history.length === 0}
          className="handwritten text-base text-ink-faint hover:text-ink-main disabled:opacity-0"
        >
          « {t("backToFocus", lang)}
        </button>

        {view.mode !== "compare" && (
          <div className="flex gap-4 text-xs text-ink-faint">
            <button
              onClick={() => pushView({ ...view, mode: "song", songId: DEFAULT_FOCUS_SONG_ID })}
              className={`ink-underline ${view.mode === "song" ? "is-active text-ink-main" : ""}`}
            >
              {t("startFromSong", lang)}
            </button>
            <button
              onClick={() => focusWord(CURATED_ENTRY_WORDS[0])}
              className={`ink-underline ${view.mode === "word" ? "is-active text-ink-main" : ""}`}
            >
              {t("startFromWord", lang)}
            </button>
          </div>
        )}
      </div>

      {/* Curated word chips -- only shown in word-focus mode, as a
          quiet way to jump between the handful of entry words without
          ever exposing the rest of the network. */}
      {view.mode === "word" && (
        <div className="notebook-paper-aged flex flex-wrap justify-center gap-3 px-5 pt-3">
          {CURATED_ENTRY_WORDS.map((w) => (
            <button
              key={w}
              onClick={() => focusWord(w)}
              className={`handwritten-jp rounded-full border px-3 py-1 text-sm transition-colors ${
                view.word === w
                  ? "border-[var(--highlight-gold)] bg-paper-cream-light text-ink-main"
                  : "border-[var(--paper-edge-shadow)] bg-paper-cream-light/60 text-ink-soft hover:bg-paper-cream-light"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      )}

      <div className="notebook-paper-aged relative flex-1 pb-2">
        {view.mode === "song" && focusedSong && (
          <SceneViewport
            key="song-viewport"
            canvasWidth={SONG_FOCUS_CANVAS.width}
            canvasHeight={SONG_FOCUS_CANVAS.height}
            contentBounds={getSongFocusBounds(focusedSong)}
            resetKey={resetKey}
          >
            <SongFocusScene song={focusedSong} onSelectWord={handleSelectWordFromScene} onSelectCorresponding={openCompare} />
          </SceneViewport>
        )}

        {view.mode === "word" && (
          <SceneViewport
            key="word-viewport"
            canvasWidth={WORD_FOCUS_CANVAS.width}
            canvasHeight={WORD_FOCUS_CANVAS.height}
            contentBounds={getWordFocusBounds(view.word)}
            resetKey={resetKey}
          >
            <WordFocusScene word={view.word} onSelectSong={handleSelectSongFromScene} />
          </SceneViewport>
        )}

        {view.mode === "compare" && focusedSong && compareSong && (
          <SceneViewport
            key="compare-viewport"
            canvasWidth={COMPARE_CANVAS.width}
            canvasHeight={COMPARE_CANVAS.height}
            contentBounds={getCompareBounds()}
            resetKey={resetKey}
          >
            <CompareScene songA={focusedSong} songB={compareSong} onSelectWord={handleSelectWordFromScene} />
          </SceneViewport>
        )}

        {history.length === 0 && (
          <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-xs text-ink-faint sm:text-sm">
            {t("connectionsIntroHint", lang)}
          </p>
        )}

        {/* Optional song-detail deep dive, opened deliberately from the
            song-focus scene -- never automatic. */}
        {view.mode === "song" && focusedSong && (
          <button
            onClick={() => setDeepDiveSongId(focusedSong.id)}
            className="absolute right-6 top-6 z-20 hidden rounded-sm border border-[var(--paper-edge-shadow)] bg-paper-cream-light/90 px-3 py-1.5 text-xs text-ink-soft hover:bg-paper-cream sm:block"
          >
            {t("viewSongPage", lang)}
          </button>
        )}
      </div>

      <NotebookPanel song={deepDiveSong} onClose={() => setDeepDiveSongId(null)} onCompare={openCompare} />

      <WordPanel
        word={wordPanelWord}
        songs={wordPanelSongs}
        onClose={closeWordFocus}
        onSelectSong={handleSelectSongFromScene}
        onSelectWord={handleSelectWordFromScene}
      />
    </div>
  );
}

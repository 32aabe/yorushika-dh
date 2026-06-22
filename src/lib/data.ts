import songsJson from "@/data/songs.json";
import lyricsJson from "@/data/lyrics.json";
import songWordsJson from "@/data/song-words.json";
import songEdgesJson from "@/data/song-edges.json";
import wordEdgesJson from "@/data/word-edges.json";
import wordGlossesJson from "@/data/word-glosses.json";
import wordNotesJson from "@/data/word-notes.json";
import songRelationshipNotesJson from "@/data/song-relationship-notes.json";
import mapLayoutJson from "@/data/map-layout.json";
import type {
  Song,
  SongWord,
  SongEdge,
  WordEdge,
  WordGloss,
  WordRole,
  Lang,
  LocalizedText,
} from "@/types/song";

export const songs: Song[] = songsJson as Song[];
export const lyrics: Record<string, LocalizedText> = lyricsJson as Record<string, LocalizedText>;
export const songWords: Record<string, SongWord[]> = songWordsJson as Record<string, SongWord[]>;
export const songEdges: SongEdge[] = songEdgesJson as SongEdge[];
export const wordEdges: WordEdge[] = wordEdgesJson as WordEdge[];
export const wordGlosses: Record<string, WordGloss> = wordGlossesJson as Record<string, WordGloss>;

interface SongPos {
  x: number;
  y: number;
  rotation: number;
}
interface WordPos {
  x: number;
  y: number;
  degree: number;
  frequency: number;
}
interface InterludePos {
  x: number;
  y: number;
  rotation: number;
}

/** The Connections board's bipartite layout: songs connect only to the
 * words they contain, never directly to other songs. Word node position
 * already encodes degree (how many songs share that word) and frequency
 * (how often it appears in total) so node size can scale from it directly. */
export const mapLayout = mapLayoutJson as {
  canvasWidth: number;
  canvasHeight: number;
  songPositions: Record<string, SongPos>;
  wordPositions: Record<string, WordPos>;
  interludePositions: Record<string, InterludePos>;
};

/** All (song, word) pairs across the whole network, derived from
 * songWords -- this is the edge set for the bipartite graph. */
export function getAllSongWordEdges(): { songId: string; word: string }[] {
  const out: { songId: string; word: string }[] = [];
  for (const [songId, entries] of Object.entries(songWords)) {
    for (const e of entries) out.push({ songId, word: e.word });
  }
  return out;
}

/** Every song id connected to a given word. */
export function getSongsForWord(word: string): string[] {
  return getAllSongWordEdges()
    .filter((e) => e.word === word)
    .map((e) => e.songId);
}

/** The handful of words that appear on the Connections board before the
 * visitor has clicked anything -- the recurring motifs strong enough to
 * carry the whole map on their own (degree >= MIN_DEGREE songs sharing
 * them). Everything else only appears once revealed by clicking a word
 * or a song, so the first impression is a short list of motifs on an
 * otherwise empty page, not the full graph. */
const MAJOR_MOTIF_MIN_DEGREE = 3;
export function getMajorMotifWords(): string[] {
  return Object.entries(mapLayout.wordPositions)
    .filter(([, pos]) => pos.degree >= MAJOR_MOTIF_MIN_DEGREE)
    .sort((a, b) => b[1].degree - a[1].degree)
    .map(([word]) => word);
}

/** The notebook-style Connections page opens on one of two small,
 * hand-picked entry points rather than any part of the full network:
 * a single focused song, or this short curated list of motif words.
 * Deliberately much smaller than getMajorMotifWords() (which still
 * powers the mobile word list) -- four words is a page you could
 * actually hold in your head, not a legend for a graph. */
export const CURATED_ENTRY_WORDS = ["言葉", "心", "夏", "人生"];

/** The song the Connections page centers on by default -- "Rain and
 * Cappuccino" is the first meeting between Amy and Elma, sits at a
 * natural three-word hub (言葉/僕/わかる as bridge words, 君/花 as
 * signature), and has a corresponding song already defined, so it
 * exercises every part of the focused-song view immediately. */
export const DEFAULT_FOCUS_SONG_ID = "ame-to-cappuccino";

/** Up to `limit` motif words for a song, signature words first (the
 * ones unique to it) then bridge words (the ones it shares with the
 * rest of the network), each tier ordered by roleRank. This is what
 * surrounds a song in the focused-song view -- never the song's full
 * word list, just the handful worth showing at a glance. */
export function getKeyMotifsForSong(songId: string, limit = 4): SongWord[] {
  const words = getWordsForSong(songId);
  const sorted = [...words].sort((a, b) => {
    const roleScore = (r: WordRole) => (r === "signature" ? 0 : 1);
    const roleDiff = roleScore(a.role) - roleScore(b.role);
    if (roleDiff !== 0) return roleDiff;
    return (a.roleRank ?? 99) - (b.roleRank ?? 99);
  });
  return sorted.slice(0, limit);
}

/** Up to `limit` songs most strongly carrying a given word, ranked by
 * how central the word is within each song (signature before bridge,
 * then roleRank, then how often it's actually used) rather than just
 * alphabetically -- the "strongly related songs" the brief asks for
 * when a word becomes the focus, not the complete connected set. */
export function getStrongSongsForWord(word: string, limit = 3): Song[] {
  const scored: { songId: string; roleScore: number; roleRank: number; freq: number }[] = [];
  for (const [songId, entries] of Object.entries(songWords)) {
    const entry = entries.find((e) => e.word === word);
    if (!entry) continue;
    scored.push({
      songId,
      roleScore: entry.role === "signature" ? 0 : 1,
      roleRank: entry.roleRank ?? 99,
      freq: entry.frequencyInSong,
    });
  }
  scored.sort((a, b) => a.roleScore - b.roleScore || a.roleRank - b.roleRank || b.freq - a.freq);
  return scored
    .slice(0, limit)
    .map((s) => getSongById(s.songId))
    .filter((s): s is Song => !!s);
}

/** Every song connected to a word, including beyond the curated
 * top-N shown by default -- used for an optional "show all" affordance
 * rather than the initial reveal. */
export function getAllSongsForWord(word: string): Song[] {
  return getSongsForWord(word)
    .map((id) => getSongById(id))
    .filter((s): s is Song => !!s);
}

/** Up to `limit` other network words most often sharing a song with
 * the given word, strongest connection first. This is the "Related
 * Words" list in the word notebook panel -- a different relationship
 * entirely from a word's connected songs, drawn from the word-to-word
 * edge set rather than the bipartite song-word one. */
export function getRelatedWords(word: string, limit = 4): { word: string; weight: number }[] {
  const out: { word: string; weight: number }[] = [];
  for (const e of wordEdges) {
    if (e.source === word) out.push({ word: e.target, weight: e.weight });
    else if (e.target === word) out.push({ word: e.source, weight: e.weight });
  }
  out.sort((a, b) => b.weight - a.weight);
  return out.slice(0, limit);
}

/** Splits a word's related words into "motifs" (other words strong
 * enough to be major hubs in their own right -- see
 * getMajorMotifWords) versus plainer "related words", so the notebook
 * panel can show the two as separate short lists the way the mockup's
 * "Related Words" / "Related Motifs" sections do, rather than one
 * undifferentiated bag of connections. */
export function getRelatedWordsSplit(
  word: string,
  limit = 4,
): { relatedWords: { word: string; weight: number }[]; relatedMotifs: { word: string; weight: number }[] } {
  const all = getRelatedWords(word, 10);
  const majorMotifs = new Set(getMajorMotifWords());
  const relatedMotifs = all.filter((w) => majorMotifs.has(w.word)).slice(0, limit);
  const relatedWords = all.filter((w) => !majorMotifs.has(w.word)).slice(0, limit);
  return { relatedWords, relatedMotifs };
}

/** Hand-written-feeling notebook note for a focused word. A short
 * curated set (see word-notes.json) carries an actual written
 * observation; anything else falls back to a plain, data-derived
 * sentence so the word panel never shows an empty Notes section. */
export function getWordNote(word: string, lang: Lang): string | null {
  const curated = (wordNotesJson as Record<string, LocalizedText>)[word];
  const written = curated ? localize(curated, lang) : null;
  if (written) return written;

  const songCount = getSongsForWord(word).length;
  const related = getRelatedWords(word, 1)[0];
  if (songCount === 0) return null;
  if (lang === "jp") {
    return related
      ? `${songCount}曲に登場する言葉。「${related.word}」としばしば一緒に現れる。`
      : `${songCount}曲に登場する言葉。`;
  }
  if (lang === "kr") {
    return related
      ? `${songCount}곡에 등장하는 단어. "${related.word}"와 자주 함께 나타난다.`
      : `${songCount}곡에 등장하는 단어.`;
  }
  return related
    ? `Appears across ${songCount} songs, often alongside "${related.word}."`
    : `Appears across ${songCount} songs.`;
}

export function getSongById(id: string): Song | undefined {
  return songs.find((s) => s.id === id);
}

export function getSongsByAlbum(album: "dakara" | "elma"): Song[] {
  return songs
    .filter((s) => s.album === album)
    .sort((a, b) => a.trackNo - b.trackNo);
}

export function getCorrespondingSong(song: Song): Song | undefined {
  if (!song.correspondingSongId) return undefined;
  return getSongById(song.correspondingSongId);
}

/** Motif words both songs in a corresponding-song pair share, used in
 * the 1:1 comparison view. Deliberately a separate, much smaller list
 * than either song's full motif set -- the point of the comparison is
 * what overlaps, not everything either song touches on. */
export function getCommonMotifs(songIdA: string, songIdB: string): string[] {
  const wordsA = new Set(getWordsForSong(songIdA).map((w) => w.word));
  const wordsB = getWordsForSong(songIdB).map((w) => w.word);
  return wordsB.filter((w) => wordsA.has(w));
}

/** Hand-written-feeling note on how a corresponding-song pair relates,
 * looked up by the unordered pair of ids (order doesn't matter -- the
 * relationship reads the same from either side). Falls back to a
 * plain, data-derived line built from the shared motifs so the compare
 * view never shows an empty note even for an as-yet-unwritten pair. */
export function getRelationshipNote(songIdA: string, songIdB: string, lang: Lang): string | null {
  const key = [songIdA, songIdB].sort().join("|");
  const curated = (songRelationshipNotesJson as Record<string, LocalizedText>)[key];
  const written = curated ? localize(curated, lang) : null;
  if (written) return written;

  const common = getCommonMotifs(songIdA, songIdB);
  if (common.length === 0) return null;
  const songA = getSongById(songIdA);
  const songB = getSongById(songIdB);
  if (!songA || !songB) return null;
  const list = common.slice(0, 3).join(lang === "en" ? ", " : "、");
  if (lang === "jp") return `${songA.title.jp}と${songB.title.jp}は、${list}という言葉を共有している。`;
  if (lang === "kr") return `${songA.title.kr}와 ${songB.title.kr}는 ${list} 같은 말을 공유하고 있다.`;
  return `${songA.title.en} and ${songB.title.en} share words like ${list}.`;
}

export function getWordsForSong(songId: string): SongWord[] {
  return songWords[songId] ?? [];
}

export function getEdgesForSong(songId: string): SongEdge[] {
  return songEdges.filter((e) => e.source === songId || e.target === songId);
}

export function getLyricsForSong(songId: string): LocalizedText | null {
  return lyrics[songId] ?? null;
}

/** Picks the best available localized string, falling back to Japanese
 * (the source-of-truth language for this project) when a translation is
 * missing, and finally to null if nothing exists at all. */
export function localize(text: LocalizedText | null | undefined, lang: Lang): string | null {
  if (!text) return null;
  return text[lang] ?? text.jp ?? text.en ?? text.kr ?? null;
}

/** Short EN/KR gloss for a single Japanese network word, e.g. "words" for
 * "言葉". Returns null if no gloss has been written for that word yet. */
export function getWordGloss(word: string, lang: "en" | "kr"): string | null {
  return wordGlosses[word]?.[lang] ?? null;
}

/** Formats a network word for display in a given language: the Japanese
 * original is always kept, with a short gloss appended for en/kr so the
 * word-network analysis (which is built on the Japanese lyrics) stays
 * legible without erasing the source language. */
export function formatNetworkWord(word: string, lang: Lang): string {
  if (lang === "jp") return word;
  const gloss = getWordGloss(word, lang);
  return gloss ? `${word} / ${gloss}` : word;
}

/** All non-interlude songs, used for the network map. */
export function getNetworkSongs(): Song[] {
  return songs.filter((s) => !s.isInterlude);
}

/** Instrumental/lyric-less tracks. They have no word edges, so they
 * render on the Connections board as small, visually secondary
 * "paper scrap" notes rather than full postcards. */
export function getInterludeSongs(): Song[] {
  return songs.filter((s) => s.isInterlude);
}

export const ALBUM_LABEL: Record<"dakara" | "elma", LocalizedText> = {
  dakara: { jp: "だから僕は音楽を辞めた", en: "Dakara Boku wa Ongaku wo Yameta", kr: "그래서 나는 음악을 그만두었다" },
  elma: { jp: "エルマ", en: "Elma", kr: "엘마" },
};

export function localizeAlbum(album: "dakara" | "elma", lang: Lang): string {
  return localize(ALBUM_LABEL[album], lang) ?? album;
}

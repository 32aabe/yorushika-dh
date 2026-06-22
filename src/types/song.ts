export type Lang = "jp" | "en" | "kr";

export type AlbumId = "dakara" | "elma";

export interface LocalizedText {
  jp: string | null;
  en: string | null;
  kr: string | null;
}

export interface SongColor {
  main: string;
  mainName: string | null;
  secondary: string | null;
  secondaryName: string | null;
}

export interface InterviewExcerpt {
  quote: LocalizedText;
  source: string;
}

/** Six motif groupings used to lay out and color the Connections board.
 * Every networked song belongs to exactly one primary cluster, chosen from
 * its mood / water-motif / keyword metadata. */
export type MotifClusterId =
  | "rain-water"
  | "writing-words"
  | "memory-loss"
  | "city-travel"
  | "amy-elma"
  | "music-silence";

export interface Song {
  id: string;
  album: AlbumId;
  trackNo: number;
  isInterlude: boolean;
  title: {
    jp: string;
    kr: string;
    en: string;
  };
  correspondingSongId: string | null;
  motifCluster: MotifClusterId | null;
  color: SongColor;
  mainObject: string | null;
  secondaryObjects: string[];
  mood: string | null;
  movementFeeling: string | null;
  weather: string | null;
  lighting: string | null;
  paperCondition: string | null;
  waterMotif: string | null;
  keywords: string[];
  /** The line is always transcribed faithfully in Japanese (jp). en/kr
   * carry an idiomatic translation where available, falling back to jp
   * in the UI if null. */
  representativeLyric: LocalizedText;
  mvSceneNotes: string | null;
  hiddenObjectNotes: string | null;
  summary: LocalizedText;
  description: LocalizedText;
  interviewExcerpts: InterviewExcerpt[];
  youtubeUrl: string | null;
  youtubeMusicUrl: string | null;
  mvThumbnail: string | null;
  postcardImage: string | null;
}

export type WordRole = "bridge" | "signature";

export interface SongWord {
  word: string;
  role: WordRole;
  roleRank: number | null;
  frequencyInSong: number;
  sharedSongCount: number;
}

/** English/Korean gloss for a single Japanese network word. The word
 * network itself is built from the Japanese lyrics, so the original is
 * always shown -- this is a short paired translation, not a replacement. */
export interface WordGloss {
  en: string;
  kr: string;
}

export interface SongEdge {
  source: string;
  target: string;
  sharedWordCount: number;
  sharedWords: string[];
  weight: number;
  /** True for the small curated subset of edges shown by default on the
   * Connections board (the board's strongest/most legible connections).
   * All edges remain available when a song is selected. */
  featured: boolean;
}

export interface WordEdge {
  source: string;
  target: string;
  sharedSongCount: number;
  sharedSongs: string[];
  weight: number;
}

export interface MotifClusterDef {
  id: MotifClusterId;
  label: LocalizedText;
  /** Soft accent color used for the cluster's region label + ink lines */
  color: string;
  /** Center point on the board canvas that song positions are scattered around */
  center: { x: number; y: number };
}

"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Lang } from "@/types/song";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  cycleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const ORDER: Lang[] = ["jp", "en", "kr"];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("jp");

  const cycleLang = useCallback(() => {
    setLang((prev) => {
      const idx = ORDER.indexOf(prev);
      return ORDER[(idx + 1) % ORDER.length];
    });
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, cycleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

/** UI chrome strings — small enough to inline rather than a heavier i18n lib. */
export const UI_STRINGS: Record<string, Record<Lang, string>> = {
  songs: { jp: "Songs", en: "Songs", kr: "Songs" },
  connections: { jp: "Connections", en: "Connections", kr: "Connections" },
  story: { jp: "Story", en: "Story", kr: "Story" },
  about: { jp: "About", en: "About", kr: "About" },
  start: { jp: "はじめる", en: "START", kr: "시작하기" },
  aboutYorushika: { jp: "ヨルシカについて", en: "About Yorushika", kr: "요루시카에 대해" },
  aboutProject: { jp: "このサイトについて", en: "About This Project", kr: "이 사이트에 대해" },
  viewConnections: { jp: "つながりを見る", en: "View connections", kr: "연결 보기" },
  correspondingSong: { jp: "対応する曲", en: "Corresponding song", kr: "대응하는 곡" },
  bridgeWords: { jp: "架け橋となる言葉", en: "Bridge words", kr: "다리가 되는 말" },
  signatureWords: { jp: "この曲だけの言葉", en: "Signature words", kr: "이 곡만의 말" },
  representativeLyric: { jp: "象徴的な一節", en: "Representative lyric", kr: "대표 가사" },
  watchOnYoutube: { jp: "YouTubeで見る", en: "Watch on YouTube", kr: "유튜브에서 보기" },
  listenOnYoutubeMusic: { jp: "YouTube Musicで聴く", en: "Listen on YouTube Music", kr: "유튜브 뮤직에서 듣기" },
  relatedSongs: { jp: "関連する曲", en: "Related songs", kr: "관련된 곡" },
  trackList: { jp: "トラックリスト", en: "Track list", kr: "트랙 리스트" },
  close: { jp: "閉じる", en: "Close", kr: "닫기" },
  artistComment: { jp: "作者コメント", en: "Artist comment", kr: "아티스트 코멘트" },
  source: { jp: "出典", en: "Source", kr: "출처" },
  lyrics: { jp: "歌詞", en: "Lyrics", kr: "가사" },
  viewOnMap: { jp: "つながりの地図で見る", en: "View on the connections map", kr: "연결 지도에서 보기" },
  viewSongPage: { jp: "曲ページへ", en: "Go to song page", kr: "곡 페이지로" },
  homeIntro: {
  jp: "ヨルシカの対になる二つのアルバム『だから僕は音楽を辞めた』と『エルマ』に繰り返し現れる言葉やモチーフを分析し、それらが曲同士をどのようにつなぐのかを可視化するデジタル・ヒューマニティーズのプロジェクトです。",
  en: "A digital humanities project that analyzes repeated words and motifs in Yorushika’s paired albums, That’s Why I Gave Up on Music and Elma, and visualizes how the songs connect through them.",
  kr: "요루시카의 두 앨범 《그래서 나는 음악을 그만두었다》와 《엘마》에 반복되는 단어와 모티프를 분석하고, 그것들이 곡들을 어떻게 연결하는지 시각화한 디지털 인문학 프로젝트입니다.",
  },
  homeStoryTitle: { jp: "Story", en: "Story", kr: "Story" },
  homeStoryDesc: {
    jp: "エイミーとエルマの物語をたどる",
    en: "Follow Amy and Elma's narrative",
    kr: "에이미와 엘마의 이야기를 따라가다",
  },
  homeSongsTitle: { jp: "Songs", en: "Songs", kr: "Songs" },
  homeSongsDesc: {
    jp: "曲のアーカイブをめぐる",
    en: "Browse the song archive",
    kr: "곡 아카이브를 둘러보다",
  },
  homeConnectionsTitle: { jp: "Connections", en: "Connections", kr: "Connections" },
  homeConnectionsDesc: {
    jp: "繰り返し現れる言葉とモチーフをたどる",
    en: "Trace recurring motifs and words",
    kr: "반복되는 모티프와 단어를 따라가다",
  },
  homeAboutNote: {
    jp: "このサイトの成り立ちについては",
    en: "For how this site was made, see",
    kr: "이 사이트가 만들어진 과정은",
  },
  homeAboutLink: {
    jp: "About / 手法について",
    en: "About / Methodology",
    kr: "About / 방법론",
  },
  connectionsHint: {
    jp: "言葉をクリックして、つながる曲を見つけてください",
    en: "Click a word to find the songs it connects to",
    kr: "단어를 클릭하면 연결된 곡을 볼 수 있습니다",
  },
  notes: { jp: "メモ", en: "Notes", kr: "메모" },
  relatedWords: { jp: "関連する言葉", en: "Related Words", kr: "관련 단어" },
  relatedMotifs: { jp: "関連するモチーフ", en: "Related Motifs", kr: "관련 모티프" },
  keyMotifs: { jp: "主なモチーフ", en: "Key Motifs", kr: "주요 모티프" },
  connectedSongs: { jp: "つながる曲", en: "Connected Songs", kr: "연결된 곡" },
  showAllSongs: { jp: "他の曲も見る", en: "Show all connected songs", kr: "다른 곡도 보기" },
  startFromSong: { jp: "曲から始める", en: "Start from a song", kr: "곡에서 시작" },
  startFromWord: { jp: "言葉から始める", en: "Start from a word", kr: "단어에서 시작" },
  compareThem: { jp: "1:1で比べる", en: "Compare side by side", kr: "1:1로 비교하기" },
  commonMotifs: { jp: "共通するモチーフ", en: "Common Motifs", kr: "공통 모티프" },
  relationshipNote: { jp: "関係についてのメモ", en: "Relationship Note", kr: "관계 노트" },
  backToFocus: { jp: "戻る", en: "Back", kr: "뒤로" },
  relatedSongsAtEnd: { jp: "関連する曲", en: "Related Songs", kr: "관련 곡" },
  connectionsIntroHint: {
    jp: "ここから少しずつ、曲と言葉をたどっていきます",
    en: "Start here, and trace the songs and words a little at a time",
    kr: "여기서부터 천천히 곡과 단어를 따라가 봅니다",
  },
  storyDisclaimer: {
    jp: "この物語の道筋は、ヨルシカの「エイミー」と「エルマ」の物語にもとづく、私自身の解釈による再構成です。公式の正史ではありません。",
    en: "This story path is my own interpretive reconstruction based on Yorushika's Amy and Elma narrative. It is not official canon.",
    kr: "이 이야기 경로는 요루시카의 「에이미」와 「엘마」 서사를 바탕으로 한, 저 개인의 해석적 재구성입니다. 공식 정사가 아닙니다.",
  },
};

export function t(key: keyof typeof UI_STRINGS, lang: Lang): string {
  return UI_STRINGS[key]?.[lang] ?? key;
}

/** Returns the right decorative handwritten-style class for the given
 * language. Use this instead of hardcoding "handwritten" anywhere text
 * might render in Japanese or Korean -- Caveat (the Latin handwritten
 * font) has no CJK glyphs and silently falls back to whatever serif the
 * browser/OS happens to have, which renders inconsistently. */
export function handwrittenClass(lang: Lang): string {
  if (lang === "jp") return "handwritten-jp";
  if (lang === "kr") return "handwritten-kr";
  return "handwritten";
}

"use client";

import { useLanguage } from "@/lib/language-context";
import { getStrongSongsForWord } from "@/lib/data";
import CenterWordDisplay from "@/components/CenterWordDisplay";
import OrbitPostcard from "@/components/OrbitPostcard";
import InkConnector from "@/components/InkConnector";

interface WordFocusSceneProps {
  word: string;
  onSelectSong: (songId: string) => void;
}

export const WORD_FOCUS_CANVAS = { width: 900, height: 620 };

const CENTER = { x: 450, y: 300 };

// Up to three postcards, arranged left / right / bottom around the
// center word -- fixed canvas pixels, with comfortable clearance from
// the center word so the layout stays legible at any zoom level.
const SLOTS = [
  { x: 180, y: 130 },
  { x: 720, y: 130 },
  { x: 450, y: 520 },
];

export function getWordFocusBounds(word: string) {
  const songCount = Math.min(getStrongSongsForWord(word, 3).length, SLOTS.length);
  const points: { x: number; y: number; hw: number; hh: number }[] = [
    { x: CENTER.x, y: CENTER.y, hw: 130, hh: 70 },
  ];
  for (let i = 0; i < songCount; i++) {
    points.push({ x: SLOTS[i].x, y: SLOTS[i].y, hw: 80, hh: 85 });
  }
  const minX = Math.min(...points.map((p) => p.x - p.hw));
  const maxX = Math.max(...points.map((p) => p.x + p.hw));
  const minY = Math.min(...points.map((p) => p.y - p.hh));
  const maxY = Math.max(...points.map((p) => p.y + p.hh));
  return { minX, minY, maxX, maxY };
}

/** Mockup screen 2: a single word at the center of the page, with only
 * a small curated set of its most strongly connected songs revealed
 * around it (see getStrongSongsForWord) -- never the word's complete
 * connected-song list, which still exists but only surfaces as a
 * "show more" option inside the side panel. Lives on a small fixed
 * canvas that SceneViewport lets the visitor pan and zoom around. */
export default function WordFocusScene({ word, onSelectSong }: WordFocusSceneProps) {
  const { lang } = useLanguage();
  const songs = getStrongSongsForWord(word, 3);

  return (
    <>
      {songs.map((s, i) => {
        const slot = SLOTS[i];
        if (!slot) return null;
        return (
          <InkConnector key={`line-${s.id}`} x1={CENTER.x} y1={CENTER.y} x2={slot.x} y2={slot.y} seed={word + s.id} />
        );
      })}

      <div className="absolute" style={{ left: CENTER.x, top: CENTER.y, transform: "translate(-50%, -50%)", zIndex: 10 }}>
        <CenterWordDisplay word={word} lang={lang} />
      </div>

      {songs.map((s, i) => {
        const slot = SLOTS[i];
        if (!slot) return null;
        return (
          <div
            key={s.id}
            className="absolute"
            style={{ left: slot.x, top: slot.y, transform: "translate(-50%, -50%)", zIndex: 5 }}
          >
            <OrbitPostcard song={s} onClick={() => onSelectSong(s.id)} />
          </div>
        );
      })}
    </>
  );
}

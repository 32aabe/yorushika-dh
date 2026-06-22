"use client";

import type { Song } from "@/types/song";
import { useLanguage } from "@/lib/language-context";
import { getKeyMotifsForSong, getCorrespondingSong } from "@/lib/data";
import CenterSongCard from "@/components/CenterSongCard";
import MotifWordTag from "@/components/MotifWordTag";
import PinnedNote from "@/components/PinnedNote";
import InkConnector from "@/components/InkConnector";

interface SongFocusSceneProps {
  song: Song;
  onSelectWord: (word: string) => void;
  onSelectCorresponding: (songId: string) => void;
}

export const SONG_FOCUS_CANVAS = { width: 900, height: 620 };

const CENTER = { x: 450, y: 310 };

// Fixed canvas-pixel positions around the center card -- up to four
// motifs in a diamond, with generous clearance from the card and from
// each other so nothing touches even at the smallest zoom level. This
// replaces the old percentage-based layout: positions are now real
// pixel coordinates on a fixed-size canvas that SceneViewport pans and
// zooms as a whole, rather than CSS percentages of a responsive box.
const MOTIF_SLOTS = [
  { x: 450, y: 90 },
  { x: 760, y: 310 },
  { x: 450, y: 530 },
  { x: 140, y: 310 },
];

const PINNED_NOTE_POS = { x: 800, y: 540 };

/** Pure bounding-box helper so ConnectionsExplorer can hand
 * SceneViewport a content rect to fit the initial view around,
 * without needing a render-cycle round trip. Mirrors the actual
 * layout below -- if the layout changes, update this alongside it. */
export function getSongFocusBounds(song: Song) {
  const motifCount = Math.min(getKeyMotifsForSong(song.id, 4).length, MOTIF_SLOTS.length);
  const hasPinnedNote = !!getCorrespondingSong(song);

  const points: { x: number; y: number; hw: number; hh: number }[] = [
    { x: CENTER.x, y: CENTER.y, hw: 115, hh: 110 },
  ];
  for (let i = 0; i < motifCount; i++) {
    points.push({ x: MOTIF_SLOTS[i].x, y: MOTIF_SLOTS[i].y, hw: 65, hh: 55 });
  }
  if (hasPinnedNote) {
    points.push({ x: PINNED_NOTE_POS.x, y: PINNED_NOTE_POS.y, hw: 90, hh: 60 });
  }

  const minX = Math.min(...points.map((p) => p.x - p.hw));
  const maxX = Math.max(...points.map((p) => p.x + p.hw));
  const minY = Math.min(...points.map((p) => p.y - p.hh));
  const maxY = Math.max(...points.map((p) => p.y + p.hh));
  return { minX, minY, maxX, maxY };
}

/** Mockup screen 1/4: one song at the center of the page, its most
 * important motifs arranged around it (never the song's full word
 * list), and -- kept deliberately separate from the motif relationships
 * -- its corresponding song as a small pinned note off to the side.
 * Lives on a small fixed canvas that SceneViewport lets the visitor
 * pan and zoom around, so even though only a handful of nodes are
 * ever shown, nothing is ever clipped or unreachable. */
export default function SongFocusScene({ song, onSelectWord, onSelectCorresponding }: SongFocusSceneProps) {
  const { lang } = useLanguage();
  const motifs = getKeyMotifsForSong(song.id, 4);
  const corresponding = getCorrespondingSong(song);

  return (
    <>
      {motifs.map((m, i) => {
        const slot = MOTIF_SLOTS[i];
        if (!slot) return null;
        return (
          <InkConnector key={`line-${m.word}`} x1={CENTER.x} y1={CENTER.y} x2={slot.x} y2={slot.y} seed={song.id + m.word} />
        );
      })}

      <div className="absolute" style={{ left: CENTER.x, top: CENTER.y, transform: "translate(-50%, -50%)", zIndex: 10 }}>
        <CenterSongCard song={song} />
      </div>

      {motifs.map((m, i) => {
        const slot = MOTIF_SLOTS[i];
        if (!slot) return null;
        return (
          <div
            key={m.word}
            className="absolute"
            style={{ left: slot.x, top: slot.y, transform: "translate(-50%, -50%)", zIndex: 5 }}
          >
            <MotifWordTag
              word={m.word}
              lang={lang}
              emphasis={m.role === "signature" ? "signature" : "bridge"}
              onClick={() => onSelectWord(m.word)}
            />
          </div>
        );
      })}

      {corresponding && (
        <div
          className="absolute"
          style={{ left: PINNED_NOTE_POS.x, top: PINNED_NOTE_POS.y, transform: "translate(-50%, -50%)", zIndex: 8 }}
        >
          <PinnedNote song={corresponding} onClick={() => onSelectCorresponding(song.id)} />
        </div>
      )}
    </>
  );
}

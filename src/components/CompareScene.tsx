"use client";

import type { Song } from "@/types/song";
import { useLanguage, t, handwrittenClass } from "@/lib/language-context";
import { getCommonMotifs, getRelationshipNote, formatNetworkWord } from "@/lib/data";
import CenterSongCard from "@/components/CenterSongCard";

interface CompareSceneProps {
  songA: Song;
  songB: Song;
  onSelectWord: (word: string) => void;
}

export const COMPARE_CANVAS = { width: 900, height: 700 };

const CARD_A_POS = { x: 280, y: 230 };
const CARD_B_POS = { x: 620, y: 230 };
const ARROW_POS = { x: 450, y: 230 };
const MOTIFS_Y = 410;
const NOTE_Y = 540;

/** Pure bounding-box helper mirroring the fixed layout below, so
 * ConnectionsExplorer can fit the initial view around it without a
 * render round trip. The note block gets generous reserved height
 * since its length varies per song pair (see song-relationship-notes
 * .json) -- comfortably covers even the longest curated note. */
export function getCompareBounds() {
  const points = [
    { x: CARD_A_POS.x, y: CARD_A_POS.y, hw: 115, hh: 115 },
    { x: CARD_B_POS.x, y: CARD_B_POS.y, hw: 115, hh: 115 },
    { x: 450, y: MOTIFS_Y, hw: 260, hh: 40 },
    { x: 450, y: NOTE_Y, hw: 240, hh: 90 },
  ];
  const minX = Math.min(...points.map((p) => p.x - p.hw));
  const maxX = Math.max(...points.map((p) => p.x + p.hw));
  const minY = Math.min(...points.map((p) => p.y - p.hh));
  const maxY = Math.max(...points.map((p) => p.y + p.hh));
  return { minX, minY, maxX, maxY };
}

/** Mockup screen 5: the 1:1 comparison view for a corresponding-song
 * pair -- two postcards side by side, the small set of motifs they
 * share listed once below (not duplicated on each side), and a
 * written relationship note. This is the *only* place corresponding
 * songs and motif words appear together, by design -- everywhere else
 * (the song-focus scene) keeps the two relationships apart. Lives on
 * the same fixed-canvas + SceneViewport pattern as the other scenes. */
export default function CompareScene({ songA, songB, onSelectWord }: CompareSceneProps) {
  const { lang } = useLanguage();
  const common = getCommonMotifs(songA.id, songB.id);
  const note = getRelationshipNote(songA.id, songB.id, lang);

  return (
    <>
      <div
        className="absolute"
        style={{ left: CARD_A_POS.x, top: CARD_A_POS.y, transform: "translate(-50%, -50%)", zIndex: 10 }}
      >
        <CenterSongCard song={songA} />
      </div>

      <div
        aria-hidden
        className={`${handwrittenClass(lang)} absolute text-3xl text-ink-faint`}
        style={{ left: ARROW_POS.x, top: ARROW_POS.y, transform: "translate(-50%, -50%)", zIndex: 6 }}
      >
        ↔
      </div>

      <div
        className="absolute"
        style={{ left: CARD_B_POS.x, top: CARD_B_POS.y, transform: "translate(-50%, -50%)", zIndex: 10 }}
      >
        <CenterSongCard song={songB} />
      </div>

      {common.length > 0 && (
        <div
          className="absolute flex w-[520px] flex-col items-center gap-2 text-center"
          style={{ left: 450, top: MOTIFS_Y, transform: "translate(-50%, -50%)", zIndex: 5 }}
        >
          <h3 className={`${handwrittenClass(lang)} text-base text-ink-main`}>{t("commonMotifs", lang)}</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {common.map((w) => (
              <button
                key={w}
                onClick={() => onSelectWord(w)}
                className={`${handwrittenClass(lang)} rounded-sm border border-[var(--highlight-gold-soft)] bg-paper-cream-light px-2 py-0.5 text-base font-medium text-ink-main hover:bg-paper-aged`}
              >
                {formatNetworkWord(w, lang)}
              </button>
            ))}
          </div>
        </div>
      )}

      {note && (
        <div
          className="absolute w-[480px] text-center"
          style={{ left: 450, top: NOTE_Y, transform: "translate(-50%, -50%)", zIndex: 5 }}
        >
          <h3 className={`${handwrittenClass(lang)} mb-1 text-base text-ink-main`}>{t("relationshipNote", lang)}</h3>
          <p className="text-sm leading-6 text-ink-soft">{note}</p>
        </div>
      )}
    </>
  );
}

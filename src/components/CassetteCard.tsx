"use client";

import Link from "next/link";
import type { Song } from "@/types/song";
import { useLanguage, handwrittenClass } from "@/lib/language-context";
import { hashRange } from "@/lib/random";

interface CassetteCardProps {
  song: Song;
}

/** A small deterministic jitter so each cassette's outline, reel teeth,
 * and stains look hand-drawn and slightly worn rather than a single
 * crisp vector repeated 28 times. Stable per song so it doesn't jump
 * around between renders. */
function jitter(seed: string, min: number, max: number) {
  return hashRange(seed, min, max);
}

export default function CassetteCard({ song }: CassetteCardProps) {
  const { lang } = useLanguage();
  const reelColor = song.color.main;
  const seed = song.id;

  // Body outline corners nudged a pixel or two each, so the rectangle
  // isn't perfectly true -- like a tape case traced slightly off-ruler.
  const corners = {
    tl: { x: 4 + jitter(seed + "tl-x", -1.5, 1.5), y: 4 + jitter(seed + "tl-y", -1.5, 1.5) },
    tr: { x: 316 + jitter(seed + "tr-x", -1.5, 1.5), y: 4 + jitter(seed + "tr-y", -1.5, 1.5) },
    br: { x: 316 + jitter(seed + "br-x", -1.5, 1.5), y: 196 + jitter(seed + "br-y", -1.5, 1.5) },
    bl: { x: 4 + jitter(seed + "bl-x", -1.5, 1.5), y: 196 + jitter(seed + "bl-y", -1.5, 1.5) },
  };
  const bodyPath = `M ${corners.tl.x} ${corners.tl.y} L ${corners.tr.x} ${corners.tr.y} L ${corners.br.x} ${corners.br.y} L ${corners.bl.x} ${corners.bl.y} Z`;

  const stainX = jitter(seed + "stain-x", 40, 260);
  const stainY = jitter(seed + "stain-y", 30, 150);
  const stainR = jitter(seed + "stain-r", 28, 46);
  const labelTilt = jitter(seed + "label-tilt", -1.6, 1.6);
  const reelTilt1 = jitter(seed + "reel1", -3, 3);
  const reelTilt2 = jitter(seed + "reel2", -3, 3);

  return (
    <Link
      href={`/songs/${song.album}/${song.id}`}
      className="group flex flex-col items-center gap-3 transition-transform duration-200 hover:-translate-y-1"
    >
      <svg
        width="100%"
        viewBox="0 0 320 200"
        className="w-full max-w-[280px] drop-shadow-[2px_4px_6px_rgba(40,30,15,0.22)]"
      >
        {/* aged paper body, slightly yellowed and worn at the edges */}
        <path d={bodyPath} fill="#e4d8bc" stroke="var(--ink-soft)" strokeWidth="2.6" opacity={0.97} />

        {/* faded coffee-ring / handling stain, more visible than a clean
            tint -- this is meant to read as actual wear on the case */}
        <circle cx={stainX} cy={stainY} r={stainR} fill="none" stroke="#8c6a4f" strokeOpacity="0.22" strokeWidth="3.5" />
        <circle cx={stainX} cy={stainY} r={stainR * 0.62} fill="#8c6a4f" opacity="0.09" />
        <circle cx={stainX + stainR * 0.3} cy={stainY - stainR * 0.2} r={stainR * 0.3} fill="none" stroke="#8c6a4f" strokeOpacity="0.14" strokeWidth="2" />

        {/* a second, smaller water-ring stain elsewhere on the case */}
        <circle
          cx={320 - stainX * 0.7}
          cy={140 + jitter(seed + "stain2-y", -20, 30)}
          r={jitter(seed + "stain2-r", 14, 24)}
          fill="none"
          stroke="#78826e"
          strokeOpacity="0.16"
          strokeWidth="2.5"
        />

        {/* worn/scuffed corner, low contrast scrape marks */}
        <g opacity="0.18" stroke="var(--ink-soft)" strokeWidth="1.4" strokeLinecap="round">
          <line x1={14} y1={188} x2={26} y2={178} />
          <line x1={18} y1={192} x2={32} y2={184} />
        </g>

        {/* worn sticker label up top, slightly tilted, holding the title */}
        <g transform={`rotate(${labelTilt} 160 44)`}>
          <rect
            x="20"
            y="20"
            width="280"
            height="48"
            rx="2"
            fill="#f1e8d4"
            stroke="var(--ink-soft)"
            strokeOpacity="0.7"
            strokeWidth="1.6"
          />
          <line x1="34" y1="44" x2="146" y2="44" stroke="var(--ink-soft)" strokeOpacity="0.55" strokeWidth="1.6" />
        </g>

        {/* tape window, muted/desaturated fill instead of a clean tint */}
        <rect
          x="22"
          y="86"
          width="276"
          height="80"
          rx="4"
          fill={`${reelColor}18`}
          stroke="var(--ink-soft)"
          strokeOpacity="0.75"
          strokeWidth="2.2"
        />

        <g
          className="origin-center transition-transform duration-700 group-hover:rotate-[24deg]"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          transform={`rotate(${reelTilt1} 98 126)`}
        >
          <circle cx="98" cy="126" r="34" fill={`${reelColor}28`} stroke="var(--ink-soft)" strokeOpacity="0.8" strokeWidth="2.2" />
          <circle cx="98" cy="126" r="13" fill="#f1e8d4" stroke="var(--ink-soft)" strokeOpacity="0.8" strokeWidth="2.2" />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const wobble = jitter(seed + "tooth1" + deg, -2, 2);
            return (
              <line
                key={deg}
                x1={98 + 13 * Math.cos(((deg + wobble) * Math.PI) / 180)}
                y1={126 + 13 * Math.sin(((deg + wobble) * Math.PI) / 180)}
                x2={98 + 6 * Math.cos(((deg + wobble) * Math.PI) / 180)}
                y2={126 + 6 * Math.sin(((deg + wobble) * Math.PI) / 180)}
                stroke="var(--ink-soft)"
                strokeOpacity="0.75"
                strokeWidth="1.7"
              />
            );
          })}
        </g>

        <path d="M 132 126 L 188 126" stroke="var(--ink-soft)" strokeOpacity="0.7" strokeWidth="1.7" />
        <path d="M 150 116 L 170 126 L 150 136 Z" fill="#f1e8d4" stroke="var(--ink-soft)" strokeOpacity="0.7" strokeWidth="1.3" />

        <g
          className="origin-center transition-transform duration-700 group-hover:rotate-[24deg]"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          transform={`rotate(${reelTilt2} 222 126)`}
        >
          <circle cx="222" cy="126" r="34" fill={`${reelColor}28`} stroke="var(--ink-soft)" strokeOpacity="0.8" strokeWidth="2.2" />
          <circle cx="222" cy="126" r="13" fill="#f1e8d4" stroke="var(--ink-soft)" strokeOpacity="0.8" strokeWidth="2.2" />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const wobble = jitter(seed + "tooth2" + deg, -2, 2);
            return (
              <line
                key={deg}
                x1={222 + 13 * Math.cos(((deg + wobble) * Math.PI) / 180)}
                y1={126 + 13 * Math.sin(((deg + wobble) * Math.PI) / 180)}
                x2={222 + 6 * Math.cos(((deg + wobble) * Math.PI) / 180)}
                y2={126 + 6 * Math.sin(((deg + wobble) * Math.PI) / 180)}
                stroke="var(--ink-soft)"
                strokeOpacity="0.75"
                strokeWidth="1.7"
              />
            );
          })}
        </g>

        <circle cx="38" cy="178" r="6" fill="#f1e8d4" stroke="var(--ink-soft)" strokeOpacity="0.7" strokeWidth="1.8" />
        <circle cx="282" cy="178" r="6" fill="#f1e8d4" stroke="var(--ink-soft)" strokeOpacity="0.7" strokeWidth="1.8" />
        <line x1="60" y1="178" x2="80" y2="178" stroke="var(--ink-soft)" strokeOpacity="0.55" strokeWidth="1.3" />
        <line x1="100" y1="178" x2="115" y2="178" stroke="var(--ink-soft)" strokeOpacity="0.55" strokeWidth="1.3" />
        <line x1="205" y1="178" x2="220" y2="178" stroke="var(--ink-soft)" strokeOpacity="0.55" strokeWidth="1.3" />
        <line x1="240" y1="178" x2="260" y2="178" stroke="var(--ink-soft)" strokeOpacity="0.55" strokeWidth="1.3" />

        {/* second faint ring stain crossing the lower edge of the case */}
        <ellipse
          cx={320 - stainX}
          cy={186}
          rx={36}
          ry={10}
          fill="none"
          stroke="#78826e"
          strokeOpacity="0.16"
          strokeWidth="3"
        />
      </svg>

      <span className="text-center text-lg leading-tight text-ink-main group-hover:underline">
        <span className="handwritten">Track {String(song.trackNo).padStart(2, "0")}.</span>{" "}
        <span className={handwrittenClass(lang)}>{song.title[lang]}</span>
      </span>
    </Link>
  );
}

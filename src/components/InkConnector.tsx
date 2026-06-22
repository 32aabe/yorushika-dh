"use client";

import { hashRange } from "@/lib/random";

interface InkConnectorProps {
  /** Raw pixel coordinates on the scene's fixed-size canvas -- the
   * same coordinate space every other absolutely-positioned node in
   * the scene uses. The canvas itself is panned/zoomed as a whole by
   * the surrounding SceneViewport, so this component never needs to
   * know about that transform. */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  seed: string;
  active?: boolean;
}

/** A single plain hand-inked-feeling curve between two fixed points on
 * a scene's canvas -- the notebook-style replacement for the old
 * pannable network's WordLines, just drawn in absolute canvas pixels
 * rather than a 0-100 percentage space, so it lines up exactly with
 * sibling nodes positioned the same way. There are only ever a
 * handful of these on screen at once (one focus, a few connections),
 * so each line can afford a slightly more deliberate, less uniform
 * curve than a dense graph would allow. */
export default function InkConnector({ x1, y1, x2, y2, seed, active = true }: InkConnectorProps) {
  const midX = (x1 + x2) / 2 + hashRange(seed + "mx", -16, 16);
  const midY = (y1 + y2) / 2 + hashRange(seed + "my", -16, 16);

  return (
    <svg className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-visible" style={{ zIndex: 1 }}>
      <path
        d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
        fill="none"
        stroke="var(--ink-soft)"
        strokeWidth={1.4}
        strokeLinecap="round"
        opacity={active ? 0.5 : 0.18}
        style={{ transition: "opacity 0.4s ease" }}
      />
    </svg>
  );
}

"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode, type MouseEvent } from "react";

interface ViewState {
  x: number;
  y: number;
  scale: number;
}

interface SceneViewportProps {
  /** Fixed virtual canvas size, in the same units used to position
   * children absolutely inside it (e.g. 900x600). This is NOT the
   * screen size -- the viewport pans/zooms a window onto this canvas,
   * the way the old full-network map did, just much smaller now since
   * each scene only ever holds one focus and a handful of satellites. */
  canvasWidth: number;
  canvasHeight: number;
  /** Bounding box (in canvas units) that the initial view should fit
   * snugly around, with fitPadding added on each side. This is what
   * guarantees the focused node and its motifs are fully visible on
   * load instead of drifting outside the frame -- it's computed from
   * the actual content of each scene, not just the canvas midpoint. */
  contentBounds: { minX: number; minY: number; maxX: number; maxY: number };
  fitPadding?: number;
  /** Changing this remounts the fit-to-content effect, e.g. when the
   * focused song/word changes and the scene swaps out for a new one
   * with different content bounds. */
  resetKey: string;
  children: ReactNode;
}

const MIN_SCALE = 0.4;
const MAX_SCALE = 2.2;

/** Reusable zoom/pan viewport for the Connections page's notebook
 * scenes. Each scene (song-focus, word-focus, compare) renders its
 * handful of nodes at fixed pixel positions on a small virtual canvas;
 * this component is just the window onto that canvas -- drag to pan,
 * wheel/buttons to zoom, and a reset button that snaps back to a view
 * fitted around the scene's actual content. The notebook-style
 * *content* still only ever shows a few curated nodes (that part
 * hasn't changed) -- what's back is the ability to move around and
 * inspect them without anything clipping off-screen. */
export default function SceneViewport({
  canvasWidth,
  canvasHeight,
  contentBounds,
  fitPadding = 60,
  resetKey,
  children,
}: SceneViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy initial state: compute a best-guess fit right away using
  // fallback viewport dimensions (the container hasn't been measured
  // yet on the very first render), so the first paint already looks
  // roughly correct instead of briefly showing the untransformed
  // top-left corner of the canvas. The effect below refines this once
  // the container's real size is known.
  const computeFit = useCallback(
    (viewportW: number, viewportH: number) => {
      const boundsW = Math.max(1, contentBounds.maxX - contentBounds.minX + fitPadding * 2);
      const boundsH = Math.max(1, contentBounds.maxY - contentBounds.minY + fitPadding * 2);
      const fitScale = Math.min(viewportW / boundsW, viewportH / boundsH);
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, fitScale));
      const boundsCenterX = (contentBounds.minX + contentBounds.maxX) / 2;
      const boundsCenterY = (contentBounds.minY + contentBounds.maxY) / 2;
      return {
        scale,
        x: viewportW / 2 - boundsCenterX * scale,
        y: viewportH / 2 - boundsCenterY * scale,
      };
    },
    [contentBounds, fitPadding],
  );

  const [view, setView] = useState<ViewState>(() => computeFit(900, 560));
  const dragState = useRef<{ dragging: boolean; startX: number; startY: number; viewX: number; viewY: number }>({
    dragging: false,
    startX: 0,
    startY: 0,
    viewX: 0,
    viewY: 0,
  });

  // Measures the container's actual rendered size and applies
  // computeFit against it -- this is what re-centers the view whenever
  // resetKey changes (a new scene with different content swapped in),
  // or when the reset button is pressed.
  const fitToContent = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    const viewportW = rect?.width || 900;
    const viewportH = rect?.height || 560;
    setView(computeFit(viewportW, viewportH));
  }, [computeFit]);

  // Fit the view around contentBounds whenever resetKey changes (a new
  // scene with different content swapped in). Deferred to the next
  // frame because the container can report a zero-size rect on the
  // very first paint, before layout has settled -- without the defer,
  // the initial view would fall back to the placeholder viewport size
  // in fitToContent rather than the container's real measured size.
  useEffect(() => {
    const raf = requestAnimationFrame(fitToContent);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  function zoomToward(screenX: number, screenY: number, nextScaleFromCurrent: (current: number) => number) {
    setView((v) => {
      const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScaleFromCurrent(v.scale)));
      const canvasX = (screenX - v.x) / v.scale;
      const canvasY = (screenY - v.y) / v.scale;
      return {
        scale: clamped,
        x: screenX - canvasX * clamped,
        y: screenY - canvasY * clamped,
      };
    });
  }

  function handleWheel(e: globalThis.WheelEvent) {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    const rect = containerRef.current?.getBoundingClientRect();
    const screenX = rect ? e.clientX - rect.left : e.clientX;
    const screenY = rect ? e.clientY - rect.top : e.clientY;
    zoomToward(screenX, screenY, (current) => current + delta);
  }

  function handleMouseDown(e: MouseEvent) {
    dragState.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      viewX: view.x,
      viewY: view.y,
    };
  }

  function handleMouseMove(e: MouseEvent) {
    if (!dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setView((v) => ({ ...v, x: dragState.current.viewX + dx, y: dragState.current.viewY + dy }));
  }

  function handleMouseUp() {
    dragState.current.dragging = false;
  }

  const zoomIn = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : 450;
    const cy = rect ? rect.height / 2 : 280;
    zoomToward(cx, cy, (current) => current + 0.2);
  }, []);
  const zoomOut = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : 450;
    const cy = rect ? rect.height / 2 : 280;
    zoomToward(cx, cy, (current) => current - 0.2);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const listener = (e: globalThis.WheelEvent) => handleWheel(e);
    el.addEventListener("wheel", listener, { passive: false });
    return () => el.removeEventListener("wheel", listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        ref={containerRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transformOrigin: "0 0",
          }}
        >
          {children}
        </div>
      </div>

      <div className="absolute bottom-5 right-5 flex flex-col gap-2 text-ink-soft">
        <button
          onClick={zoomIn}
          aria-label="Zoom in"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--paper-edge-shadow)] bg-paper-cream-light/90 text-lg hover:bg-paper-cream"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          aria-label="Zoom out"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--paper-edge-shadow)] bg-paper-cream-light/90 text-lg hover:bg-paper-cream"
        >
          –
        </button>
        <button
          onClick={fitToContent}
          aria-label="Reset view"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--paper-edge-shadow)] bg-paper-cream-light/90 text-xs hover:bg-paper-cream"
        >
          ⟲
        </button>
      </div>
    </div>
  );
}

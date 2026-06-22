"use client";

import { useEffect, useState } from "react";

/** True when the viewport is narrow enough that the full force-directed
 * song-word network would be unreadably dense (small screens can't pan/
 * zoom as comfortably as a mouse-driven desktop view). Used to swap the
 * Connections page over to the simplified word-first explorer. */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}

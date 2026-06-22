"use client";

import ConnectionsExplorer from "./ConnectionsExplorer";
import WordExplorer from "./WordExplorer";
import { useIsMobile } from "@/lib/use-is-mobile";

export default function ConnectionsPage() {
  const isMobile = useIsMobile();
  return isMobile ? <WordExplorer /> : <ConnectionsExplorer />;
}

import { notFound } from "next/navigation";
import { songs, getSongById } from "@/lib/data";
import SongDetail from "./SongDetail";

export const dynamicParams = false;

export function generateStaticParams() {
  return songs.map((s) => ({ album: s.album, songId: s.id }));
}

export default async function SongPage({
  params,
}: {
  params: Promise<{ album: string; songId: string }>;
}) {
  const { songId } = await params;
  const song = getSongById(songId);
  if (!song) notFound();

  return <SongDetail song={song} />;
}

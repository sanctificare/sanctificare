import { Music } from "lucide-react";
import AudioLibraryPage from "@/components/AudioLibraryPage";
import { SACRED_MUSIC_COLLECTIONS } from "@/data/musica-sacra";

const PUBLIC_PLAYABLE_TRACK_IDS = [
  "miserere-no-1",
  "poli-sicut-cervus",
];

export default function MusicaSacra() {
  return (
    <AudioLibraryPage
      eyebrow="Música Sacra"
      title="Música Sacra"
      subtitle="Obras-primas da tradição cristã para meditação, reflexão e contemplação."
      icon={Music}
      collections={SACRED_MUSIC_COLLECTIONS}
      authPrompt="Entre para escutar a música sacra."
      guestPlayableTrackIds={PUBLIC_PLAYABLE_TRACK_IDS}
      guestNotice="Duas faixas estão disponíveis para escuta sem login."
    />
  );
}

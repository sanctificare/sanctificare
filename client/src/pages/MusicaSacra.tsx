import { Music } from "lucide-react";
import AudioLibraryPage from "@/components/AudioLibraryPage";
import { SACRED_MUSIC_COLLECTIONS } from "@/data/musica-sacra";

export default function MusicaSacra() {
  return (
    <AudioLibraryPage
      eyebrow="Música Sacra"
      title="Música Sacra"
      subtitle="Obras-primas da tradição cristã para meditação, reflexão e contemplação."
      icon={Music}
      collections={SACRED_MUSIC_COLLECTIONS}
      authPrompt="Entre para escutar a música sacra."
    />
  );
}

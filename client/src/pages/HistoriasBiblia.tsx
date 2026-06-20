import { BookOpen } from "lucide-react";
import AudioLibraryPage from "@/components/AudioLibraryPage";
import { getAudioCollectionsByKind } from "@/data/audio-meditations";

export default function HistoriasBiblia() {
  const collections = getAudioCollectionsByKind("bible-story");

  return (
    <AudioLibraryPage
      eyebrow="Áudio Guiado"
      title="Histórias da Bíblia"
      subtitle="Escute a Palavra narrada como quem ouve uma história contada ao coração."
      icon={BookOpen}
      collections={collections}
      authPrompt="Entre para escutar as passagens bíblicas narradas."
    />
  );
}

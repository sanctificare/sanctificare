import { Headphones } from "lucide-react";
import AudioLibraryPage from "@/components/AudioLibraryPage";
import { getAudioCollectionsByKind } from "@/data/audio-meditations";

export default function Meditacoes() {
  const collections = getAudioCollectionsByKind("meditation");

  return (
    <AudioLibraryPage
      eyebrow="Áudio Guiado"
      title="Meditações Guiadas"
      subtitle="Escute, recolha-se e permaneça em oração, onde quer que você esteja."
      icon={Headphones}
      collections={collections}
      authPrompt="Entre para rezar com as meditações guiadas."
    />
  );
}

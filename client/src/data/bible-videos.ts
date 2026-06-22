// Catálogo de Vídeos Bíblicos gravados/gerados com IA no Sanctificare.
// Contém apenas o vídeo configurado e hospedado no Bunny Stream.

export interface BibleVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: "short" | "long";
  premium: boolean;
  bunnyVideoId: string; // O ID do vídeo dentro da biblioteca do Bunny Stream
  thumbnail: string;
  narrator: string;
  category: string;
  fallbackUrl?: string; // Vídeo MP4 clássico de teste (caso não use o Bunny temporariamente)
}

export const BIBLE_VIDEOS: BibleVideo[] = [
  {
    id: "vid-quando-se-sente-perdido",
    title: "Quando você se sente perdido",
    description: "Uma meditação e reflexão profunda para momentos de incerteza e aflição, lembrando-nos da presença amorosa e acolhedora de Deus.",
    duration: "0:13",
    type: "short",
    premium: false,
    bunnyVideoId: "47cd38d2-0cf3-4fd1-b7fd-d8b4fdcc7150",
    thumbnail: "https://vz-b07d3b4c-295.b-cdn.net/47cd38d2-0cf3-4fd1-b7fd-d8b4fdcc7150/thumbnail.jpg",
    narrator: "Voz Sanctificare (IA)",
    category: "Contemplação",
    fallbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    id: "vid-jesus-caminha",
    title: "Jesus caminha à sua frente",
    description: "Uma meditação emocionante lembrando-nos de que Jesus caminha à nossa frente, guiando nossos passos e iluminando nossa jornada nos momentos de tribulação.",
    duration: "0:24",
    type: "short",
    premium: false,
    bunnyVideoId: "57544ccd-7ac5-4c07-9e61-15e018aff2fe",
    thumbnail: "https://vz-b07d3b4c-295.b-cdn.net/57544ccd-7ac5-4c07-9e61-15e018aff2fe/thumbnail.jpg",
    narrator: "Voz Sanctificare (IA)",
    category: "Fé e Coragem",
    fallbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  }
];

export function getBibleVideos(type?: "short" | "long" | "all"): BibleVideo[] {
  if (!type || type === "all") return BIBLE_VIDEOS;
  return BIBLE_VIDEOS.filter(v => v.type === type);
}

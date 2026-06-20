// Catálogo de conteúdo de áudio-guiado do Sanctificare.
//
// Reúne dois pilares:
//  1. Meditações guiadas em áudio (oração contemplativa, exame, descanso).
//  2. "Histórias da Bíblia" narradas em áudio.
//
// Cada faixa segue o padrão de status "planned" | "ready", igual ao usado em
// lectio-audio.ts: enquanto o arquivo não é publicado, a faixa fica como
// "planned" e a página mostra o caminho esperado. Assim que o .mp3 estiver na
// pasta pública correspondente, basta marcar como "ready" e o player aparece.

export type AudioTrackStatus = "planned" | "ready";

export type AudioCollectionKind = "meditation" | "bible-story" | "sacred-music";

export interface AudioMeditationTrack {
  id: string;
  title: string;
  description: string;
  /** Referência bíblica ou tema, exibido como subtítulo. */
  reference?: string;
  /** Duração estimada em segundos (usada apenas para exibição). */
  durationSec: number;
  narrator: string;
  status: AudioTrackStatus;
  audioUrl: string;
  premium?: boolean;
}

export interface AudioCollection {
  id: string;
  kind: AudioCollectionKind;
  title: string;
  subtitle: string;
  description: string;
  /** Emoji/ícone curto exibido no cabeçalho da coleção. */
  icon: string;
  tracks: AudioMeditationTrack[];
}

const MEDITATION_BASE_PATH = "/audio/meditacoes";
const BIBLE_STORY_BASE_PATH = "/audio/biblia";

const DEFAULT_NARRATOR = "Voz Sanctificare";

function meditationUrl(fileName: string): string {
  return `${MEDITATION_BASE_PATH}/${fileName}`;
}

function bibleStoryUrl(fileName: string): string {
  return `${BIBLE_STORY_BASE_PATH}/${fileName}`;
}

export const AUDIO_COLLECTIONS: AudioCollection[] = [
  {
    id: "meditacoes-contemplativas",
    kind: "meditation",
    title: "Meditações Guiadas",
    subtitle: "Oração contemplativa em áudio",
    description:
      "Conduções de oração com pausas de silêncio, pensadas para ajudar você a rezar com calma em qualquer momento do dia.",
    icon: "🕊️",
    tracks: [
      {
        id: "med-presenca-de-deus",
        title: "A Presença de Deus",
        description:
          "Uma condução serena para aquietar o coração e reconhecer que Deus está aqui, agora, junto de você.",
        reference: "Salmo 46,10",
        durationSec: 600,
        narrator: DEFAULT_NARRATOR,
        status: "planned",
        audioUrl: meditationUrl("presenca-de-deus.mp3"),
      },
      {
        id: "med-exame-de-consciencia",
        title: "Exame de Consciência",
        description:
          "Revisite o seu dia à luz de Deus: gratidão, reconhecimento das faltas e propósito de conversão para amanhã.",
        reference: "Tradição Inaciana",
        durationSec: 720,
        narrator: DEFAULT_NARRATOR,
        status: "planned",
        audioUrl: meditationUrl("exame-de-consciencia.mp3"),
      },
      {
        id: "med-entregar-as-ansiedades",
        title: "Entregar as Ansiedades",
        description:
          "Uma oração guiada para depositar preocupações e medos nas mãos do Pai e repousar na sua paz.",
        reference: "1 Pedro 5,7",
        durationSec: 540,
        narrator: DEFAULT_NARRATOR,
        status: "planned",
        audioUrl: meditationUrl("entregar-as-ansiedades.mp3"),
      },
      {
        id: "med-oracao-da-noite",
        title: "Oração da Noite",
        description:
          "Encerre o dia em gratidão e confiança, dispondo o corpo e a alma para um descanso sereno.",
        reference: "Salmo 4,9",
        durationSec: 660,
        narrator: DEFAULT_NARRATOR,
        status: "planned",
        audioUrl: meditationUrl("oracao-da-noite.mp3"),
        premium: true,
      },
    ],
  },
  {
    id: "historias-da-biblia",
    kind: "bible-story",
    title: "Histórias da Bíblia",
    subtitle: "Narrações para escutar e contemplar",
    description:
      "Passagens das Escrituras narradas com cuidado, para escutar a Palavra como quem ouve uma história contada ao coração.",
    icon: "📖",
    tracks: [
      {
        id: "bib-criacao",
        title: "A Criação do Mundo",
        description:
          "No princípio, Deus criou os céus e a terra. A narração do primeiro relato da Criação.",
        reference: "Gênesis 1—2",
        durationSec: 480,
        narrator: DEFAULT_NARRATOR,
        status: "planned",
        audioUrl: bibleStoryUrl("criacao.mp3"),
      },
      {
        id: "bib-bom-pastor",
        title: "O Bom Pastor",
        description:
          "Jesus se revela como o Bom Pastor que dá a vida pelas ovelhas e as chama pelo nome.",
        reference: "João 10,1-18",
        durationSec: 360,
        narrator: DEFAULT_NARRATOR,
        status: "planned",
        audioUrl: bibleStoryUrl("bom-pastor.mp3"),
      },
      {
        id: "bib-filho-prodigo",
        title: "O Filho Pródigo",
        description:
          "A parábola do pai misericordioso que corre ao encontro do filho que retorna.",
        reference: "Lucas 15,11-32",
        durationSec: 420,
        narrator: DEFAULT_NARRATOR,
        status: "planned",
        audioUrl: bibleStoryUrl("filho-prodigo.mp3"),
      },
      {
        id: "bib-ressurreicao",
        title: "A Ressurreição de Jesus",
        description:
          "Ao amanhecer do primeiro dia da semana, o túmulo está vazio: Cristo ressuscitou.",
        reference: "João 20,1-18",
        durationSec: 450,
        narrator: DEFAULT_NARRATOR,
        status: "planned",
        audioUrl: bibleStoryUrl("ressurreicao.mp3"),
        premium: true,
      },
    ],
  },
];

export function getAudioCollection(id: string): AudioCollection | null {
  return AUDIO_COLLECTIONS.find((collection) => collection.id === id) ?? null;
}

export function getAudioCollectionsByKind(
  kind: AudioCollectionKind
): AudioCollection[] {
  return AUDIO_COLLECTIONS.filter((collection) => collection.kind === kind);
}

export function isAudioTrackReady(track: AudioMeditationTrack | undefined): boolean {
  return Boolean(track && track.status === "ready" && track.audioUrl);
}

export function formatTrackDuration(durationSec: number): string {
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  if (seconds === 0) return `${minutes} min`;
  return `${minutes} min ${seconds.toString().padStart(2, "0")}s`;
}

export interface RosaryAudioTrack {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number; // em segundos
  mysteryNumber?: number;
  beadIndex?: number;
  type: "intro" | "credo" | "mystery" | "pai_nosso" | "ave_maria" | "gloria" | "fatima" | "salve" | "conclusion";
}

export type RosaryMysteryAudioSet = "dolo" | "glor" | "goz" | "lum";

export const MYSTERY_AUDIO_SET_BY_KEY = {
  sorrowful: "dolo",
  glorious: "glor",
  joyful: "goz",
  luminous: "lum",
} as const;

/**
 * Áudios disponíveis para a Ave Maria. Estes 10 arquivos foram carregados
 * em /audio/rosary/ e são distribuídos aleatoriamente por todos os mistérios.
 */
export const AVE_MARIA_AUDIO_FILES: readonly string[] = [
  "/audio/rosary/ave-maria1.mp3",
  "/audio/rosary/ave-maria2.mp3",
  "/audio/rosary/ave-maria3.mp3",
  "/audio/rosary/ave-maria4.mp3",
  "/audio/rosary/ave-maria5.mp3",
  "/audio/rosary/ave-maria6.mp3",
  "/audio/rosary/ave-maria7.mp3",
  "/audio/rosary/ave-maria8.mp3",
  "/audio/rosary/ave-maria9.mp3",
  "/audio/rosary/ave-maria10.mp3",
];

export const PAI_NOSSO_AUDIO_FILE = "/audio/rosary/Pai-Nosso.mp3";

const AVE_MARIA_AVG_DURATION = 18;
const PAI_NOSSO_AVG_DURATION = 25;
const MYSTERY_AVG_DURATION = 20;
const SINAL_CRUZ_AVG_DURATION = 45;
const CREDO_AVG_DURATION = 8;
const GLORIA_AVG_DURATION = 14;
const FATIMA_AVG_DURATION = 16;
const SALVE_RAINHA_AVG_DURATION = 55;

const SINAL_CRUZ_AUDIO_FILE = "/audio/rosary/intro-terco.mp3";
const CREDO_AUDIO_FILE = "/audio/rosary/sinal da cruz.mp3";
const GLORIA_AUDIO_FILE = "/audio/rosary/gloria.mp3";
const FATIMA_AUDIO_FILE = "/audio/rosary/jaculatoria.mp3";
const SALVE_RAINHA_AUDIO_FILE = "/audio/rosary/salve rainha.mp3";

function getMysteryAudioFiles(mysterySet: RosaryMysteryAudioSet): string[] {
  return Array.from({ length: 5 }, (_, index) => `/audio/rosary/${mysterySet}${index + 1}.mp3`);
}

/**
 * Embaralha um array usando Fisher-Yates. Não muta o array de entrada.
 */
function shuffle<T>(items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Constrói a sequência completa de áudio do rosário guiado.
 *
 * Estrutura:
 *  - intro
 *  - Pai Nosso inicial
 *  - 3 Ave Marias iniciais (áudios sorteados a partir dos 10 disponíveis)
 *  - Para cada um dos 5 mistérios:
 *      - Pai Nosso do mistério
 *      - 10 Ave Marias, em ordem aleatória usando os 10 áudios disponíveis
 *
 * As 10 Ave Marias são embaralhadas independentemente em cada mistério,
 * garantindo que todos os 10 áudios sejam ouvidos em cada mistério, mas em
 * uma ordem diferente a cada nova sessão (random por carregamento do módulo).
 */
function buildRosaryAudioTracks(mysterySet: RosaryMysteryAudioSet): RosaryAudioTrack[] {
  const tracks: RosaryAudioTrack[] = [];
  const mysteryAudioFiles = getMysteryAudioFiles(mysterySet);

  tracks.push({
    id: "intro",
    title: "Sinal da Cruz",
    description: "Em nome do Pai, do Filho e do Espírito Santo",
    audioUrl: SINAL_CRUZ_AUDIO_FILE,
    duration: SINAL_CRUZ_AVG_DURATION,
    type: "intro",
  });

  tracks.push({
    id: "credo",
    title: "Credo",
    description: "Creio em Deus Pai",
    audioUrl: CREDO_AUDIO_FILE,
    duration: CREDO_AVG_DURATION,
    type: "credo",
  });

  tracks.push({
    id: "pai-nosso-initial",
    title: "Pai Nosso",
    description: "Pai Nosso inicial do Rosário",
    audioUrl: PAI_NOSSO_AUDIO_FILE,
    duration: PAI_NOSSO_AVG_DURATION,
    type: "pai_nosso",
  });

  const initialAveMariaOrder = shuffle(AVE_MARIA_AUDIO_FILES).slice(0, 3);
  initialAveMariaOrder.forEach((audioUrl, idx) => {
    tracks.push({
      id: `ave-maria-initial-${idx + 1}`,
      title: "Ave Maria",
      description: `Ave Maria inicial — ${idx + 1}ª de 3`,
      audioUrl,
      duration: AVE_MARIA_AVG_DURATION,
      beadIndex: idx + 1,
      type: "ave_maria",
    });
  });

  for (let mysteryIndex = 0; mysteryIndex < 5; mysteryIndex++) {
    const mysteryNumber = mysteryIndex + 1;

    tracks.push({
      id: `mystery-${mysteryNumber}`,
      title: "Mistério",
      description: `${mysteryNumber}º Mistério`,
      audioUrl: mysteryAudioFiles[mysteryIndex],
      duration: MYSTERY_AVG_DURATION,
      mysteryNumber,
      type: "mystery",
    });

    tracks.push({
      id: `pai-nosso-${mysteryNumber}`,
      title: "Pai Nosso",
      description: `${mysteryNumber}º Mistério — Pai Nosso`,
      audioUrl: PAI_NOSSO_AUDIO_FILE,
      duration: PAI_NOSSO_AVG_DURATION,
      mysteryNumber,
      type: "pai_nosso",
    });

    const aveMariaOrder = shuffle(AVE_MARIA_AUDIO_FILES);
    aveMariaOrder.forEach((audioUrl, beadIdx) => {
      tracks.push({
        id: `ave-maria-${mysteryNumber}-${beadIdx + 1}`,
        title: "Ave Maria",
        description: `${mysteryNumber}º Mistério — ${beadIdx + 1}ª de 10`,
        audioUrl,
        duration: AVE_MARIA_AVG_DURATION,
        mysteryNumber,
        beadIndex: beadIdx + 1,
        type: "ave_maria",
      });
    });

    tracks.push({
      id: `gloria-${mysteryNumber}`,
      title: "Glória ao Pai",
      description: `${mysteryNumber}º Mistério — oração do Glória`,
      audioUrl: GLORIA_AUDIO_FILE,
      duration: GLORIA_AVG_DURATION,
      mysteryNumber,
      type: "gloria",
    });

    tracks.push({
      id: `fatima-${mysteryNumber}`,
      title: "Oração de Fátima",
      description: `${mysteryNumber}º Mistério — Ó meu Jesus`,
      audioUrl: FATIMA_AUDIO_FILE,
      duration: FATIMA_AVG_DURATION,
      mysteryNumber,
      type: "fatima",
    });
  }

  tracks.push({
    id: "salve-rainha",
    title: "Salve Rainha",
    description: "Conclusão do Santo Rosário",
    audioUrl: SALVE_RAINHA_AUDIO_FILE,
    duration: SALVE_RAINHA_AVG_DURATION,
    type: "salve",
  });

  return tracks;
}

export function getRosaryAudioTracks(mysterySet: RosaryMysteryAudioSet): RosaryAudioTrack[] {
  return buildRosaryAudioTracks(mysterySet);
}

export const rosaryAudioTracks: RosaryAudioTrack[] = getRosaryAudioTracks("goz");

export function formatTime(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getTotalDuration(): number {
  return rosaryAudioTracks.reduce((sum, track) => sum + track.duration, 0);
}

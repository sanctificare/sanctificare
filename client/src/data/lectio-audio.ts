import {
  LECTIO_PASSAGES,
  LECTIO_STEPS,
  type LectioPassage,
  type LectioStepKey,
} from "@/data/lectio";

export type LectioAudioStatus = "planned" | "ready";

export interface LectioAudioTrack {
  id: string;
  title: string;
  description: string;
  status: LectioAudioStatus;
  audioUrl?: string;
  durationSec?: number;
  narrator?: string;
}

export interface LectioAudioBundle {
  passageId: string;
  fullSession: LectioAudioTrack;
  byStep: Partial<Record<LectioStepKey, LectioAudioTrack>>;
}

const LECTIO_AUDIO_BASE_PATH = "/audio/lectio";

function buildLectioAudioUrl(fileName: string): string {
  return `${LECTIO_AUDIO_BASE_PATH}/${fileName}`;
}

const PLACEHOLDER_NARRATOR = "Voz Sanctificare";

function buildPlannedStepTrack(
  passage: LectioPassage,
  stepKey: LectioStepKey,
  stepLabel: string
): LectioAudioTrack {
  return {
    id: `${passage.id}-${stepKey}`,
    title: `${stepLabel}: ${passage.title}`,
    description: `${stepLabel} guiada para ${passage.reference}.`,
    status: "planned",
    audioUrl: buildLectioAudioUrl(`${passage.id}/${stepKey}.mp3`),
    narrator: PLACEHOLDER_NARRATOR,
  };
}

function buildPlannedBundle(passage: LectioPassage): LectioAudioBundle {
  const byStep: Partial<Record<LectioStepKey, LectioAudioTrack>> = {};
  LECTIO_STEPS.forEach((step) => {
    byStep[step.key] = buildPlannedStepTrack(passage, step.key, step.label);
  });

  return {
    passageId: passage.id,
    fullSession: {
      id: `${passage.id}-full`,
      title: `Sessão Completa: ${passage.title}`,
      description: `Lectio Divina completa de ${passage.reference}, com pausas guiadas.`,
      status: "planned",
      audioUrl: buildLectioAudioUrl(`${passage.id}/full-session.mp3`),
      narrator: PLACEHOLDER_NARRATOR,
    },
    byStep,
  };
}

export const LECTIO_AUDIO_LIBRARY: LectioAudioBundle[] = LECTIO_PASSAGES.map(
  buildPlannedBundle
);

export function getLectioAudioBundle(passageId: string): LectioAudioBundle | null {
  return LECTIO_AUDIO_LIBRARY.find((item) => item.passageId === passageId) ?? null;
}

export function isLectioTrackReady(track: LectioAudioTrack | undefined): boolean {
  return Boolean(track && track.status === "ready" && track.audioUrl);
}

export interface GuidedLectioAudioTrack {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number; // em segundos
  stepKey: "intro" | "lectio" | "meditatio" | "oratio" | "contemplatio" | "actio" | "conclusion";
}

const LECTIO_AUDIO_BASE_URL = "https://pub-30538c8884ae4217b6ed97cea240a819.r2.dev/audios/Lectio";
const LECTIO_AUDIO_REFRESH_VERSION = "20260619";
const LECTIO_AUDIO_REFRESHED_FILES = new Set([
  "intro lectio.mp3",
  "lectio.mp3",
  "meditatio.mp3",
  "oratio.mp3",
  "contemplatio.mp3",
  "actio.mp3",
]);

function getLectioAudioUrl(fileName: string): string {
  const parts = fileName.split("/");
  const encodedParts = parts.map(p => encodeURIComponent(p));
  const audioPath = `${LECTIO_AUDIO_BASE_URL}/${encodedParts.join("/")}`;
  if (!LECTIO_AUDIO_REFRESHED_FILES.has(fileName)) {
    return audioPath;
  }

  return `${audioPath}?v=${LECTIO_AUDIO_REFRESH_VERSION}`;
}

const MONTHS_MAP: Record<number, { cap: string; low: string }> = {
  1: { cap: "Janeiro", low: "janeiro" },
  2: { cap: "Fevereiro", low: "fevereiro" },
  3: { cap: "Marco", low: "marco" },
  4: { cap: "Abril", low: "abril" },
  5: { cap: "Maio", low: "maio" },
  6: { cap: "Junho", low: "junho" },
  7: { cap: "Julho", low: "julho" },
  8: { cap: "Agosto", low: "agosto" },
  9: { cap: "Setembro", low: "setembro" },
  10: { cap: "Outubro", low: "outubro" },
  11: { cap: "Novembro", low: "novembro" },
  12: { cap: "Dezembro", low: "dezembro" },
};

export function getGuidedLectioAudioTracks(passageId: string, dateIso: string): GuidedLectioAudioTrack[] {
  const tracks: GuidedLectioAudioTrack[] = [];

  // 1. Intro
  tracks.push({
    id: "intro-lectio",
    title: "Introdução",
    description: "Preparação para a Lectio Divina",
    audioUrl: getLectioAudioUrl("intro lectio.mp3"),
    duration: 73,
    stepKey: "intro",
  });

  // 2. Sinal da Cruz
  tracks.push({
    id: "sinal-cruz",
    title: "Sinal da Cruz",
    description: "Abertura da oração",
    audioUrl: getLectioAudioUrl("sinal da cruz-lectio.mp3"),
    duration: 35,
    stepKey: "intro",
  });

  // 3. Lectio (Intro)
  tracks.push({
    id: "passo-lectio",
    title: "Lectio",
    description: "Passo da Leitura",
    audioUrl: getLectioAudioUrl("lectio.mp3"),
    duration: 34,
    stepKey: "lectio",
  });

  const isDailyGospel = passageId === "daily-gospel";

  if (isDailyGospel) {
    // For today's Gospel, play the daily recorded audio right after lectio
    // This replaces the generic lectio passage
    const [yearStr, monthStr, dayStr] = dateIso.split("-");
    const yearTwoDigits = (yearStr || "2026").slice(-2);
    const month = parseInt(monthStr || "06", 10);
    const day = parseInt(dayStr || "19", 10);
    const monthInfo = MONTHS_MAP[month] || MONTHS_MAP[6];

    const folder = `${monthInfo.cap}${yearTwoDigits}`;
    const gospelFileName = `lectio-${monthInfo.low}${day}-${yearTwoDigits}.mp3`;
    const gospelRelativePath = `${folder}/${gospelFileName}`;

    const isJune20 = dateIso.endsWith("-06-20");
    const duration = isJune20 ? 155 : 61;

    tracks.push({
      id: "leitura-evangelho-meditacao",
      title: "Leitura do Evangelho",
      description: "Leitura do Evangelho do Dia",
      audioUrl: getLectioAudioUrl(gospelRelativePath),
      duration,
      stepKey: "lectio",
    });

    tracks.push({
      id: "passo-meditatio",
      title: "Meditatio",
      description: "Passo da Meditação",
      audioUrl: getLectioAudioUrl("meditatio.mp3"),
      duration: 41,
      stepKey: "meditatio",
    });
  } else {
    // For curated passages, play reading and generic meditatio
    tracks.push({
      id: "leitura-passagem",
      title: "Leitura da Passagem",
      description: "Leitura da Palavra de hoje",
      audioUrl: getLectioAudioUrl(`passagens/${passageId}.mp3`),
      duration: 120,
      stepKey: "lectio",
    });

    tracks.push({
      id: "passo-meditatio",
      title: "Meditatio",
      description: "Passo da Meditação",
      audioUrl: getLectioAudioUrl("meditatio.mp3"),
      duration: 41,
      stepKey: "meditatio",
    });
  }

  // 6. Oratio
  tracks.push({
    id: "passo-oratio",
    title: "Oratio",
    description: "Passo da Oração",
    audioUrl: getLectioAudioUrl("oratio.mp3"),
    duration: 38,
    stepKey: "oratio",
  });

  // 7. Contemplatio
  tracks.push({
    id: "passo-contemplatio",
    title: "Contemplatio",
    description: "Passo da Contemplação",
    audioUrl: getLectioAudioUrl("contemplatio.mp3"),
    duration: 180,
    stepKey: "contemplatio",
  });

  // 8. Actio
  tracks.push({
    id: "passo-actio",
    title: "Actio",
    description: "Passo da Ação",
    audioUrl: getLectioAudioUrl("actio.mp3"),
    duration: 120,
    stepKey: "actio",
  });

  // 9. Pai Nosso (Conclusão)
  tracks.push({
    id: "pai-nosso",
    title: "Pai Nosso",
    description: "Encerramento da Lectio Divina",
    audioUrl: getLectioAudioUrl("pai-nosso-lectio.mp3"),
    duration: 60,
    stepKey: "conclusion",
  });

  return tracks;
}

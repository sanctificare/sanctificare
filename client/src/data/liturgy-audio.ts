export interface LiturgyDailyAudioTrack {
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  audioUrl: string;
}

const REMOTE_MEDIA_ORIGIN = "https://sanctificare.app";

const toRemoteLiturgyAudioUrl = (dateLabel: string): string =>
  `${REMOTE_MEDIA_ORIGIN}/audio/liturgia-diaria/${encodeURIComponent(dateLabel)}.mp3`;

const MANUAL_LITURGY_DAILY_AUDIO_TRACKS: LiturgyDailyAudioTrack[] = [
  {
    date: "2026-07-03",
    title: "Liturgia Diária - 03 de julho",
    description: "Narração humana da Liturgia Diária.",
    audioUrl: "https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/liturgia030726.mp3",
  },
  {
    date: "2026-07-04",
    title: "Liturgia Diária - 04 de julho",
    description: "Narração humana da Liturgia Diária.",
    audioUrl: "https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/liturgia040726.mp3",
  },
  {
    date: "2026-06-11",
    title: "Liturgia Diaria - 11 de junho",
    description: "Narracao humana da Liturgia Diaria.",
    audioUrl: toRemoteLiturgyAudioUrl("11 de junho"),
  },
];

export function getLiturgyAudioByDate(date: string | undefined) {
  if (!date) return null;
  return MANUAL_LITURGY_DAILY_AUDIO_TRACKS.find((track) => track.date === date) ?? null;
}

export interface LiturgyReadingsAudio {
  firstReading?: string;
  secondReading?: string;
  gospel?: string;
  singedPsalm?: string;
}

export function getLiturgyReadingsAudioByDate(dateIso: string | undefined): LiturgyReadingsAudio {
  if (!dateIso) return {};
  const [yearStr, monthStr, dayStr] = dateIso.split("-");
  if (yearStr === "2026") {
    const dayNum = parseInt(dayStr, 10);
    if (monthStr === "07") {
      // Temos áudios individuais na pasta de julho26 de 05 a 31 de julho
      if (dayNum >= 5 && dayNum <= 31) {
        const formattedDate = `${dayStr}${monthStr}26`; // ex: 050726

        const audio: LiturgyReadingsAudio = {
          firstReading: `https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/julho26/1leitura${formattedDate}.mp3`,
          gospel: `https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/julho26/evangelho${formattedDate}.mp3`
        };

        // Configuração para o Salmo Cantado (áudios disponíveis de 13 a 31 de julho)
        if (dayNum >= 13 && dayNum <= 31) {
          audio.singedPsalm = `/r2-storage/salmos-cantados/julho26/salmos${formattedDate}.mp3`;
        }

        // Apenas dias 5, 12, 19 e 26 têm segunda leitura no R2 (domingos)
        if (dayNum === 5 || dayNum === 12 || dayNum === 19 || dayNum === 26) {
          audio.secondReading = `https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/julho26/2leitura${formattedDate}.mp3`;
        }

        return audio;
      }
    } else if (monthStr === "08") {
      // Temos áudios individuais na pasta de agosto26 de 01 a 24 de agosto
      if (dayNum >= 1 && dayNum <= 24) {
        const formattedDate = `${dayStr}${monthStr}26`; // ex: 010826
        const psalmPrefix = dayNum === 24 ? "salmo" : "salmos";

        const audio: LiturgyReadingsAudio = {
          firstReading: `https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/agosto26/1leitura${formattedDate}.mp3`,
          gospel: `https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/agosto26/evangelho${formattedDate}.mp3`,
          singedPsalm: `/r2-storage/salmos-cantados/agosto26/${psalmPrefix}${formattedDate}.mp3`
        };

        // Domingos (02/08, 09/08, 16/08 e 23/08) têm segunda leitura
        if (dayNum === 2 || dayNum === 9 || dayNum === 16 || dayNum === 23) {
          audio.secondReading = `https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/agosto26/2leitura${formattedDate}.mp3`;
        }

        return audio;
      }
    }
  }
  return {};
}


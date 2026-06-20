export interface LiturgyDailyAudioTrack {
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  audioUrl: string;
}

const MANUAL_LITURGY_DAILY_AUDIO_TRACKS: LiturgyDailyAudioTrack[] = [
  {
    date: "2026-06-11",
    title: "Liturgia Diaria - 11 de junho",
    description: "Narracao humana da Liturgia Diaria.",
    audioUrl: "/audio/liturgia-diaria/11 de junho.mp3",
  },
];

const MONTHS_PT = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function buildTrackByDate(date: string): LiturgyDailyAudioTrack | null {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const dateLabel = `${day} de ${MONTHS_PT[month - 1]}`;
  return {
    date,
    title: `Liturgia Diaria - ${dateLabel}`,
    description: "Narracao humana da Liturgia Diaria.",
    audioUrl: `/audio/liturgia-diaria/${dateLabel}.mp3`,
  };
}

export function getLiturgyAudioByDate(date: string | undefined) {
  if (!date) return null;
  return MANUAL_LITURGY_DAILY_AUDIO_TRACKS.find((track) => track.date === date)
    ?? buildTrackByDate(date);
}

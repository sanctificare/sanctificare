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

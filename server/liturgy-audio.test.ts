import { describe, expect, it } from "vitest";
import { getLiturgyReadingsAudioByDate } from "../client/src/data/liturgy-audio";

describe("liturgy-audio", () => {
  it("deve retornar os áudios da liturgia diária para o período de 27/07/26 a 31/07/26", () => {
    const dates = [
      "2026-07-27",
      "2026-07-28",
      "2026-07-29",
      "2026-07-30",
      "2026-07-31",
    ];

    for (const dateIso of dates) {
      const [year, month, day] = dateIso.split("-");
      const formattedDate = `${day}${month}26`;
      const audios = getLiturgyReadingsAudioByDate(dateIso);

      expect(audios.firstReading).toBe(
        `https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/julho26/1leitura${formattedDate}.mp3`
      );
      expect(audios.gospel).toBe(
        `https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/julho26/evangelho${formattedDate}.mp3`
      );
      expect(audios.singedPsalm).toBe(
        `/r2-storage/salmos-cantados/julho26/salmos${formattedDate}.mp3`
      );
    }
  });

  it("deve retornar os áudios da liturgia diária para o período de 01/08/26 a 09/08/26", () => {
    const dates = [
      "2026-08-01",
      "2026-08-02",
      "2026-08-03",
      "2026-08-04",
      "2026-08-05",
      "2026-08-06",
      "2026-08-07",
      "2026-08-08",
      "2026-08-09",
    ];

    for (const dateIso of dates) {
      const [year, month, day] = dateIso.split("-");
      const formattedDate = `${day}${month}26`;
      const audios = getLiturgyReadingsAudioByDate(dateIso);

      expect(audios.firstReading).toBe(
        `https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/agosto26/1leitura${formattedDate}.mp3`
      );
      expect(audios.gospel).toBe(
        `https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/agosto26/evangelho${formattedDate}.mp3`
      );
      expect(audios.singedPsalm).toBe(
        `/r2-storage/salmos-cantados/agosto26/salmos${formattedDate}.mp3`
      );

      if (dateIso === "2026-08-02" || dateIso === "2026-08-09") {
        expect(audios.secondReading).toBe(
          `https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/agosto26/2leitura${formattedDate}.mp3`
        );
      } else {
        expect(audios.secondReading).toBeUndefined();
      }
    }
  });
});

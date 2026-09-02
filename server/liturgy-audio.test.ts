import "dotenv/config";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
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

  it("deve retornar os áudios da liturgia diária para o período de 01/08/26 a 31/08/26", () => {
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
      "2026-08-10",
      "2026-08-11",
      "2026-08-12",
      "2026-08-13",
      "2026-08-14",
      "2026-08-15",
      "2026-08-16",
      "2026-08-17",
      "2026-08-18",
      "2026-08-19",
      "2026-08-20",
      "2026-08-21",
      "2026-08-22",
      "2026-08-23",
      "2026-08-24",
      "2026-08-25",
      "2026-08-26",
      "2026-08-27",
      "2026-08-28",
      "2026-08-29",
      "2026-08-30",
      "2026-08-31",
    ];

    for (const dateIso of dates) {
      const [year, month, day] = dateIso.split("-");
      const dayNum = parseInt(day, 10);
      const formattedDate = `${day}${month}26`;
      const audios = getLiturgyReadingsAudioByDate(dateIso);

      expect(audios.firstReading).toBe(
        `https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/agosto26/1leitura${formattedDate}.mp3`
      );
      expect(audios.gospel).toBe(
        `https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/agosto26/evangelho${formattedDate}.mp3`
      );
      
      const psalmPrefix = (dayNum === 24 || dayNum === 25) ? "salmo" : "salmos";
      expect(audios.singedPsalm).toBe(
        `/r2-storage/salmos-cantados/agosto26/${psalmPrefix}${formattedDate}.mp3`
      );

      if (
        dateIso === "2026-08-02" ||
        dateIso === "2026-08-09" ||
        dateIso === "2026-08-16" ||
        dateIso === "2026-08-23" ||
        dateIso === "2026-08-30"
      ) {
        expect(audios.secondReading).toBe(
          `https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/agosto26/2leitura${formattedDate}.mp3`
        );
      } else {
        expect(audios.secondReading).toBeUndefined();
      }
    }
  });

  it("deve retornar os áudios da liturgia diária para o período de 01/09/26 a 03/09/26", () => {
    const dates = ["2026-09-01", "2026-09-02", "2026-09-03"];

    for (const dateIso of dates) {
      const [year, month, day] = dateIso.split("-");
      const formattedDate = `${day}${month}26`;
      const audios = getLiturgyReadingsAudioByDate(dateIso);

      expect(audios.firstReading).toBe(
        `https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/setembro26/1leitura${formattedDate}.mp3`
      );
      expect(audios.gospel).toBe(
        `https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/setembro26/evangelho${formattedDate}.mp3`
      );
      expect(audios.secondReading).toBeUndefined();

      if (dateIso === "2026-09-01") {
        expect(audios.singedPsalm).toBe(
          "/r2-storage/salmos-cantados/setembro26/salmos010926.mp3"
        );
      } else {
        expect(audios.singedPsalm).toBeUndefined();
      }
    }
  });
});

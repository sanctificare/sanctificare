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

  it("deve retornar os áudios da liturgia diária para o período de 01/08/26 a 03/08/26", () => {
    // 01/08/2026
    const audio01 = getLiturgyReadingsAudioByDate("2026-08-01");
    expect(audio01.firstReading).toBe(
      "https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/agosto26/1leitura010826.mp3"
    );
    expect(audio01.gospel).toBe(
      "https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/agosto26/evangelho010826.mp3"
    );
    expect(audio01.singedPsalm).toBe(
      "/r2-storage/salmos-cantados/agosto26/salmos010826.mp3"
    );
    expect(audio01.secondReading).toBeUndefined();

    // 02/08/2026 (Domingo - possui 2ª leitura)
    const audio02 = getLiturgyReadingsAudioByDate("2026-08-02");
    expect(audio02.firstReading).toBe(
      "https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/agosto26/1leitura020826.mp3"
    );
    expect(audio02.secondReading).toBe(
      "https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/agosto26/2leitura020826.mp3"
    );
    expect(audio02.gospel).toBe(
      "https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/agosto26/evangelho020826.mp3"
    );
    expect(audio02.singedPsalm).toBe(
      "/r2-storage/salmos-cantados/agosto26/salmos020826.mp3"
    );

    // 03/08/2026
    const audio03 = getLiturgyReadingsAudioByDate("2026-08-03");
    expect(audio03.firstReading).toBe(
      "https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/agosto26/1leitura030826.mp3"
    );
    expect(audio03.gospel).toBe(
      "https://pub-61abe93d1c484913afbbc5e65eab3b54.r2.dev/agosto26/evangelho030826.mp3"
    );
    expect(audio03.singedPsalm).toBe(
      "/r2-storage/salmos-cantados/agosto26/salmos030826.mp3"
    );
    expect(audio03.secondReading).toBeUndefined();
  });
});

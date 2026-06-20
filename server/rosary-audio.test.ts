import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  rosaryAudioTracks,
  formatTime,
  getTotalDuration,
  AVE_MARIA_AUDIO_FILES,
  PAI_NOSSO_AUDIO_FILE,
} from "../client/src/data/rosary-audio";

const publicDir = join(process.cwd(), "client", "public");

function publicPathFromUrl(url: string): string {
  return join(publicDir, ...url.split("/").filter(Boolean));
}

describe("rosary-audio", () => {
  it("deve ter 77 faixas de áudio no rosário completo", () => {
    // 1 intro + 1 credo + 1 pai_nosso inicial + 3 ave_maria iniciais
    // + 5 × (1 misterio + 1 pai_nosso + 10 ave_maria + 1 gloria + 1 fatima)
    // + 1 salve rainha
    expect(rosaryAudioTracks).toHaveLength(77);
  });

  it("deve ter faixa de introdução", () => {
    const intro = rosaryAudioTracks.find((t) => t.type === "intro");
    expect(intro).toBeDefined();
    expect(intro?.title).toContain("Sinal da Cruz");
  });

  it("deve ter faixas de credo, mistérios, glória, jaculatória e salve", () => {
    expect(rosaryAudioTracks.filter((t) => t.type === "credo")).toHaveLength(1);
    expect(rosaryAudioTracks.filter((t) => t.type === "mystery")).toHaveLength(5);
    expect(rosaryAudioTracks.filter((t) => t.type === "gloria")).toHaveLength(5);
    expect(rosaryAudioTracks.filter((t) => t.type === "fatima")).toHaveLength(5);
    expect(rosaryAudioTracks.filter((t) => t.type === "salve")).toHaveLength(1);
    expect(rosaryAudioTracks.filter((t) => t.type === "conclusion")).toHaveLength(0);
  });

  it("deve ter Pai Nosso inicial e 5 Pai Nossos dos mistérios", () => {
    const paiNossos = rosaryAudioTracks.filter((t) => t.type === "pai_nosso");
    expect(paiNossos).toHaveLength(6);

    expect(paiNossos[0].mysteryNumber).toBeUndefined();
    for (let mysteryNumber = 1; mysteryNumber <= 5; mysteryNumber++) {
      expect(paiNossos.some((track) => track.mysteryNumber === mysteryNumber)).toBe(true);
    }
  });

  it("todas as faixas devem ter URLs válidas", () => {
    rosaryAudioTracks.forEach((track) => {
      expect(track.audioUrl).toMatch(/^\/audio\/rosary\/.+\.mp3$/);
    });
  });

  it("todas as faixas devem ter durações positivas", () => {
    rosaryAudioTracks.forEach((track) => {
      expect(track.duration).toBeGreaterThan(0);
    });
  });

  it("formatTime deve converter segundos corretamente", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(60)).toBe("1:00");
    expect(formatTime(125)).toBe("2:05");
    expect(formatTime(3661)).toBe("61:01");
    expect(formatTime(Number.NaN)).toBe("0:00");
    expect(formatTime(Number.POSITIVE_INFINITY)).toBe("0:00");
  });

  it("getTotalDuration deve somar todas as durações", () => {
    const total = getTotalDuration();
    const expected = rosaryAudioTracks.reduce((sum, t) => sum + t.duration, 0);
    expect(total).toBe(expected);
    expect(total).toBeGreaterThan(600); // Mais de 10 minutos
  });

  it("cada faixa deve ter ID único", () => {
    const ids = rosaryAudioTracks.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("cada faixa deve ter título e descrição", () => {
    rosaryAudioTracks.forEach((track) => {
      expect(track.title).toBeTruthy();
      expect(track.description).toBeTruthy();
    });
  });

  it("deve ter 10 arquivos de Ave Maria disponíveis", () => {
    expect(AVE_MARIA_AUDIO_FILES).toHaveLength(10);
    AVE_MARIA_AUDIO_FILES.forEach((url) => {
      expect(url).toMatch(/^\/audio\/rosary\/ave-maria\d+\.mp3$/);
    });
  });

  it("deve usar arquivo único de Pai Nosso", () => {
    expect(PAI_NOSSO_AUDIO_FILE).toBe("/audio/rosary/Pai-Nosso.mp3");
  });

  it("deve haver 3 Ave Marias iniciais + 50 Ave Marias distribuídas pelos mistérios", () => {
    const aveMariaTracks = rosaryAudioTracks.filter((t) => t.type === "ave_maria");
    expect(aveMariaTracks).toHaveLength(53);

    const initial = aveMariaTracks.filter((t) => t.mysteryNumber === undefined);
    expect(initial).toHaveLength(3);

    for (let mysteryNumber = 1; mysteryNumber <= 5; mysteryNumber++) {
      const perMystery = aveMariaTracks.filter((t) => t.mysteryNumber === mysteryNumber);
      expect(perMystery).toHaveLength(10);
    }
  });

  it("cada mistério deve usar todos os 10 áudios de Ave Maria (distribuição aleatória sem repetição dentro do mistério)", () => {
    for (let mysteryNumber = 1; mysteryNumber <= 5; mysteryNumber++) {
      const perMystery = rosaryAudioTracks.filter(
        (t) => t.type === "ave_maria" && t.mysteryNumber === mysteryNumber,
      );
      const urls = new Set(perMystery.map((t) => t.audioUrl));
      expect(urls.size).toBe(10);
      AVE_MARIA_AUDIO_FILES.forEach((url) => {
        expect(urls.has(url)).toBe(true);
      });
    }
  });

  it("Ave Marias devem usar somente os 10 áudios disponíveis", () => {
    const allowed = new Set(AVE_MARIA_AUDIO_FILES);
    rosaryAudioTracks
      .filter((t) => t.type === "ave_maria")
      .forEach((t) => {
        expect(allowed.has(t.audioUrl)).toBe(true);
      });
  });

  it("deve ordenar cada mistério como anúncio + Pai Nosso + 10 Ave Marias + Glória + Jaculatória", () => {
    let cursor = 6;
    for (let mysteryNumber = 1; mysteryNumber <= 5; mysteryNumber++) {
      const decade = rosaryAudioTracks.slice(cursor, cursor + 14);
      expect(decade[0].type).toBe("mystery");
      expect(decade[0].mysteryNumber).toBe(mysteryNumber);

      expect(decade[1].type).toBe("pai_nosso");
      expect(decade[1].mysteryNumber).toBe(mysteryNumber);

      const aveMarias = decade.slice(2, 12);
      expect(aveMarias.every((track) => track.type === "ave_maria")).toBe(true);
      expect(aveMarias.every((track) => track.mysteryNumber === mysteryNumber)).toBe(true);

      expect(decade[12].type).toBe("gloria");
      expect(decade[12].mysteryNumber).toBe(mysteryNumber);

      expect(decade[13].type).toBe("fatima");
      expect(decade[13].mysteryNumber).toBe(mysteryNumber);
      cursor += 14;
    }

    expect(rosaryAudioTracks[cursor].type).toBe("salve");
  });

  it("todas as URLs configuradas devem existir no public", () => {
    rosaryAudioTracks.forEach((track) => {
      expect(existsSync(publicPathFromUrl(track.audioUrl)), track.audioUrl).toBe(true);
    });
  });
});

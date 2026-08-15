import { describe, expect, it } from "vitest";
import {
  isSaintMichaelLentActive,
  isSaintMichaelContentUnlocked,
  calculateSaintMichaelEndDateIso,
  SAINT_MICHAEL_ACTIVATION_DATE,
} from "../client/src/lib/saintMichaelConfig";
import { getSaintMichaelAudioSegments } from "../client/src/data/saint-michael-lent";

describe("Saint Michael Lent Feature Flags & Date Calculations", () => {
  const dateBeforeActivation = new Date("2026-08-03T12:00:00-03:00");
  const dateOnActivation = new Date("2026-08-15T00:00:00-03:00");
  const dateAfterActivation = new Date("2026-08-20T12:00:00-03:00");

  it("mantém o recurso da Quaresma habilitado para todos os usuários", () => {
    expect(isSaintMichaelLentActive(null, dateBeforeActivation)).toBe(true);
    expect(isSaintMichaelLentActive({ role: "user" }, dateBeforeActivation)).toBe(true);
    expect(isSaintMichaelLentActive({ role: "admin" }, dateBeforeActivation)).toBe(true);
  });

  it("desbloqueia áudios e textos para todos os usuários a qualquer momento", () => {
    const adminUser = { role: "admin" };
    const normalUser = { role: "user" };
    expect(isSaintMichaelContentUnlocked(adminUser, dateBeforeActivation)).toBe(true);
    expect(isSaintMichaelContentUnlocked(normalUser, dateBeforeActivation)).toBe(true);
    expect(isSaintMichaelContentUnlocked(null, dateBeforeActivation)).toBe(true);
    expect(isSaintMichaelContentUnlocked(normalUser, dateOnActivation)).toBe(true);
    expect(isSaintMichaelContentUnlocked(normalUser, dateAfterActivation)).toBe(true);
  });

  it("calcula o término dos 40 dias penitenciais excluindo os domingos a partir de 15/08/2026", () => {
    const endDate = calculateSaintMichaelEndDateIso("2026-08-15", 40);
    expect(endDate).toBe("2026-09-30");
  });

  it("gera os 5 segmentos de áudio de R2 corretamente para todos os 40 dias", () => {
    for (let day = 1; day <= 40; day++) {
      const segments = getSaintMichaelAudioSegments(day);
      expect(segments).toHaveLength(5);
      expect(segments[0].url).toBe("/r2-storage/quaresma-sao-miguel/todos-dias-inicial.mp3");
      expect(segments[1].url).toBe(`/r2-storage/quaresma-sao-miguel/quaresma-parte1-dia${day}.mp3`);
      expect(segments[2].url).toBe(`/r2-storage/quaresma-sao-miguel/quaresma-parte2-dia${day}.mp3`);
      expect(segments[3].url).toBe(`/r2-storage/quaresma-sao-miguel/examedia${day}.mp3`);
      expect(segments[4].url).toBe("/r2-storage/quaresma-sao-miguel/todos-dias-final.mp3");
    }
  });
});


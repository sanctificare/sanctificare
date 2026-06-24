import { describe, expect, it } from "vitest";
import type { Novena } from "../client/src/data/novenas";
import {
  buildDashboardActiveNovena,
  buildNovenasInProgressItems,
  getInProgressNovenas,
  getNextPendingNovenaDay,
  getTopActiveNovena,
  parseNovenaProgress,
} from "../client/src/lib/novenaProgress";

function makeNovena(id: string, name: string, totalDays = 9): Novena {
  return {
    id,
    slug: id,
    name,
    subtitle: `${name} subtitle`,
    description: `${name} description`,
    icon: "icon",
    category: "basic",
    duration: `${totalDays} dias`,
    days: Array.from({ length: totalDays }, (_, i) => ({
      day: i + 1,
      title: `Dia ${i + 1}`,
      reflection: "reflexao",
      prayer: "oracao",
    })),
  };
}

describe("novenaProgress", () => {
  it("parseNovenaProgress deve retornar objeto vazio para payload inválido", () => {
    expect(parseNovenaProgress(null)).toEqual({});
    expect(parseNovenaProgress("")).toEqual({});
    expect(parseNovenaProgress("not-json")).toEqual({});
    expect(parseNovenaProgress("[]")).toEqual({});
    expect(parseNovenaProgress("1")).toEqual({});
  });

  it("parseNovenaProgress deve retornar mapa quando JSON for objeto", () => {
    const parsed = parseNovenaProgress('{"novena-a":[1,2,3]}');
    expect(parsed).toEqual({ "novena-a": [1, 2, 3] });
  });

  it("getNextPendingNovenaDay deve encontrar o primeiro dia faltante", () => {
    expect(getNextPendingNovenaDay([1, 2, 4, 5], 9)).toBe(3);
    expect(getNextPendingNovenaDay([1, 2, 3], 3)).toBe(1);
  });

  it("getInProgressNovenas deve higienizar progresso (duplicados, inválidos e fora de faixa)", () => {
    const novena = makeNovena("novena-a", "Novena A", 9);
    const result = getInProgressNovenas(
      {
        "novena-a": [1, 1, 0, -2, 2.5, 3, 20],
      },
      [novena]
    );

    expect(result).toHaveLength(1);
    expect(result[0].completed).toEqual([1, 3]);
    expect(result[0].completedCount).toBe(2);
    expect(result[0].nextDay).toBe(2);
    expect(result[0].progressPercent).toBe(22);
  });

  it("getInProgressNovenas deve ignorar entradas não-array sem lançar erro", () => {
    const novena = makeNovena("novena-a", "Novena A", 9);
    const result = getInProgressNovenas(
      {
        "novena-a": "valor-invalido" as unknown as number[],
      },
      [novena]
    );

    expect(result).toEqual([]);
  });

  it("getInProgressNovenas deve ordenar por maior progresso, depois maior dia, depois nome", () => {
    const alpha = makeNovena("a", "Alpha", 9);
    const beta = makeNovena("b", "Beta", 9);
    const omega = makeNovena("o", "Omega", 9);

    const ordered = getInProgressNovenas(
      {
        a: [1, 2],
        b: [1, 3],
        o: [1, 2, 3],
      },
      [beta, alpha, omega]
    );

    expect(ordered.map((item) => item.novena.id)).toEqual(["o", "b", "a"]);
  });

  it("getTopActiveNovena deve retornar null quando não houver novena em andamento", () => {
    const novena = makeNovena("novena-a", "Novena A", 9);
    expect(getTopActiveNovena({ "novena-a": [] }, [novena])).toBeNull();
    expect(getTopActiveNovena({ "novena-a": [1, 2, 3, 4, 5, 6, 7, 8, 9] }, [novena])).toBeNull();
  });

  it("getTopActiveNovena deve retornar a novena mais avançada", () => {
    const a = makeNovena("a", "Novena A", 9);
    const b = makeNovena("b", "Novena B", 9);

    const top = getTopActiveNovena(
      {
        a: [1, 2, 3],
        b: [1, 2, 3, 4, 5],
      },
      [a, b]
    );

    expect(top?.novena.id).toBe("b");
    expect(top?.nextDay).toBe(6);
  });

  it("builders de Dashboard e Novenas devem permanecer consistentes", () => {
    const a = makeNovena("a", "Novena A", 9);
    const b = makeNovena("b", "Novena B", 9);
    const c = makeNovena("c", "Novena C", 9);
    const progressMap = {
      a: [1, 3, 2],
      b: [1, 2, 3, 4],
      c: [1],
    };

    const dashboard = buildDashboardActiveNovena(progressMap, [a, b, c]);
    const novenasList = buildNovenasInProgressItems(progressMap, [a, b, c]);

    expect(dashboard).not.toBeNull();
    expect(novenasList).toHaveLength(3);
    expect(dashboard?.novena.id).toBe(novenasList[0].novena.id);
    expect(dashboard?.nextDay).toBe(novenasList[0].nextDay);
    expect(dashboard?.completedCount).toBe(novenasList[0].completed.length);
  });

  it("deve respeitar novena com duração diferente de 9 dias", () => {
    const short = makeNovena("short", "Novena Curta", 7);
    const progressMap = {
      short: [1, 2, 2, 7, 8, 0],
    };

    const inProgress = getInProgressNovenas(progressMap, [short]);
    expect(inProgress).toHaveLength(1);
    expect(inProgress[0].completed).toEqual([1, 2, 7]);
    expect(inProgress[0].completedCount).toBe(3);
    expect(inProgress[0].nextDay).toBe(3);
    expect(inProgress[0].progressPercent).toBe(43);

    const dashboard = buildDashboardActiveNovena(progressMap, [short]);
    expect(dashboard?.novena.id).toBe("short");
    expect(dashboard?.nextDay).toBe(3);
    expect(dashboard?.completedCount).toBe(3);
  });
});

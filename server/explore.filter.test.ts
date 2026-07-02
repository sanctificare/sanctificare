import { describe, expect, it } from "vitest";
import { filterExploreCards } from "../client/src/pages/Explore";

describe("filterExploreCards", () => {
  const cards = [
    {
      href: "/rosario",
      label: "Rosário",
      desc: "Reze o Terço completo",
      image: "/assets/dashboard/rosario.png",
      overlay: "oklch(0.22 0.08 260 / 0.60)",
      category: "Devocional" as const,
    },
    {
      href: "/lectio",
      label: "Lectio Divina",
      desc: "Leitura orante",
      image: "/assets/dashboard/lectio.png",
      overlay: "oklch(0.32 0.11 240 / 0.60)",
      category: "Estudo" as const,
    },
    {
      href: "/intencoes",
      label: "Intenções",
      desc: "Ore com a comunidade",
      image: "/assets/dashboard/intencoes.png",
      overlay: "oklch(0.30 0.10 190 / 0.60)",
      category: "Comunidade" as const,
    },
  ];

  it("filtra por texto no label e na descrição (case-insensitive)", () => {
    expect(filterExploreCards(cards, "ros", null).map((card) => card.href)).toEqual(["/rosario"]);
    expect(filterExploreCards(cards, "comunidade", null).map((card) => card.href)).toEqual(["/intencoes"]);
    expect(filterExploreCards(cards, "LECTIO", null).map((card) => card.href)).toEqual(["/lectio"]);
  });

  it("filtra por categoria quando selecionada", () => {
    expect(filterExploreCards(cards, "", "Estudo").map((card) => card.href)).toEqual(["/lectio"]);
    expect(filterExploreCards(cards, "", "Devocional").map((card) => card.href)).toEqual(["/rosario"]);
  });

  it("combina filtro de texto com categoria", () => {
    expect(filterExploreCards(cards, "ore", "Comunidade").map((card) => card.href)).toEqual(["/intencoes"]);
    expect(filterExploreCards(cards, "ore", "Estudo")).toEqual([]);
  });

  it("trata busca vazia e espaços apenas como sem filtro de texto", () => {
    expect(filterExploreCards(cards, "   ", null)).toHaveLength(3);
  });
});

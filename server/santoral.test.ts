import { describe, it, expect } from "vitest";
import {
  SAINTS_DATABASE,
  getSaintForDate,
  getSaintsForMonth,
  getSaintBySlug,
  getHolyDaysOfObligation,
  searchSaints,
  getTodaySaint,
  getSaintLiturgicalStyle,
} from "../client/src/data/santoral";

describe("Santoral Data Module", () => {
  it("deve carregar a base de santos com dados essenciais preenchidos", () => {
    expect(SAINTS_DATABASE.length).toBeGreaterThan(10);

    SAINTS_DATABASE.forEach((saint) => {
      expect(saint.slug).toBeDefined();
      expect(saint.name).toBeDefined();
      expect(saint.biography).toBeDefined();
      expect(saint.prayer).toBeDefined();
      expect(saint.day).toBeGreaterThanOrEqual(1);
      expect(saint.day).toBeLessThanOrEqual(31);
      expect(saint.month).toBeGreaterThanOrEqual(1);
      expect(saint.month).toBeLessThanOrEqual(12);
    });
  });

  it("deve encontrar santo por data específica", () => {
    const saoBento = getSaintForDate(7, 11);
    expect(saoBento).toBeDefined();
    expect(saoBento?.name).toContain("São Bento");
    expect(saoBento?.slug).toBe("sao-bento-de-nursia");
  });

  it("deve filtrar santos por mês", () => {
    const augustSaints = getSaintsForMonth(8);
    expect(augustSaints.length).toBeGreaterThan(0);
    augustSaints.forEach((s) => expect(s.month).toBe(8));
  });

  it("deve encontrar santo por slug", () => {
    const joana = getSaintBySlug("santa-joana-d-arc");
    expect(joana).toBeDefined();
    expect(joana?.name).toContain("Joana d'Arc");
    expect(joana?.patronage).toContain("Soldados");
  });

  it("deve listar todas as festas de guarda (preceito)", () => {
    const holyDays = getHolyDaysOfObligation();
    expect(holyDays.length).toBeGreaterThanOrEqual(5);

    const names = holyDays.map((h) => h.slug);
    expect(names).toContain("santa-maria-mae-de-deus");
    expect(names).toContain("sao-jose-esposo-de-maria");
    expect(names).toContain("assuncao-de-nossa-senhora");
    expect(names).toContain("imaculada-conceicao");
    expect(names).toContain("natal-de-nosso-senhor-jesus-cristo");
  });

  it("deve realizar busca por texto e categoria", () => {
    const results = searchSaints("deserto");
    expect(results.length).toBeGreaterThan(0);

    const doctorResults = searchSaints("", "doutores");
    expect(doctorResults.length).toBeGreaterThan(0);
    doctorResults.forEach((d) => {
      expect(
        d.title.toLowerCase().includes("doutor") ||
        d.title.toLowerCase().includes("doutora")
      ).toBe(true);
    });
  });

  it("deve retornar estilo litúrgico formatado corretamente", () => {
    const redStyle = getSaintLiturgicalStyle("vermelho");
    expect(redStyle.badge).toContain("rose");

    const whiteStyle = getSaintLiturgicalStyle("branco");
    expect(whiteStyle.badge).toContain("amber");
  });

  it("deve retornar o santo de hoje sem falhas", () => {
    const todaySaint = getTodaySaint(new Date());
    expect(todaySaint).toBeDefined();
    expect(todaySaint.name).toBeDefined();
  });
});

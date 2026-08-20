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

  it("deve retornar o santo de 20 de Agosto corretamente como São Bernardo de Claraval", () => {
    const bernardo = getSaintForDate(8, 20);
    expect(bernardo).toBeDefined();
    expect(bernardo?.name).toContain("São Bernardo de Claraval");
    expect(bernardo?.rank).toBe("Memória");

    // Testar com Date de 20 de Agosto (mês 7 em JS Date é Agosto)
    const today20Aug = new Date(2026, 7, 20);
    const saint20Aug = getTodaySaint(today20Aug);
    expect(saint20Aug).toBeDefined();
    expect(saint20Aug?.name).toContain("São Bernardo");
  });

  it("deve retornar dados históricos, iconografia e obras enriquecidas nos santos", () => {
    const tomas = getSaintBySlug("sao-tomas-de-aquino");
    expect(tomas).toBeDefined();
    expect(tomas?.birthInfo).toBeDefined();
    expect(tomas?.deathInfo).toBeDefined();
    expect(tomas?.canonization).toContain("Doutor da Igreja");
    expect(tomas?.iconography && tomas.iconography.length).toBeGreaterThan(0);
    expect(tomas?.majorWorks && tomas.majorWorks.length).toBeGreaterThan(0);
    expect(tomas?.majorWorks).toContain("Suma Teológica (Summa Theologiae)");

    const bernardo = getSaintBySlug("sao-bernardo-de-claraval");
    expect(bernardo?.birthInfo).toContain("Dijon");
    expect(bernardo?.majorWorks).toContain("Oração Lembrai-vos (Memorare)");
  });

  it("deve gerar texto de compartilhamento formatado e URL para WhatsApp", async () => {
    const { getSaintFormattedShareText, getSaintWhatsAppShareUrl } = await import("../client/src/lib/saintDevotion");
    const saint = getSaintBySlug("sao-bernardo-de-claraval");
    expect(saint).toBeDefined();

    if (saint) {
      const shareText = getSaintFormattedShareText(saint);
      expect(shareText).toContain("São Bernardo de Claraval");
      expect(shareText).toContain("20 de Agosto");
      expect(shareText).toContain("https://sanctificare.app/santoral/sao-bernardo-de-claraval");

      const waUrl = getSaintWhatsAppShareUrl(saint);
      expect(waUrl).toContain("https://api.whatsapp.com/send?text=");
      expect(waUrl).toContain("Claraval");
    }
  });

  it("deve navegar cronologicamente de forma circular entre santos adjacentes", async () => {
    const { getChronologicalAdjacentSaints } = await import("../client/src/data/santoral");
    const adjBernardo = getChronologicalAdjacentSaints("sao-bernardo-de-claraval"); // 20 de Agosto
    expect(adjBernardo.prev).toBeDefined();
    expect(adjBernardo.next).toBeDefined();
    expect(adjBernardo.prev.slug).not.toBe("sao-bernardo-de-claraval");
    expect(adjBernardo.next.slug).not.toBe("sao-bernardo-de-claraval");

    // Primeiro santo do ano (1 de Jan)
    const adjJan = getChronologicalAdjacentSaints("santa-maria-mae-de-deus");
    expect(adjJan.prev.month).toBe(12); // Loop circular para Dezembro
    expect(adjJan.next.month).toBe(1);
  });

  it("deve retornar santos relacionados pela mesma família espiritual ou título", async () => {
    const { getRelatedSaints, getSaintBySlug } = await import("../client/src/data/santoral");
    const francisco = getSaintBySlug("sao-francisco-de-assis");
    expect(francisco).toBeDefined();

    if (francisco) {
      const related = getRelatedSaints(francisco, 3);
      expect(related.length).toBeGreaterThan(0);
      expect(related.length).toBeLessThanOrEqual(3);
      // Deve encontrar outros santos franciscanos (Santa Clara, São Maximiliano Kolbe, Santo Antônio)
      const slugs = related.map(r => r.slug);
      expect(slugs.some(s => s.includes("clara") || s.includes("kolbe") || s.includes("antonio"))).toBe(true);
    }
  });
});

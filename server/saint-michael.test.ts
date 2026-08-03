import { describe, expect, it } from "vitest";
import { isSaintMichaelLentActive, SAINT_MICHAEL_ACTIVATION_DATE } from "../client/src/lib/saintMichaelConfig";

describe("isSaintMichaelLentActive", () => {
  const dateBeforeActivation = new Date("2026-08-03T12:00:00-03:00");
  const dateOnActivation = new Date("2026-08-15T00:00:00-03:00");
  const dateAfterActivation = new Date("2026-08-20T12:00:00-03:00");

  it("mantém ativado para administrador (role: admin) mesmo antes de 15/08/2026", () => {
    const adminUser = { role: "admin" };
    expect(isSaintMichaelLentActive(adminUser, dateBeforeActivation)).toBe(true);
    expect(isSaintMichaelLentActive(adminUser, dateOnActivation)).toBe(true);
    expect(isSaintMichaelLentActive(adminUser, dateAfterActivation)).toBe(true);
  });

  it("desativa para usuário normal (role: user) antes de 15/08/2026", () => {
    const normalUser = { role: "user" };
    expect(isSaintMichaelLentActive(normalUser, dateBeforeActivation)).toBe(false);
  });

  it("ativa para usuário normal (role: user) a partir de 15/08/2026", () => {
    const normalUser = { role: "user" };
    expect(isSaintMichaelLentActive(normalUser, dateOnActivation)).toBe(true);
    expect(isSaintMichaelLentActive(normalUser, dateAfterActivation)).toBe(true);
  });

  it("desativa para visitante não autenticado (null) antes de 15/08/2026", () => {
    expect(isSaintMichaelLentActive(null, dateBeforeActivation)).toBe(false);
    expect(isSaintMichaelLentActive(undefined, dateBeforeActivation)).toBe(false);
  });

  it("ativa para visitante não autenticado a partir de 15/08/2026", () => {
    expect(isSaintMichaelLentActive(null, dateOnActivation)).toBe(true);
    expect(isSaintMichaelLentActive(undefined, dateAfterActivation)).toBe(true);
  });
});

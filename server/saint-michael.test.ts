import { describe, expect, it } from "vitest";
import {
  isSaintMichaelLentActive,
  isSaintMichaelContentUnlocked,
  SAINT_MICHAEL_ACTIVATION_DATE,
} from "../client/src/lib/saintMichaelConfig";

describe("Saint Michael Lent Feature Flags", () => {
  const dateBeforeActivation = new Date("2026-08-03T12:00:00-03:00");
  const dateOnActivation = new Date("2026-08-15T00:00:00-03:00");
  const dateAfterActivation = new Date("2026-08-20T12:00:00-03:00");

  it("mantém o recurso da Quaresma habilitado para todos os usuários", () => {
    expect(isSaintMichaelLentActive(null, dateBeforeActivation)).toBe(true);
    expect(isSaintMichaelLentActive({ role: "user" }, dateBeforeActivation)).toBe(true);
    expect(isSaintMichaelLentActive({ role: "admin" }, dateBeforeActivation)).toBe(true);
  });

  it("desbloqueia áudios e textos para admin a qualquer momento", () => {
    const adminUser = { role: "admin" };
    expect(isSaintMichaelContentUnlocked(adminUser, dateBeforeActivation)).toBe(true);
    expect(isSaintMichaelContentUnlocked(adminUser, dateOnActivation)).toBe(true);
    expect(isSaintMichaelContentUnlocked(adminUser, dateAfterActivation)).toBe(true);
  });

  it("bloqueia áudios e textos para usuários comuns antes de 15/08/2026", () => {
    const normalUser = { role: "user" };
    expect(isSaintMichaelContentUnlocked(normalUser, dateBeforeActivation)).toBe(false);
    expect(isSaintMichaelContentUnlocked(null, dateBeforeActivation)).toBe(false);
  });

  it("desbloqueia áudios e textos para usuários comuns a partir de 15/08/2026", () => {
    const normalUser = { role: "user" };
    expect(isSaintMichaelContentUnlocked(normalUser, dateOnActivation)).toBe(true);
    expect(isSaintMichaelContentUnlocked(normalUser, dateAfterActivation)).toBe(true);
  });
});

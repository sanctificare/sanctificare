import { describe, expect, it } from "vitest";
import { getLoginUrl, sanitizeAppPath } from "../client/src/const";

describe("auth path helpers", () => {
  it("sanitizeAppPath aceita path interno seguro", () => {
    expect(sanitizeAppPath("/dashboard")).toBe("/dashboard");
    expect(sanitizeAppPath("/novenas/novena-sao-jose?day=2")).toBe(
      "/novenas/novena-sao-jose?day=2"
    );
  });

  it("sanitizeAppPath aplica fallback para path inválido", () => {
    expect(sanitizeAppPath(undefined)).toBe("/dashboard");
    expect(sanitizeAppPath(null)).toBe("/dashboard");
    expect(sanitizeAppPath("")).toBe("/dashboard");
    expect(sanitizeAppPath("login")).toBe("/dashboard");
    expect(sanitizeAppPath("//evil.example/steal")).toBe("/dashboard");
    expect(sanitizeAppPath("/login")).toBe("/dashboard");
    expect(sanitizeAppPath("/redefinir-senha?token=abc")).toBe("/dashboard");
  });

  it("sanitizeAppPath respeita fallback customizado", () => {
    expect(sanitizeAppPath(undefined, "/home")).toBe("/home");
    expect(sanitizeAppPath("/login", "/home")).toBe("/home");
  });

  it("getLoginUrl inclui path codificado quando válido", () => {
    const result = getLoginUrl("/videos?mode=shorts&tab=all");
    expect(result).toBe("/login?path=%2Fvideos%3Fmode%3Dshorts%26tab%3Dall");
  });

  it("getLoginUrl retorna /login quando path não for válido", () => {
    expect(getLoginUrl("/login")).toBe("/login");
    expect(getLoginUrl("https://evil.example")).toBe("/login");
    expect(getLoginUrl("")).toBe("/login");
  });
});

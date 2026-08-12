import { describe, expect, it } from "vitest";
import { getLoginUrl, sanitizeAppPath, getPublicUrl, PUBLIC_APP_URL } from "../client/src/const";

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

describe("getPublicUrl helper", () => {
  it("substitui origens de localhost ou capacitor pelo domínio público", () => {
    expect(getPublicUrl("http://localhost/liturgia")).toBe("https://sanctificare.app/liturgia");
    expect(getPublicUrl("capacitor://localhost/liturgia")).toBe("https://sanctificare.app/liturgia");
    expect(getPublicUrl("http://localhost:5173/novenas/sao-jose")).toBe("https://sanctificare.app/novenas/sao-jose");
    expect(getPublicUrl("http://127.0.0.1:3000/videos-biblicos?v=123")).toBe("https://sanctificare.app/videos-biblicos?v=123");
  });

  it("converte caminhos relativos em URLs públicas completas", () => {
    expect(getPublicUrl("/liturgia")).toBe("https://sanctificare.app/liturgia");
    expect(getPublicUrl("/oracoes")).toBe("https://sanctificare.app/oracoes");
  });

  it("mantém URLs públicas remotas inalteradas", () => {
    expect(getPublicUrl("https://sanctificare.app/liturgia")).toBe("https://sanctificare.app/liturgia");
  });

  it("retorna PUBLIC_APP_URL quando nenhum argumento é passado em ambiente sem window", () => {
    expect(getPublicUrl("")).toBe(PUBLIC_APP_URL);
  });
});


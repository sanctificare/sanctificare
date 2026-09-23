import { describe, expect, it } from "vitest";
import { classifyAcquisitionSource, featureFromPath } from "../shared/analytics";

describe("featureFromPath", () => {
  it("mapeia telas para o recurso correspondente", () => {
    expect(featureFromPath("/rosario")).toBe("rosario");
    expect(featureFromPath("/novenas/sao-jose")).toBe("novenas");
    expect(featureFromPath("/oracao/42")).toBe("oracoes");
    expect(featureFromPath("/calendario")).toBe("santoral");
    expect(featureFromPath("/degraus-de-perfeicao/filoteia")).toBe("degraus_perfeicao");
    expect(featureFromPath("/liturgia?data=2026-09-23")).toBe("liturgia");
  });

  it("não confunde prefixos parecidos", () => {
    expect(featureFromPath("/perfil/zona-de-perigo")).toBe("perfil");
    expect(featureFromPath("/premiumx")).toBe("outros");
  });

  it("ignora telas que não são recursos", () => {
    expect(featureFromPath("/")).toBeNull();
    expect(featureFromPath("/login")).toBeNull();
    expect(featureFromPath("/admin")).toBeNull();
    expect(featureFromPath("/redefinir-senha?token=x")).toBeNull();
  });
});

describe("classifyAcquisitionSource", () => {
  it("prioriza utm_source sobre o referrer", () => {
    expect(classifyAcquisitionSource({ utmSource: "Instagram", referrerHost: "google.com" })).toBe("instagram");
    expect(classifyAcquisitionSource({ utmSource: "wa" })).toBe("whatsapp");
  });

  it("classifica pelo site de origem", () => {
    expect(classifyAcquisitionSource({ referrerHost: "l.instagram.com" })).toBe("instagram");
    expect(classifyAcquisitionSource({ referrerHost: "m.facebook.com" })).toBe("facebook");
    expect(classifyAcquisitionSource({ referrerHost: "google.com.br" })).toBe("google");
    expect(classifyAcquisitionSource({ referrerHost: "blogcatolico.com.br" })).toBe("outros_sites");
  });

  it("mantém utm_source desconhecido como está", () => {
    expect(classifyAcquisitionSource({ utmSource: "paroquia_sao_jose" })).toBe("paroquia_sao_jose");
  });

  it("usa a plataforma quando não há UTM nem referrer", () => {
    expect(classifyAcquisitionSource({ platform: "android" })).toBe("play_store");
    expect(classifyAcquisitionSource({ platform: "web" })).toBe("direto");
  });
});

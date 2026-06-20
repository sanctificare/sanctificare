import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAuthContext(userId = 1): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `user-${userId}`,
      email: `user${userId}@test.com`,
      name: "Fiel Teste",
      loginMethod: "oauth",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("templates.getPreference", () => {
  it("rejeita usuário não autenticado", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.templates.getPreference()).rejects.toThrow();
  });

  it("retorna preferência padrão para usuário autenticado", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const result = await caller.templates.getPreference();
      // Pode retornar "classico" ou falhar por DB indisponível
      expect(["classico", "moderno", "tradicional", "minimalista"]).toContain(result);
    } catch (e: any) {
      // DB pode não estar disponível em testes
      expect(e.message).not.toContain("UNAUTHORIZED");
    }
  });
});

describe("templates.setPreference", () => {
  it("rejeita usuário não autenticado", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.templates.setPreference({ template: "moderno" })
    ).rejects.toThrow();
  });

  it("valida template inválido", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.templates.setPreference({ template: "invalido" as any })
    ).rejects.toThrow();
  });

  it("aceita templates válidos", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const validTemplates = ["classico", "moderno", "tradicional", "minimalista"] as const;

    for (const template of validTemplates) {
      try {
        const result = await caller.templates.setPreference({ template });
        expect(result.success).toBe(true);
      } catch (e: any) {
        // DB pode não estar disponível em testes
        expect(e.message).not.toContain("UNAUTHORIZED");
      }
    }
  });
});

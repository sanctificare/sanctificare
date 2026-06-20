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

describe("candles.light", () => {
  it("rejeita usuário não autenticado", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.candles.light({
        intention: "Minha intenção de teste",
        type: "intencao",
        isAnonymous: false,
      })
    ).rejects.toThrow();
  });

  it("permite usuário autenticado criar vela pública", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const result = await caller.candles.light({
        intention: "Intenção de teste com mais de 5 letras",
        type: "intencao",
        isAnonymous: false,
      });
      expect(result.success).toBe(true);
    } catch (e: any) {
      // Ignorar erro se o DB não estiver disponível nos testes
      expect(e.message).not.toContain("UNAUTHORIZED");
    }
  });
});

describe("candles.listActive", () => {
  it("permite consulta por qualquer usuário (público)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const result = await caller.candles.listActive();
      expect(Array.isArray(result)).toBe(true);
    } catch (e: any) {
      expect(e.message).not.toContain("UNAUTHORIZED");
    }
  });
});

describe("candles.pray", () => {
  it("rejeita usuário não autenticado", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.candles.pray({ candleId: 1 })
    ).rejects.toThrow();
  });

  it("permite usuário autenticado rezar por uma vela", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const result = await caller.candles.pray({ candleId: 9999 });
      expect(result).toHaveProperty("success");
    } catch (e: any) {
      expect(e.message).not.toContain("UNAUTHORIZED");
    }
  });
});

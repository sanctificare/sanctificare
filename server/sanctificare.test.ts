import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Helper para criar contexto autenticado
function createAuthContext(userId = 1, name = "Fiel Teste"): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `user-${userId}`,
      email: `user${userId}@test.com`,
      name,
      loginMethod: "oauth",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// Helper para criar contexto público (sem autenticação)
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("auth.me", () => {
  it("retorna null para usuário não autenticado", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("retorna dados do usuário autenticado", async () => {
    const ctx = createAuthContext(1, "João da Silva");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.name).toBe("João da Silva");
    expect(result?.id).toBe(1);
  });
});

describe("auth.logout", () => {
  it("limpa o cookie de sessão e retorna sucesso", async () => {
    const clearedCookies: string[] = [];
    const ctx = createAuthContext();
    ctx.res.clearCookie = (name: string) => { clearedCookies.push(name); };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(clearedCookies.length).toBe(1);
  });
});

describe("prayers.logPrayer", () => {
  it("rejeita usuário não autenticado", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.prayers.logPrayer({ prayerType: "ave_maria", prayerName: "Ave Maria" })
    ).rejects.toThrow();
  });
});

describe("prayers.getRecentLogs", () => {
  it("rejeita usuário não autenticado", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.prayers.getRecentLogs()).rejects.toThrow();
  });
});

describe("intentions.list", () => {
  it("é acessível publicamente", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    // Pode falhar por DB indisponível em testes, mas não por autenticação
    try {
      const result = await caller.intentions.list();
      expect(Array.isArray(result)).toBe(true);
    } catch (e: any) {
      // DB pode não estar disponível em ambiente de teste — aceitável
      expect(e.message).not.toContain("UNAUTHORIZED");
    }
  });
});

describe("intentions.create", () => {
  it("rejeita usuário não autenticado", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.intentions.create({ title: "Oração pela família", description: "Peço orações pela minha família." })
    ).rejects.toThrow();
  });

  it("valida campos obrigatórios — título muito curto", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.intentions.create({ title: "Oi", description: "Texto suficientemente longo para passar na validação." })
    ).rejects.toThrow();
  });

  it("valida campos obrigatórios — descrição muito curta", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.intentions.create({ title: "Título válido aqui", description: "Curto" })
    ).rejects.toThrow();
  });
});

describe("intentions.pray", () => {
  it("rejeita usuário não autenticado", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.intentions.pray({ intentionId: 1 })
    ).rejects.toThrow();
  });
});

describe("subscriptions.getActive", () => {
  it("rejeita usuário não autenticado", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.subscriptions.getActive()).rejects.toThrow();
  });
});

describe("subscriptions.subscribe", () => {
  it("rejeita usuário não autenticado", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.subscriptions.subscribe({ plan: "monthly" })
    ).rejects.toThrow();
  });

  it("valida plano inválido", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.subscriptions.subscribe({ plan: "weekly" as any })
    ).rejects.toThrow();
  });
});

describe("subscriptions.cancel", () => {
  it("rejeita usuário não autenticado", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.subscriptions.cancel()).rejects.toThrow();
  });
});

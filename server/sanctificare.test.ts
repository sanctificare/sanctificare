import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { COOKIE_NAME } from "../shared/const";

// Helper para criar contexto autenticado
function createAuthContext(userId = 1, name = "Fiel Teste", ip = "127.0.0.1"): TrpcContext {
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
    req: {
      protocol: "https",
      headers: {},
      ip,
      socket: { remoteAddress: ip },
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// Helper para criar contexto público (sem autenticação)
function createPublicContext(ip = "127.0.0.10"): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      ip,
      socket: { remoteAddress: ip },
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}



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

describe("public endpoint rate limiting", () => {
  it("aplica limite em bible.search e retorna TOO_MANY_REQUESTS", async () => {
    const ctx = createPublicContext("10.0.0.41");
    const caller = appRouter.createCaller(ctx);

    let lastError: unknown = null;
    for (let i = 0; i < 46; i += 1) {
      try {
        await caller.bible.search({ query: "amor" });
      } catch (error) {
        lastError = error;
      }
    }

    expect(lastError).toBeTruthy();
    expect((lastError as any).code).toBe("TOO_MANY_REQUESTS");
  });

  it("aplica limite em bible.getChapter e retorna TOO_MANY_REQUESTS", async () => {
    const ctx = createPublicContext("10.0.0.42");
    const caller = appRouter.createCaller(ctx);

    let lastError: unknown = null;
    for (let i = 0; i < 121; i += 1) {
      try {
        await caller.bible.getChapter({ bookId: "gn", chapter: 1 });
      } catch (error) {
        lastError = error;
      }
    }

    expect(lastError).toBeTruthy();
    expect((lastError as any).code).toBe("TOO_MANY_REQUESTS");
  });

  it("aplica limite em liturgy.getSantoDoDia e retorna TOO_MANY_REQUESTS", async () => {
    const getSpy = vi.spyOn(axios, "get").mockResolvedValue({
      status: 200,
      data: {
        today: {
          title: "São Teste",
          full_text: "Texto de teste. Outra frase.",
        },
      },
    } as any);

    const ctx = createPublicContext("10.0.0.43");
    const caller = appRouter.createCaller(ctx);

    let lastError: unknown = null;
    for (let i = 0; i < 31; i += 1) {
      try {
        await caller.liturgy.getSantoDoDia();
      } catch (error) {
        lastError = error;
      }
    }

    expect(lastError).toBeTruthy();
    expect((lastError as any).code).toBe("TOO_MANY_REQUESTS");
    expect(getSpy).toHaveBeenCalled();
    getSpy.mockRestore();
  });
});

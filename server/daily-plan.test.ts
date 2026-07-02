import { afterEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as dbModule from "./db";

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

describe("dailyPlan.getStatus", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejeita usuário não autenticado", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.dailyPlan.getStatus()).rejects.toThrow();
  });

  it("retorna o status do plano diário para usuário autenticado", async () => {
    const expectedStatus = {
      liturgyCompleted: true,
      rosaryCompleted: false,
      lectioCompleted: true,
      prayersCompleted: true,
      intercessionCompleted: false,
      novenaCompleted: true,
      streak: 4,
    };

    const statusSpy = vi
      .spyOn(dbModule, "getDailyPlanStatus")
      .mockResolvedValue(expectedStatus);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const status = await caller.dailyPlan.getStatus();

    expect(status).toEqual(expectedStatus);
    expect(statusSpy).toHaveBeenCalledTimes(1);
    expect(statusSpy).toHaveBeenCalledWith(1);
  });

  it("propaga erro de infraestrutura para facilitar observabilidade", async () => {
    vi.spyOn(dbModule, "getDailyPlanStatus").mockRejectedValue(new Error("DB unavailable"));

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.dailyPlan.getStatus()).rejects.toThrow("DB unavailable");
  });
});

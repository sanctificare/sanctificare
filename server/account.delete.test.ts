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

describe("account.deleteMe", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejeita usuário não autenticado", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.account.deleteMe()).rejects.toThrow();
  });

  it("exclui a conta do usuário autenticado", async () => {
    const deleteSpy = vi.spyOn(dbModule, "deleteUserAccount").mockResolvedValue({ deleted: true });
    const caller = appRouter.createCaller(createAuthContext(42));

    await expect(caller.account.deleteMe()).resolves.toEqual({ success: true, deleted: true });
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(42);
  });

  it("retorna sucesso mesmo quando a conta já foi excluída", async () => {
    const deleteSpy = vi.spyOn(dbModule, "deleteUserAccount").mockResolvedValue({ deleted: false });
    const caller = appRouter.createCaller(createAuthContext(42));

    await expect(caller.account.deleteMe()).resolves.toEqual({ success: true, deleted: false });
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(42);
  });
});

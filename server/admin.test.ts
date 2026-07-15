import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Helper to create an admin context
function createAdminContext(userId = 1): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `admin-${userId}`,
      email: `admin${userId}@test.com`,
      name: "Admin User",
      loginMethod: "oauth",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.1",
      socket: { remoteAddress: "127.0.0.1" },
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// Helper to create a regular user context
function createRegularUserContext(userId = 2): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `user-${userId}`,
      email: `user${userId}@test.com`,
      name: "Regular User",
      loginMethod: "oauth",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.1",
      socket: { remoteAddress: "127.0.0.1" },
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// Helper to create public context
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.1",
      socket: { remoteAddress: "127.0.0.1" },
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Admin tRPC procedures security", () => {
  it("rejects unauthenticated requests", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.admin.getStats()).rejects.toThrow();
    await expect(caller.admin.getUsersList({ limit: 10, offset: 0 })).rejects.toThrow();
    await expect(caller.admin.getUserDetail({ userId: 999 })).rejects.toThrow();
    await expect(caller.admin.togglePremium({ userId: 999, grant: true })).rejects.toThrow();
    await expect(caller.admin.getRegistrationGrowth()).rejects.toThrow();
  });

  it("rejects regular user requests (role: user)", async () => {
    const ctx = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.getStats()).rejects.toThrow();
    await expect(caller.admin.getUsersList({ limit: 10, offset: 0 })).rejects.toThrow();
    await expect(caller.admin.getUserDetail({ userId: 999 })).rejects.toThrow();
    await expect(caller.admin.togglePremium({ userId: 999, grant: true })).rejects.toThrow();
    await expect(caller.admin.getRegistrationGrowth()).rejects.toThrow();
  });

  it("allows admin user requests (role: admin)", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Should not throw security errors (may throw DB errors if mock db is empty/not running, but not forbidden error)
    try {
      await caller.admin.getStats();
    } catch (e: any) {
      expect(e.message).not.toContain("not_admin");
      expect(e.message).not.toContain("NOT_ADMIN_ERR_MSG");
      expect(e.code).not.toBe("FORBIDDEN");
    }

    try {
      await caller.admin.getUsersList({ limit: 5, offset: 0 });
    } catch (e: any) {
      expect(e.message).not.toContain("not_admin");
      expect(e.message).not.toContain("NOT_ADMIN_ERR_MSG");
      expect(e.code).not.toBe("FORBIDDEN");
    }

    try {
      await caller.admin.getRegistrationGrowth();
    } catch (e: any) {
      expect(e.message).not.toContain("not_admin");
      expect(e.message).not.toContain("NOT_ADMIN_ERR_MSG");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });
});

import { vi, describe, expect, it } from "vitest";

// Mock the environment config module before imports are evaluated
vi.mock("./_core/env", () => {
  return {
    ENV: {
      appId: "test-app-id",
      cookieSecret: "test-secret-at-least-32-chars-long-123456",
      databaseUrl: "test-db-url",
      oAuthServerUrl: "test-oauth-url",
      ownerOpenId: "test-owner-id",
      isProduction: false,
    },
  };
});

// Mock the db module before router imports
const mockUsers: any[] = [];
vi.mock("./db", async (importOriginal) => {
  const original = await importOriginal<typeof import("./db")>();
  return {
    ...original,
    getUserByEmail: vi.fn(async (email: string) => {
      return mockUsers.find((u) => u.email === email);
    }),
    createUser: vi.fn(async (user: any) => {
      const newUser = {
        id: mockUsers.length + 1,
        openId: user.openId,
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash,
        loginMethod: user.loginMethod,
        role: user.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };
      mockUsers.push(newUser);
      return newUser;
    }),
  };
});

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { COOKIE_NAME } from "../shared/const";

type CookieCall = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

function createTestContext(): { ctx: TrpcContext; setCookies: CookieCall[] } {
  const setCookies: CookieCall[] = [];

  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      hostname: "localhost",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };

  return { ctx, setCookies };
}

describe("auth.credentials", () => {
  const randomEmail = `test-${Math.floor(Math.random() * 1000000)}@example.com`;
  const password = "securepassword123";
  const name = "Fiel Teste Local";

  it("registers a new user successfully", async () => {
    const { ctx, setCookies } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.register({
      name,
      email: randomEmail,
      password,
    });

    expect(result.success).toBe(true);
    expect(result.user.email).toBe(randomEmail);
    expect(result.user.name).toBe(name);

    expect(setCookies).toHaveLength(1);
    expect(setCookies[0]?.name).toBe(COOKIE_NAME);
    expect(setCookies[0]?.value).toBeDefined();
  });

  it("fails to register with existing email", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.register({
        name,
        email: randomEmail,
        password,
      })
    ).rejects.toThrow(/já está cadastrado/);
  });

  it("logs in successfully with correct credentials", async () => {
    const { ctx, setCookies } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.login({
      email: randomEmail,
      password,
    });

    expect(result.success).toBe(true);
    expect(result.user.email).toBe(randomEmail);
    expect(setCookies).toHaveLength(1);
    expect(setCookies[0]?.name).toBe(COOKIE_NAME);
  });

  it("fails to log in with incorrect password", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: randomEmail,
        password: "wrongpassword",
      })
    ).rejects.toThrow(/incorretos/);
  });
});

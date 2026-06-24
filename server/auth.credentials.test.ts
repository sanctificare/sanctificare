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
      sessionTtlMs: 1000 * 60 * 60,
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

import express from "express";
import request from "supertest";
import { authRouter } from "./_core/authRoutes";
import { COOKIE_NAME } from "../shared/const";

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

describe("auth.credentials REST API", () => {
  const randomEmail = `test-${Math.floor(Math.random() * 1000000)}@example.com`;
  const password = "securepassword123";
  const name = "Fiel Teste Local";

  it("registers a new user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name, email: randomEmail, password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(randomEmail);
    expect(res.body.user.name).toBe(name);

    const cookies = res.headers["set-cookie"] || [];
    const hasSession = cookies.some((c: string) => c.includes(COOKIE_NAME));
    expect(hasSession).toBe(true);
  });

  it("fails to register with existing email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name, email: randomEmail, password });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain("já está cadastrado");
  });

  it("logs in successfully with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: randomEmail, password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(randomEmail);

    const cookies = res.headers["set-cookie"] || [];
    const hasSession = cookies.some((c: string) => c.includes(COOKIE_NAME));
    expect(hasSession).toBe(true);
  });

  it("fails to log in with incorrect password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: randomEmail, password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.error).toContain("incorretos");
  });
});

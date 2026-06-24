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

import express from "express";
import request from "supertest";
import { authRouter } from "./_core/authRoutes";
import { COOKIE_NAME } from "../shared/const";

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

describe("auth.logout REST API", () => {
  it("clears the session cookie and reports success", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .send();

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });

    const cookies = res.headers["set-cookie"] || [];
    const clearedSession = cookies.some((c: string) => c.includes(COOKIE_NAME) && (c.includes("Max-Age=-1") || c.includes("Max-Age=0") || c.includes("expires=")));
    expect(clearedSession).toBe(true);
  });
});

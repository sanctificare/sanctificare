import express from "express";
import { createServer, type Server } from "http";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const {
  upsertUserMock,
  getAuthorizeUrlMock,
  exchangeCodeForTokenMock,
  getUserInfoMock,
  createSessionTokenMock,
} = vi.hoisted(() => ({
  upsertUserMock: vi.fn(async () => undefined),
  getAuthorizeUrlMock: vi.fn(async (_callbackUrl: string, state: string) => {
    return `https://oauth.example/authorize?state=${encodeURIComponent(state)}`;
  }),
  exchangeCodeForTokenMock: vi.fn(async () => ({ accessToken: "access-token" })),
  getUserInfoMock: vi.fn(async () => ({
    openId: "openid-123",
    name: "Fiel OAuth",
    email: "fiel@example.com",
    loginMethod: "oauth",
    platform: "google",
  })),
  createSessionTokenMock: vi.fn(async () => "session-token"),
}));

vi.mock("./db", () => ({
  upsertUser: upsertUserMock,
}));

vi.mock("./_core/sdk", () => ({
  sdk: {
    getAuthorizeUrl: getAuthorizeUrlMock,
    exchangeCodeForToken: exchangeCodeForTokenMock,
    getUserInfo: getUserInfoMock,
    createSessionToken: createSessionTokenMock,
  },
}));

vi.mock("./_core/env", () => ({
  ENV: {
    sessionTtlMs: 1000 * 60 * 60,
  },
}));

import { registerOAuthRoutes } from "./_core/oauth";

let server: Server;
let baseUrl = "";

function extractCookieValue(setCookieHeader: string | null, cookieName: string) {
  if (!setCookieHeader) return null;
  const match = setCookieHeader.match(new RegExp(`${cookieName}=([^;]+)`));
  return match?.[1] ?? null;
}

beforeAll(async () => {
  const app = express();
  registerOAuthRoutes(app);

  server = createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Unable to determine test server address");
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

describe("oauth return path", () => {
  it("preserva path interno seguro até o redirect final", async () => {
    upsertUserMock.mockClear();
    getAuthorizeUrlMock.mockClear();
    exchangeCodeForTokenMock.mockClear();
    getUserInfoMock.mockClear();
    createSessionTokenMock.mockClear();

    const requestedPath = "/novenas/novena-sao-jose?day=2";
    const loginRes = await fetch(
      `${baseUrl}/api/oauth/login?path=${encodeURIComponent(requestedPath)}`,
      { redirect: "manual" }
    );

    expect(loginRes.status).toBe(302);
    const loginLocation = loginRes.headers.get("location");
    expect(loginLocation).toBeTruthy();

    const authUrl = new URL(loginLocation!);
    const state = authUrl.searchParams.get("state");
    expect(state).toBeTruthy();

    const decodedState = JSON.parse(Buffer.from(state!, "base64").toString("utf-8")) as {
      appPath: string;
      nonce: string;
      redirectUri: string;
    };
    expect(decodedState.appPath).toBe(requestedPath);

    const nonce = extractCookieValue(loginRes.headers.get("set-cookie"), "oauth_state_nonce");
    expect(nonce).toBeTruthy();
    expect(decodedState.nonce).toBe(nonce);

    const callbackRes = await fetch(
      `${baseUrl}/api/oauth/callback?code=test-code&state=${encodeURIComponent(state!)}`,
      {
        redirect: "manual",
        headers: {
          cookie: `oauth_state_nonce=${nonce}`,
        },
      }
    );

    expect(callbackRes.status).toBe(302);
    expect(callbackRes.headers.get("location")).toBe(requestedPath);
    expect(upsertUserMock).toHaveBeenCalledTimes(1);
    expect(exchangeCodeForTokenMock).toHaveBeenCalledWith("test-code", state);
    expect(createSessionTokenMock).toHaveBeenCalledTimes(1);
  });

  it("normaliza path externo para fallback seguro", async () => {
    upsertUserMock.mockClear();

    const loginRes = await fetch(
      `${baseUrl}/api/oauth/login?path=${encodeURIComponent("https://evil.example/steal")}`,
      { redirect: "manual" }
    );

    expect(loginRes.status).toBe(302);
    const loginLocation = loginRes.headers.get("location");
    expect(loginLocation).toBeTruthy();

    const authUrl = new URL(loginLocation!);
    const state = authUrl.searchParams.get("state");
    expect(state).toBeTruthy();

    const decodedState = JSON.parse(Buffer.from(state!, "base64").toString("utf-8")) as {
      appPath: string;
    };
    expect(decodedState.appPath).toBe("/dashboard");

    const nonce = extractCookieValue(loginRes.headers.get("set-cookie"), "oauth_state_nonce");
    expect(nonce).toBeTruthy();

    const callbackRes = await fetch(
      `${baseUrl}/api/oauth/callback?code=test-code&state=${encodeURIComponent(state!)}`,
      {
        redirect: "manual",
        headers: {
          cookie: `oauth_state_nonce=${nonce}`,
        },
      }
    );

    expect(callbackRes.status).toBe(302);
    expect(callbackRes.headers.get("location")).toBe("/dashboard");
  });

  it("normaliza retorno para páginas de auth e evita loop", async () => {
    const blockedPaths = ["/login", "/redefinir-senha?token=abc"];

    for (const blockedPath of blockedPaths) {
      const loginRes = await fetch(
        `${baseUrl}/api/oauth/login?path=${encodeURIComponent(blockedPath)}`,
        { redirect: "manual" }
      );

      expect(loginRes.status).toBe(302);
      const loginLocation = loginRes.headers.get("location");
      expect(loginLocation).toBeTruthy();

      const authUrl = new URL(loginLocation!);
      const state = authUrl.searchParams.get("state");
      expect(state).toBeTruthy();

      const decodedState = JSON.parse(Buffer.from(state!, "base64").toString("utf-8")) as {
        appPath: string;
      };
      expect(decodedState.appPath).toBe("/dashboard");

      const nonce = extractCookieValue(loginRes.headers.get("set-cookie"), "oauth_state_nonce");
      expect(nonce).toBeTruthy();

      const callbackRes = await fetch(
        `${baseUrl}/api/oauth/callback?code=test-code&state=${encodeURIComponent(state!)}`,
        {
          redirect: "manual",
          headers: {
            cookie: `oauth_state_nonce=${nonce}`,
          },
        }
      );

      expect(callbackRes.status).toBe(302);
      expect(callbackRes.headers.get("location")).toBe("/dashboard");
    }
  });
});

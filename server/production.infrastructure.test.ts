import { describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import { getSessionCookieOptions, getCsrfCookieOptions } from "./_core/cookies";
import { createMemoryRateLimiter } from "./_core/rateLimit";
import { hashPassword, comparePassword } from "./_core/authUtils";

describe("Production Infrastructure & Security", () => {
  describe("Health Check Endpoints", () => {
    it("deve retornar 200 e status ok quando o banco está saudável", async () => {
      const app = express();
      const mockDb = {
        execute: vi.fn().mockResolvedValue([{ 1: 1 }]),
      };

      app.get(["/health", "/api/health"], async (_req, res) => {
        try {
          await mockDb.execute();
          return res.status(200).json({
            status: "ok",
            database: "connected",
            uptime: Math.floor(process.uptime()),
            timestamp: new Date().toISOString(),
          });
        } catch {
          return res.status(503).json({ status: "unhealthy" });
        }
      });

      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(res.body.database).toBe("connected");
      expect(typeof res.body.uptime).toBe("number");
      expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);

      const resApi = await request(app).get("/api/health");
      expect(resApi.status).toBe(200);
      expect(resApi.body.status).toBe("ok");
    });

    it("deve retornar 503 quando o banco de dados falha", async () => {
      const app = express();
      const mockDb = {
        execute: vi.fn().mockRejectedValue(new Error("Connection timeout")),
      };

      app.get("/health", async (_req, res) => {
        try {
          await mockDb.execute();
          return res.status(200).json({ status: "ok" });
        } catch {
          return res.status(503).json({
            status: "unhealthy",
            database: "error",
            timestamp: new Date().toISOString(),
          });
        }
      });

      const res = await request(app).get("/health");
      expect(res.status).toBe(503);
      expect(res.body.status).toBe("unhealthy");
      expect(res.body.database).toBe("error");
    });
  });

  describe("Session & CSRF Cookie Security", () => {
    it("deve configurar SameSite=lax e Secure=false em ambiente local", () => {
      const localReq = {
        hostname: "localhost",
        protocol: "http",
        headers: {},
      } as any;

      const sessionOpts = getSessionCookieOptions(localReq);
      expect(sessionOpts.httpOnly).toBe(true);
      expect(sessionOpts.path).toBe("/");
      expect(sessionOpts.sameSite).toBe("lax");
      expect(sessionOpts.secure).toBe(false);

      const csrfOpts = getCsrfCookieOptions(localReq);
      expect(csrfOpts.httpOnly).toBe(false);
      expect(csrfOpts.sameSite).toBe("lax");
    });

    it("deve configurar SameSite=lax e Secure=true em ambiente com HTTPS remoto", () => {
      const remoteHttpsReq = {
        hostname: "sanctificare.app",
        protocol: "https",
        headers: {
          "x-forwarded-proto": "https",
        },
      } as any;

      const opts = getSessionCookieOptions(remoteHttpsReq);
      expect(opts.httpOnly).toBe(true);
      expect(opts.path).toBe("/");
      expect(opts.sameSite).toBe("lax");
      expect(opts.secure).toBe(true);
    });

    it("deve forçar Secure=true quando NODE_ENV=production", () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = "production";
        const prodReq = {
          hostname: "sanctificare.app",
          protocol: "http",
          headers: {},
        } as any;

        const opts = getSessionCookieOptions(prodReq);
        expect(opts.secure).toBe(true);
        expect(opts.sameSite).toBe("lax");
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });

  describe("In-Memory Rate Limiting", () => {
    it("deve permitir requisições até o limite e bloquear tentativas excedentes", () => {
      const limiter = createMemoryRateLimiter({
        windowMs: 60_000,
        maxEntries: 100,
      });

      const key = "ip-test-123";
      expect(limiter.allow(key, 3)).toBe(true);
      expect(limiter.allow(key, 3)).toBe(true);
      expect(limiter.allow(key, 3)).toBe(true);
      // 4ª tentativa deve ser bloqueada
      expect(limiter.allow(key, 3)).toBe(false);
      expect(limiter.allow(key, 3)).toBe(false);
    });

    it("deve isolar contadores para chaves/IPs distintos", () => {
      const limiter = createMemoryRateLimiter({
        windowMs: 60_000,
        maxEntries: 100,
      });

      expect(limiter.allow("ip-alice", 1)).toBe(true);
      expect(limiter.allow("ip-alice", 1)).toBe(false);

      // IP do Bob deve estar liberado
      expect(limiter.allow("ip-bob", 1)).toBe(true);
    });
  });

  describe("Password Hashing & Verification (PBKDF2 Async)", () => {
    it("deve gerar hashes com salteamento único para a mesma senha", async () => {
      const plainPassword = "SenhaForte@Sanctificare2026";
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);

      expect(hash1).not.toBe(hash2);
      expect(hash1).toContain(":");
      expect(hash2).toContain(":");

      const [salt1, key1] = hash1.split(":");
      const [salt2, key2] = hash2.split(":");

      expect(salt1).not.toBe(salt2);
      expect(key1).not.toBe(key2);
    });

    it("deve validar senhas corretas e rejeitar senhas incorretas", async () => {
      const plainPassword = "MinhaSenhaSecreta#123";
      const hashedPassword = await hashPassword(plainPassword);

      const isValid = await comparePassword(plainPassword, hashedPassword);
      expect(isValid).toBe(true);

      const isInvalid = await comparePassword("SenhaErrada#456", hashedPassword);
      expect(isInvalid).toBe(false);
    });
  });
});

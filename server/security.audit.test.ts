import { describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import { escapeHtml } from "./_core/email";
import { getAllowedOrigins } from "./_core/security";
import { getSessionCookieOptions } from "./_core/cookies";
import { authRouter } from "./_core/authRoutes";

describe("Security Audit & Hardening Suite", () => {
  describe("XSS / HTML Sanitization (SEC-01)", () => {
    it("deve escapar tags HTML e caracteres especiais em nomes de usuários", () => {
      const maliciousName = '<script>alert("xss")</script> & <a href="http://evil.com">link</a>';
      const sanitized = escapeHtml(maliciousName);

      expect(sanitized).not.toContain("<script>");
      expect(sanitized).not.toContain("</script>");
      expect(sanitized).not.toContain("<a ");
      expect(sanitized).toContain("&lt;script&gt;");
      expect(sanitized).toContain("&amp;");
      expect(sanitized).toContain("&quot;xss&quot;");
    });

    it("deve escapar aspas simples e duplas para prevenir quebras de atributos HTML", () => {
      const input = `João "Dev" D'Ávila`;
      const sanitized = escapeHtml(input);

      expect(sanitized).toBe("João &quot;Dev&quot; D&#039;Ávila");
    });
  });

  describe("CORS Production Hardening (SEC-05)", () => {
    it("não deve expor portas de desenvolvimento local (5173, 3000) quando em produção", () => {
      const originalEnv = process.env.NODE_ENV;
      const originalAllowed = process.env.ALLOWED_ORIGINS;
      const originalAppUrl = process.env.APP_URL;

      try {
        process.env.NODE_ENV = "production";
        delete process.env.ALLOWED_ORIGINS;
        delete process.env.APP_URL;

        const origins = getAllowedOrigins();

        expect(origins.has("http://localhost:5173")).toBe(false);
        expect(origins.has("http://localhost:3000")).toBe(false);
        expect(origins.has("http://localhost")).toBe(false);
        expect(origins.has("capacitor://localhost")).toBe(true);
      } finally {
        process.env.NODE_ENV = originalEnv;
        if (originalAllowed !== undefined) process.env.ALLOWED_ORIGINS = originalAllowed;
        if (originalAppUrl !== undefined) process.env.APP_URL = originalAppUrl;
      }
    });

    it("deve incluir portas de desenvolvimento local quando em ambiente não-produção", () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = "development";
        delete process.env.ALLOWED_ORIGINS;

        const origins = getAllowedOrigins();

        expect(origins.has("http://localhost:5173")).toBe(true);
        expect(origins.has("http://localhost:3000")).toBe(true);
        expect(origins.has("capacitor://localhost")).toBe(true);
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });

  describe("Brute Force & Timing Attack Mitigation on Login (SEC-02 & SEC-03)", () => {
    const createTestApp = () => {
      const app = express();
      app.use(express.json());
      app.use("/api/auth", authRouter);
      return app;
    };

    it("deve rejeitar e-mail não cadastrado com 401 (sem revelar inexistência da conta)", async () => {
      const app = createTestApp();
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "usuario-inexistente-seguranca@sanctificare.local",
          password: "SenhaErrada123!",
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("E-mail ou senha incorretos.");
    });

    it("deve bloquear tentativas excessivas para o mesmo e-mail (rate limiting por conta)", async () => {
      const app = createTestApp();
      const targetEmail = `bruteforce-target-${Date.now()}@sanctificare.local`;

      // Simula 10 tentativas incorretas
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post("/api/auth/login")
          .send({
            email: targetEmail,
            password: `TentativaErrada${i}!`,
          });
      }

      // A 11ª tentativa deve ser bloqueada por rate limiting por conta (HTTP 429)
      const blockedRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: targetEmail,
          password: "OutraTentativa123!",
        });

      expect(blockedRes.status).toBe(429);
      expect(blockedRes.body.error).toContain("Muitas tentativas para esta conta");
    }, 15000);
  });

  describe("Cookie & Session Security Guardrails (SEC-08)", () => {
    it("deve configurar cookies com HttpOnly, SameSite=Lax e Secure em produção", () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = "production";
        const req = {
          hostname: "app.sanctificare.com.br",
          protocol: "https",
          headers: {},
        } as any;

        const opts = getSessionCookieOptions(req);
        expect(opts.httpOnly).toBe(true);
        expect(opts.sameSite).toBe("lax");
        expect(opts.secure).toBe(true);
        expect(opts.path).toBe("/");
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });
});

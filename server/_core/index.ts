import "dotenv/config";

// Auto-detect production build and normalize environment variables to prevent local/dev overrides in production.
const isCompiled = import.meta.url.includes("/dist/") || import.meta.url.endsWith("dist/index.js");
if (isCompiled) {
  process.env.NODE_ENV = "production";
  process.env.DEV_AUTH_BYPASS = "0";
}

import path from "path";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { parse as parseCookie } from "cookie";
import { COOKIE_NAME } from "../../shared/const";
import { getCsrfCookieOptions } from "./cookies";
import { ENV } from "./env";
import { registerOAuthRoutes } from "./oauth";
import { authRouter } from "./authRoutes";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  generateCsrfToken,
  getAllowedOrigins,
  isTrustedUnsafeRequestSource,
} from "./security";
import { serveStatic, setupVite } from "./vite";
import { sdk } from "./sdk";
import { upsertDailyLiturgy, getDb } from "../db";
import { fetchLiturgyForDate, todayIsoSaoPaulo } from "../liturgia";
import { handleStripeWebhook } from "../stripe-webhook";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

function isSecureRequest(req: express.Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

async function assertPortAvailable(port: number): Promise<void> {
  if (await isPortAvailable(port)) {
    return;
  }

  throw new Error(
    `Port ${port} is already in use. Stop the old Sanctificare server before starting a new one.`
  );
}

/**
 * Handler do cron Heartbeat. Busca a liturgia de hoje e de amanhã (fuso de
 * São Paulo) e grava no banco. Ignora o corpo da requisição — o trigger é
 * project-level (§4a de references/periodic-updates.md), então não há linha
 * de negócio a localizar por taskUid.
 */
async function fetchLiturgiaHandler(req: express.Request, res: express.Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    const today = todayIsoSaoPaulo();
    const tomorrowDate = new Date(`${today}T12:00:00Z`);
    tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);
    const tomorrow = tomorrowDate.toISOString().slice(0, 10);

    const results: Record<string, "ok" | "failed"> = {};
    for (const date of [today, tomorrow]) {
      try {
        const entry = await fetchLiturgyForDate(date);
        await upsertDailyLiturgy(entry);
        results[date] = "ok";
      } catch (error) {
        // Não derruba o dia que funcionou; registra a falha do outro.
        console.error(`[Liturgy] Falha ao buscar ${date}:`, error);
        results[date] = "failed";
      }
    }

    // Se nenhum dia foi gravado, sinaliza 500 para o platform reagendar (retry).
    if (Object.values(results).every(v => v === "failed")) {
      return res.status(500).json({
        error: "Nenhuma liturgia pôde ser buscada",
        context: { url: req.originalUrl, taskUid: user.taskUid, results },
        timestamp: new Date().toISOString(),
      });
    }

    return res.json({ ok: true, results });
  } catch (error) {
    const err = error as Error;
    const payload: Record<string, unknown> = {
      error: err.message,
      context: { url: req.originalUrl },
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === "development") {
      payload.stack = err.stack;
    }

    return res.status(500).json({
      ...payload,
    });
  }
}

async function startServer() {
  if (process.env.NODE_ENV !== "development" && process.env.DEV_AUTH_BYPASS === "1") {
    throw new Error("DEV_AUTH_BYPASS must never be enabled outside development");
  }

  // Run programmatic database migrations if in production
  if (process.env.NODE_ENV === "production") {
    try {
      const db = await getDb();
      if (db) {
        const migrationsFolder = path.resolve(import.meta.dirname, "drizzle");
        console.log("[Database] Running programmatic migrations from:", migrationsFolder);
        await migrate(db, { migrationsFolder });
        console.log("[Database] Programmatic migrations completed successfully.");
      } else {
        console.warn("[Database] DATABASE_URL not configured. Skipping startup migrations.");
      }
    } catch (error) {
      console.warn("[Database] Programmatic migration warning/error at startup:", error);
    }
  }

  const app = express();
  app.set("trust proxy", true);

  // Register Stripe webhook before global json parser to parse raw body
  app.post("/api/stripe-webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

  const server = createServer(app);
  const allowedOrigins = getAllowedOrigins();

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.use((req, res, next) => {
    const host = req.get("host");
    const requestOrigin = host
      ? `${isSecureRequest(req) ? "https" : "http"}://${host}`
      : null;

    const cookies = req.headers.cookie ? parseCookie(req.headers.cookie) : {};
    const hasSessionCookie = Boolean(cookies[COOKIE_NAME]);
    const csrfCookieToken = cookies[CSRF_COOKIE_NAME];

    if (hasSessionCookie && !csrfCookieToken) {
      res.cookie(CSRF_COOKIE_NAME, generateCsrfToken(), {
        ...getCsrfCookieOptions(req),
        maxAge: ENV.sessionTtlMs,
      });
    }

    const isUnsafeMethod = !["GET", "HEAD", "OPTIONS"].includes(req.method);
    const isCsrfExemptPath =
      req.path === "/api/scheduled/fetchLiturgia" ||
      req.path === "/api/auth/logout" ||
      req.path === "/api/stripe-webhook";

    if (!isUnsafeMethod || !hasSessionCookie || isCsrfExemptPath) {
      return next();
    }

    if (!isTrustedUnsafeRequestSource(req, allowedOrigins, requestOrigin)) {
      return res.status(403).json({ error: "Request source not trusted" });
    }

    if (!csrfCookieToken) {
      return res.status(403).json({ error: "CSRF cookie missing" });
    }

    const csrfHeaderToken = req.header(CSRF_HEADER_NAME);
    if (!csrfHeaderToken || csrfHeaderToken !== csrfCookieToken) {
      return res.status(403).json({ error: "CSRF validation failed" });
    }

    return next();
  });

  // Custom CORS middleware to handle local Capacitor and dev origins
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const host = req.get("host");
    const requestOrigin = host
      ? `${isSecureRequest(req) ? "https" : "http"}://${host}`
      : null;

    const originAllowed =
      !origin ||
      allowedOrigins.has(origin) ||
      (!!requestOrigin && origin === requestOrigin);

    if (!originAllowed) {
      return res.status(403).json({ error: "Origin not allowed" });
    }

    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }

    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,HEAD");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, X-CSRF-Token"
    );
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use("/api/auth", authRouter);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // Cron: busca diária da liturgia (hoje + amanhã) e grava no banco.
  // Idempotente: o upsert sobrescreve a linha da data caso já exista.
  app.post("/api/scheduled/fetchLiturgia", fetchLiturgiaHandler);
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3000");
  await assertPortAvailable(port);

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { sdk } from "./sdk";
import { upsertDailyLiturgy } from "../db";
import { fetchLiturgyForDate, todayIsoSaoPaulo } from "../liturgia";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
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
    return res.status(500).json({
      error: err.message,
      stack: err.stack,
      context: { url: req.originalUrl },
      timestamp: new Date().toISOString(),
    });
  }
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
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

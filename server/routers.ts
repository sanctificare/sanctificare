import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getCsrfCookieOptions, getSessionCookieOptions } from "./_core/cookies";
import { CSRF_COOKIE_NAME, generateCsrfToken, isDevAuthBypassEnabled } from "./_core/security";
import { ENV } from "./_core/env";
import { systemRouter } from "./_core/systemRouter";
import Stripe from "stripe";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod/v4";
import { TRPCError } from "@trpc/server";
import { sdk } from "./_core/sdk";
import { hashPassword, comparePassword } from "./_core/authUtils";
import { sendPasswordResetEmail } from "./_core/email";
import { nanoid } from "nanoid";
import {
  insertPrayerLog,
  getPrayerLogsByUser,
  getActiveIntentions,
  createIntention,
  getPrayedIntentionsByUser,
  recordIntentionPrayer,
  addIntentionMessage,
  getIntentionMessages,
  markGraceObtained,
  deleteIntention,
  updateIntention,
  getActiveSubscription,
  createSubscription,
  cancelSubscription,
  updateTemplatePreference,
  getTemplatePreference,
  getDailyLiturgy,
  upsertLectioJournalEntry,
  getLectioJournalEntry,
  listRecentLectioJournalEntries,
  getUserByEmail,
  createUser,
  createPasswordResetToken,
  validatePasswordResetToken,
  consumePasswordResetToken,
  getDailyPlanStatus,
} from "./db";
import { fetchLiturgyForDate, todayIsoSaoPaulo } from "./liturgia";
import axios from "axios";
import https from "https";

const AUTH_RATE_WINDOW_MS = 15 * 60 * 1000;
const registerRateMap = new Map<string, { count: number; resetAt: number }>();
const loginRateMap = new Map<string, { count: number; resetAt: number }>();
const forgotRateMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(ctx: { req: { ip?: string; socket?: { remoteAddress?: string | null } } }) {
  return ctx.req.ip || ctx.req.socket?.remoteAddress || "unknown";
}

function checkRateLimit(
  map: Map<string, { count: number; resetAt: number }>,
  key: string,
  maxAttempts: number,
  windowMs: number
) {
  const now = Date.now();
  const entry = map.get(key);

  if (!entry || entry.resetAt <= now) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  entry.count += 1;
  map.set(key, entry);

  if (entry.count > maxAttempts) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Muitas tentativas. Tente novamente em alguns minutos.",
    });
  }
}

export const appRouter = router({
  system: systemRouter,



  prayers: router({
    logPrayer: protectedProcedure
      .input(z.object({
        prayerType: z.string(),
        prayerName: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          await insertPrayerLog(ctx.user.id, input.prayerType, input.prayerName);
          return { success: true };
        } catch (error) {
          console.error("[Prayer Log Error]", error);
          throw error;
        }
      }),

    getRecentLogs: protectedProcedure
      .query(async ({ ctx }) => {
        return getPrayerLogsByUser(ctx.user.id, 20);
      }),

    getAllLogs: protectedProcedure
      .query(async ({ ctx }) => {
        return getPrayerLogsByUser(ctx.user.id, 200);
      }),
  }),

  intentions: router({
    list: publicProcedure
      .query(async () => {
        return getActiveIntentions(50);
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(5).max(200),
        description: z.string().min(10).max(5000),
        category: z.enum(["cura", "familia", "conversao", "trabalho", "defuntos", "paz"]).nullable().optional(),
        isAnonymous: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createIntention(
          ctx.user.id,
          ctx.user.name || "Fiel Anônimo",
          input.title,
          input.description,
          { category: input.category, isAnonymous: input.isAnonymous }
        );
        return { success: true };
      }),

    pray: protectedProcedure
      .input(z.object({ intentionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const result = await recordIntentionPrayer(input.intentionId, ctx.user.id);
        return { success: true, alreadyPrayed: result.alreadyPrayed };
      }),

    myPrayed: protectedProcedure
      .query(async ({ ctx }) => {
        const rows = await getPrayedIntentionsByUser(ctx.user.id);
        return rows.map(r => r.intentionId);
      }),

    addMessage: protectedProcedure
      .input(z.object({
        intentionId: z.number(),
        message: z.string().min(3).max(300),
        isAnonymous: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await addIntentionMessage(
          input.intentionId,
          ctx.user.id,
          ctx.user.name || "Fiel Anônimo",
          input.message,
          input.isAnonymous ?? false
        );
        return { success: true };
      }),

    listMessages: publicProcedure
      .input(z.object({ intentionId: z.number() }))
      .query(async ({ input }) => {
        return getIntentionMessages(input.intentionId);
      }),

    markGrace: protectedProcedure
      .input(z.object({ intentionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markGraceObtained(input.intentionId, ctx.user.id);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ intentionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteIntention(input.intentionId, ctx.user.id);
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        intentionId: z.number(),
        description: z.string().min(10).max(5000),
        category: z.enum(["cura", "familia", "conversao", "trabalho", "defuntos", "paz"]).nullable().optional(),
        isAnonymous: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateIntention(input.intentionId, ctx.user.id, {
          description: input.description,
          category: input.category,
          isAnonymous: input.isAnonymous,
        });
        return { success: true };
      }),
  }),

  subscriptions: router({
    getActive: protectedProcedure
      .query(async ({ ctx }) => {
        return getActiveSubscription(ctx.user.id);
      }),

    subscribe: protectedProcedure
      .input(z.object({ plan: z.enum(["monthly", "annual"]) }))
      .mutation(async ({ ctx, input }) => {
        if (ENV.stripeSecretKey) {
          const stripe = new Stripe(ENV.stripeSecretKey, { apiVersion: "2023-10-16" as any });
          const priceId = input.plan === "annual" ? ENV.stripePriceAnnual : ENV.stripePriceMonthly;
          if (!priceId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `ID de preço não configurado para o plano: ${input.plan}`,
            });
          }

          const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: "subscription",
            success_url: `${ENV.appUrl}/premium?success=true`,
            cancel_url: `${ENV.appUrl}/premium?cancelled=true`,
            metadata: { userId: String(ctx.user.id) },
          });

          return { success: true, url: session.url ?? undefined };
        }

        // Fallback to mock
        await createSubscription(ctx.user.id, input.plan);
        return { success: true };
      }),

    cancel: protectedProcedure
      .mutation(async ({ ctx }) => {
        await cancelSubscription(ctx.user.id);
        return { success: true };
      }),

    createPortalSession: protectedProcedure
      .mutation(async ({ ctx }) => {
        const activeSub = await getActiveSubscription(ctx.user.id);
        if (!activeSub || !activeSub.stripeCustomerId || !ENV.stripeSecretKey) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Nenhuma assinatura do Stripe ativa foi encontrada para este usuário.",
          });
        }

        const stripe = new Stripe(ENV.stripeSecretKey, { apiVersion: "2023-10-16" as any });
        const session = await stripe.billingPortal.sessions.create({
          customer: activeSub.stripeCustomerId,
          return_url: `${ENV.appUrl}/premium`,
        });

        return { url: session.url };
      }),
  }),

  templates: router({
    getPreference: protectedProcedure
      .query(async ({ ctx }) => {
        return getTemplatePreference(ctx.user.id);
      }),

    setPreference: protectedProcedure
      .input(z.object({ template: z.enum(["classico", "moderno", "tradicional", "minimalista"]) }))
      .mutation(async ({ ctx, input }) => {
        await updateTemplatePreference(ctx.user.id, input.template);
        return { success: true };
      }),
  }),

  liturgy: router({
    // Liturgia do dia (ou de uma data "YYYY-MM-DD"). Lê do banco; se ainda não
    // foi gravada pelo cron, busca da API como fallback e devolve sem persistir.
    getByDate: publicProcedure
      .input(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() }).optional())
      .query(async ({ input }) => {
        const date = input?.date ?? todayIsoSaoPaulo();
        const stored = await getDailyLiturgy(date);
        if (stored) return stored;
        try {
          return await fetchLiturgyForDate(date);
        } catch (error) {
          console.error("[Liturgy] Fallback fetch failed:", error);
          return null;
        }
      }),

    getSantoDoDia: publicProcedure
      .query(async (): Promise<{ name: string; biography: string; quote: string | null } | null> => {
        try {
          const agent = new https.Agent({ rejectUnauthorized: false });
          const response = await axios.get("https://api-liturgia-diaria.vercel.app/santo-do-dia", {
            httpsAgent: agent,
            timeout: 10000,
          });

          if (response.status !== 200 || !response.data?.today) {
            return null;
          }

          const today = response.data.today;
          const name = today.title || "";
          const fullText = today.full_text || "";

          // Limpa biografia (remove quebras de linha e seções finais)
          let biography = fullText
            .replace(/\r?\n/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          const indexOutros = biography.indexOf("Outros santos");
          if (indexOutros !== -1) {
            biography = biography.substring(0, indexOutros).trim();
          }
          const indexFontes = biography.indexOf("Fontes:");
          if (indexFontes !== -1) {
            biography = biography.substring(0, indexFontes).trim();
          }

          // Limita a duas frases
          const sentences = biography.match(/[^.!?]+[.!?]+/g);
          if (sentences && sentences.length > 2) {
            biography = sentences.slice(0, 2).join("").trim();
          }

          // Extrai frase de destaque
          let quote: string | null = null;
          const quoteRegex = /[“"«]([^”"»]{20,300})[”"»]/g;
          let match;
          while ((match = quoteRegex.exec(fullText)) !== null) {
            const found = match[0].trim();
            if (found) {
              quote = found;
              break;
            }
          }

          return {
            name,
            biography,
            quote,
          };
        } catch (error) {
          console.error("[Santo do Dia Fetch Error]", error);
          return null;
        }
      }),
  }),

  lectioJournal: router({
    getEntry: protectedProcedure
      .input(z.object({
        journalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        passageId: z.string().min(1).max(80),
      }))
      .query(async ({ ctx, input }) => {
        return getLectioJournalEntry(ctx.user.id, input.journalDate, input.passageId);
      }),

    saveEntry: protectedProcedure
      .input(z.object({
        journalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        passageId: z.string().min(1).max(80),
        passageReference: z.string().max(120).nullable().optional(),
        anchoredPhrase: z.string().nullable().optional(),
        personalNote: z.string().nullable().optional(),
        currentStep: z.string().max(20).nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const persisted = await upsertLectioJournalEntry(ctx.user.id, input);
        return { success: persisted };
      }),

    listRecent: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(20).optional() }).optional())
      .query(async ({ ctx, input }) => {
        return listRecentLectioJournalEntries(ctx.user.id, input?.limit ?? 8);
      }),
  }),

  dailyPlan: router({
    getStatus: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          return await getDailyPlanStatus(ctx.user.id);
        } catch (error) {
          console.error("[Daily Plan Error]", error);
          throw error;
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod/v4";
import { TRPCError } from "@trpc/server";
import { sdk } from "./_core/sdk";
import { hashPassword, comparePassword } from "./_core/authUtils";
import {
  insertPrayerLog,
  getPrayerLogsByUser,
  getActiveIntentions,
  createIntention,
  getPrayedIntentionsByUser,
  recordIntentionPrayer,
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
  insertVirtualCandle,
  getActiveVirtualCandles,
  recordCandlePrayer,
} from "./db";
import { fetchLiturgyForDate, todayIsoSaoPaulo } from "./liturgia";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    register: publicProcedure
      .input(z.object({
        name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
        email: z.string().email("E-mail inválido"),
        password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
      }))
      .mutation(async ({ ctx, input }) => {
        const existingUser = await getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Este e-mail já está cadastrado.",
          });
        }

        const passwordHash = hashPassword(input.password);
        const newUser = await createUser({
          openId: input.email,
          email: input.email,
          name: input.name,
          passwordHash,
          loginMethod: "credentials",
          role: "user",
        });

        const token = await sdk.createSessionToken(newUser.openId, { name: newUser.name || "" });
        const cookieOptions = getSessionCookieOptions(ctx.req);

        if (process.env.NODE_ENV === "development" && process.env.DEV_AUTH_BYPASS === "1") {
          ctx.res.clearCookie("dev_logged_out", { ...cookieOptions, maxAge: -1 });
        }

        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return {
          success: true,
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
          },
        };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email("E-mail inválido"),
        password: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await getUserByEmail(input.email);
        if (!user || !user.passwordHash || !comparePassword(input.password, user.passwordHash)) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "E-mail ou senha incorretos.",
          });
        }

        const token = await sdk.createSessionToken(user.openId, { name: user.name || "" });
        const cookieOptions = getSessionCookieOptions(ctx.req);

        if (process.env.NODE_ENV === "development" && process.env.DEV_AUTH_BYPASS === "1") {
          ctx.res.clearCookie("dev_logged_out", { ...cookieOptions, maxAge: -1 });
        }

        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      if (process.env.NODE_ENV === "development" && process.env.DEV_AUTH_BYPASS === "1") {
        ctx.res.cookie("dev_logged_out", "1", { ...cookieOptions, maxAge: ONE_YEAR_MS });
      }
      return { success: true } as const;
    }),
  }),

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
        description: z.string().min(10),
      }))
      .mutation(async ({ ctx, input }) => {
        await createIntention(
          ctx.user.id,
          ctx.user.name || "Fiel Anônimo",
          input.title,
          input.description
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
  }),

  subscriptions: router({
    getActive: protectedProcedure
      .query(async ({ ctx }) => {
        return getActiveSubscription(ctx.user.id);
      }),

    subscribe: protectedProcedure
      .input(z.object({ plan: z.enum(["monthly", "annual"]) }))
      .mutation(async ({ ctx, input }) => {
        await createSubscription(ctx.user.id, input.plan);
        return { success: true };
      }),

    cancel: protectedProcedure
      .mutation(async ({ ctx }) => {
        await cancelSubscription(ctx.user.id);
        return { success: true };
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

  candles: router({
    light: protectedProcedure
      .input(z.object({
        intention: z.string().min(5).max(400),
        type: z.enum(["intencao", "defuntos", "agradecimento", "adoracao"]),
        isAnonymous: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas
        await insertVirtualCandle({
          userId: ctx.user.id,
          authorName: input.isAnonymous ? "Fiel Anônimo" : (ctx.user.name || "Fiel"),
          intention: input.intention,
          type: input.type,
          isAnonymous: input.isAnonymous,
          litAt: now,
          expiresAt,
        });
        return { success: true };
      }),

    listActive: publicProcedure.query(async () => {
      return getActiveVirtualCandles();
    }),

    pray: protectedProcedure
      .input(z.object({ candleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const result = await recordCandlePrayer(input.candleId, ctx.user.id);
        return { success: !result.alreadyPrayed, alreadyPrayed: result.alreadyPrayed };
      }),
  }),
});

export type AppRouter = typeof appRouter;

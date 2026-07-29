import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getCsrfCookieOptions, getSessionCookieOptions } from "./_core/cookies";
import { CSRF_COOKIE_NAME, generateCsrfToken, isDevAuthBypassEnabled } from "./_core/security";
import { ENV } from "./_core/env";
import { systemRouter } from "./_core/systemRouter";

import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
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

  updateTemplatePreference,
  getTemplatePreference,
  getDailyLiturgy,
  upsertDailyLiturgy,
  upsertLectioJournalEntry,
  getLectioJournalEntry,
  listRecentLectioJournalEntries,
  getUserByEmail,
  createUser,
  createPasswordResetToken,
  validatePasswordResetToken,
  consumePasswordResetToken,
  deleteUserAccount,
  getDailyPlanStatus,
  registerPushDevice,
  unregisterPushDeviceByToken,
  getEnabledPushTokensByUser,
  getAdminPushTokens,
  createAdminAuditLog,
  getAdminAuditLogs,
  getUserStateEntries,
  upsertUserStateEntries,
  markUserStateKeysDeleted,
  createSubscription,
  cancelSubscription,
  getActiveSubscription,
  getAdminStats,
  getAdminUsersList,
  getAdminUserDetail,
  toggleUserPremiumStatus,
  getAdminRegistrationGrowth,
  getDb,
  getSpiritualJourneyProgress,
  upsertSpiritualJourneyProgress,
  getSpiritualJourneyJournal,
  upsertSpiritualJourneyJournal,
  deleteSpiritualJourneyJournal,
} from "./db";
import { subscriptions } from "../drizzle/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { fetchLiturgyForDate, todayIsoSaoPaulo } from "./liturgia";
import axios from "axios";
import { getChapter as getBibleChapter, search as searchBible } from "./bible";
import { sendPushToTokens } from "./_core/push";
import { createMemoryRateLimiter } from "./_core/rateLimit";

const PUBLIC_RATE_WINDOW_MS = 60 * 1000;
const ADMIN_QUERY_TIMEOUT_MS = 15_000;
const publicRateLimiter = createMemoryRateLimiter({
  windowMs: PUBLIC_RATE_WINDOW_MS,
  cleanupIntervalMs: 5 * 60 * 1000,
});



type CachedValue<T> = {
  value: T;
  expiresAt: number;
};

const liturgyByDateCache = new Map<string, CachedValue<Awaited<ReturnType<typeof getDailyLiturgy>>>>();
const santoDoDiaCache = new Map<string, CachedValue<{ name: string; biography: string; quote: string | null } | null>>();

function expiresAtNextSaoPauloMidnight(): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayIso = formatter.format(now);
  const [year, month, day] = todayIso.split("-").map(Number);
  const nextSaoPauloMidnightUtc = Date.UTC(year, month - 1, day + 1, 3, 0, 0);
  return nextSaoPauloMidnightUtc;
}

function getCachedValue<T>(cache: Map<string, CachedValue<T>>, key: string): T | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return hit.value;
}

function setCachedValue<T>(cache: Map<string, CachedValue<T>>, key: string, value: T) {
  cache.set(key, {
    value,
    expiresAt: expiresAtNextSaoPauloMidnight(),
  });
}

function getClientIp(ctx: { req: { ip?: string; socket?: { remoteAddress?: string | null } } }) {
  return ctx.req.ip || ctx.req.socket?.remoteAddress || "unknown";
}

function enforceTrpcRateLimit(scope: string, key: string, maxAttempts: number) {
  const namespacedKey = `${scope}:${key}`;
  if (!publicRateLimiter.allow(namespacedKey, maxAttempts)) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Muitas tentativas. Tente novamente em alguns minutos.",
    });
  }
}

function getPublicTrpcErrorMessage(error: unknown, fallback: string): string {
  if (process.env.NODE_ENV === "development") {
    if (error instanceof Error && error.message) {
      return error.message;
    }
  }
  return fallback;
}

async function withAdminQueryTimeout<T>(work: Promise<T>, fallbackMessage: string): Promise<T> {
  let timer: NodeJS.Timeout | null = null;

  try {
    return await Promise.race([
      work,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: fallbackMessage,
          }));
        }, ADMIN_QUERY_TIMEOUT_MS);

        if (typeof timer?.unref === "function") {
          timer.unref();
        }
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

export const appRouter = router({
  system: systemRouter,

  admin: router({
    getStats: adminProcedure.query(async () => {
      try {
        return await withAdminQueryTimeout(
          getAdminStats(),
          "As estatísticas do painel demoraram demais para responder. Tente novamente."
        );
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: getPublicTrpcErrorMessage(err, "Falha ao carregar estatísticas.")
        });
      }
    }),

    getUsersList: adminProcedure
      .input(z.object({
        search: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      }))
      .query(async ({ input }) => {
        try {
          return await withAdminQueryTimeout(
            getAdminUsersList(input.search, input.limit, input.offset),
            "A lista de usuários demorou demais para responder. Tente novamente."
          );
        } catch (err: any) {
          if (err instanceof TRPCError) throw err;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: getPublicTrpcErrorMessage(err, "Falha ao buscar usuários.")
          });
        }
      }),

    getUserDetail: adminProcedure
      .input(z.object({
        userId: z.number().int().positive()
      }))
      .query(async ({ input }) => {
        try {
          const detail = await withAdminQueryTimeout(
            getAdminUserDetail(input.userId),
            "Os detalhes do usuário demoraram demais para responder. Tente novamente."
          );
          if (!detail) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado." });
          }
          return detail;
        } catch (err: any) {
          if (err instanceof TRPCError) throw err;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: getPublicTrpcErrorMessage(err, "Falha ao buscar detalhes do usuário.")
          });
        }
      }),

    togglePremium: adminProcedure
      .input(z.object({
        userId: z.number().int().positive(),
        grant: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const result = await toggleUserPremiumStatus(input.userId, ctx.user.id, input.grant);
          try {
            await createAdminAuditLog({
              actorUserId: ctx.user.id,
              targetUserId: input.userId,
              action: input.grant ? "premium.granted" : "premium.revoked",
              metadata: { source: "admin" },
            });
          } catch (auditError) {
            console.error("[Admin Audit] Failed to record premium change:", auditError);
          }
          return result;
        } catch (err: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: getPublicTrpcErrorMessage(err, "Falha ao alterar status de premium.")
          });
        }
      }),

    getRegistrationGrowth: adminProcedure.query(async () => {
      try {
        return await withAdminQueryTimeout(
          getAdminRegistrationGrowth(),
          "O gráfico de crescimento demorou demais para responder. Tente novamente."
        );
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: getPublicTrpcErrorMessage(err, "Falha ao buscar crescimento de registros.")
        });
      }
    }),

    getAuditLogs: adminProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).default(50) }).optional())
      .query(async ({ input }) => {
        try {
          return await withAdminQueryTimeout(
            getAdminAuditLogs(input?.limit ?? 50),
            "A auditoria demorou demais para responder. Tente novamente."
          );
        } catch (err: any) {
          if (err instanceof TRPCError) throw err;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: getPublicTrpcErrorMessage(err, "Falha ao carregar auditoria."),
          });
        }
      }),

    sendPush: adminProcedure
      .input(z.object({
        audience: z.enum(["all", "premium"]),
        title: z.string().trim().min(1).max(120),
        body: z.string().trim().min(1).max(500),
        screen: z.string().regex(/^\/[a-z0-9\-/]*$/i).max(120).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const tokens = await getAdminPushTokens(input.audience);
          const result = await sendPushToTokens(tokens, {
            title: input.title,
            body: input.body,
            data: {
              kind: "admin_campaign",
              ...(input.screen ? { screen: input.screen } : {}),
            },
          });

          try {
            await createAdminAuditLog({
              actorUserId: ctx.user.id,
              action: "push.sent",
              metadata: {
                audience: input.audience,
                title: input.title,
                sent: result.successCount,
                failed: result.failureCount,
              },
            });
          } catch (auditError) {
            console.error("[Admin Audit] Failed to record push campaign:", auditError);
          }

          return { targeted: tokens.length, sent: result.successCount, failed: result.failureCount };
        } catch (err: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: getPublicTrpcErrorMessage(err, "Falha ao enviar notificações."),
          });
        }
      }),
  }),

  journeys: router({
    getProgress: protectedProcedure
      .input(z.object({ journeyId: z.string() }))
      .query(async ({ ctx, input }) => {
        return getSpiritualJourneyProgress(ctx.user.id, input.journeyId);
      }),

    saveProgress: protectedProcedure
      .input(
        z.object({
          journeyId: z.string(),
          startedAt: z.string(),
          expectedEndAt: z.string(),
          lastAccessedDay: z.number().int().optional(),
          completedDays: z.array(z.number().int()).optional(),
          currentStreak: z.number().int().optional(),
          chosenPenance: z.string().optional(),
          reminderTime: z.string().optional(),
          status: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return upsertSpiritualJourneyProgress(ctx.user.id, input.journeyId, {
          startedAt: input.startedAt,
          expectedEndAt: input.expectedEndAt,
          lastAccessedDay: input.lastAccessedDay,
          completedDays: input.completedDays,
          currentStreak: input.currentStreak,
          chosenPenance: input.chosenPenance,
          reminderTime: input.reminderTime,
          status: input.status,
        });
      }),

    getJournal: protectedProcedure
      .input(z.object({ journeyId: z.string(), dayNumber: z.number().int() }))
      .query(async ({ ctx, input }) => {
        return getSpiritualJourneyJournal(ctx.user.id, input.journeyId, input.dayNumber);
      }),

    saveJournal: protectedProcedure
      .input(
        z.object({
          journeyId: z.string(),
          dayNumber: z.number().int(),
          content: z.string(),
          isFavorite: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return upsertSpiritualJourneyJournal(
          ctx.user.id,
          input.journeyId,
          input.dayNumber,
          input.content,
          input.isFavorite ?? false
        );
      }),

    deleteJournal: protectedProcedure
      .input(z.object({ journeyId: z.string(), dayNumber: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        return deleteSpiritualJourneyJournal(ctx.user.id, input.journeyId, input.dayNumber);
      }),
  }),

  subscriptions: router({
    get: protectedProcedure
      .query(async ({ ctx }) => {
        return getActiveSubscription(ctx.user.id);
      }),

    // Cria uma Stripe Checkout Session e retorna a URL de redirecionamento.
    // Em desenvolvimento (DEV_AUTH_BYPASS), simula a assinatura localmente.
    subscribe: protectedProcedure
      .input(z.object({ plan: z.enum(["monthly", "annual"]) }))
      .mutation(async ({ ctx, input }) => {
        if (ENV.stripeSecretKey && !isDevAuthBypassEnabled(ctx.req)) {
          const Stripe = (await import("stripe")).default;
          const stripe = new Stripe(ENV.stripeSecretKey);

          const priceId = input.plan === "monthly"
            ? ENV.stripePriceMonthly
            : ENV.stripePriceAnnual;

          const successUrl = `${ENV.appUrl}/premium/sucesso?session_id={CHECKOUT_SESSION_ID}`;
          const cancelUrl = `${ENV.appUrl}/premium`;

          // Buscar se o usuário já tem um stripeCustomerId registrado em alguma assinatura anterior
          const db = await getDb();
          let stripeCustomerId: string | undefined = undefined;
          if (db) {
            const existingSubs = await db
              .select({ stripeCustomerId: subscriptions.stripeCustomerId })
              .from(subscriptions)
              .where(
                and(
                  eq(subscriptions.userId, ctx.user.id),
                  isNotNull(subscriptions.stripeCustomerId)
                )
              )
              .limit(1);
            if (existingSubs[0]?.stripeCustomerId) {
              stripeCustomerId = existingSubs[0].stripeCustomerId;
            }
          }

          const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            customer: stripeCustomerId || undefined,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
              userId: String(ctx.user.id),
              plan: input.plan,
            },
            subscription_data: {
              trial_period_days: 14,
              metadata: {
                userId: String(ctx.user.id),
                plan: input.plan,
              },
            },
          });

          return { checkoutUrl: session.url, success: true };
        }
        // Fallback dev: simula assinatura localmente (NUNCA roda em produção)
        if (ENV.isProduction) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Stripe não configurado. Configure STRIPE_SECRET_KEY em produção.",
          });
        }
        await createSubscription(ctx.user.id, input.plan);
        return { checkoutUrl: null, success: true };
      }),

    // Cria uma sessão do Stripe Customer Portal para o assinante gerenciar/cancelar.
    createPortalSession: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (!ENV.stripeSecretKey || isDevAuthBypassEnabled(ctx.req)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Stripe não configurado em dev." });
        }
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(ENV.stripeSecretKey);

        // Buscar qualquer assinatura anterior ou atual do usuário para obter o stripeCustomerId
        const db = await getDb();
        let customerId: string | null = null;
        if (db) {
          const subs = await db
            .select({ stripeCustomerId: subscriptions.stripeCustomerId })
            .from(subscriptions)
            .where(
              and(
                eq(subscriptions.userId, ctx.user.id),
                isNotNull(subscriptions.stripeCustomerId)
              )
            )
            .limit(1);
          customerId = subs[0]?.stripeCustomerId || null;
        }

        if (!customerId) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Assinatura Stripe não encontrada." });
        }
        const session = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${ENV.appUrl}/premium`,
        });
        return { portalUrl: session.url };
      }),

    cancel: protectedProcedure
      .mutation(async ({ ctx }) => {
        await cancelSubscription(ctx.user.id);
        return { success: true };
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

  stateSync: router({
    getAll: protectedProcedure
      .query(async ({ ctx }) => {
        return getUserStateEntries(ctx.user.id);
      }),

    upsertMany: protectedProcedure
      .input(
        z.object({
          entries: z
            .array(
              z.object({
                key: z.string().min(1).max(191),
                value: z.string().max(200_000),
              })
            )
            .min(1)
            .max(500),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const saved = await upsertUserStateEntries(ctx.user.id, input.entries);
        return { success: true, saved } as const;
      }),

    deleteMany: protectedProcedure
      .input(
        z.object({
          keys: z.array(z.string().min(1).max(191)).min(1).max(500),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const deleted = await markUserStateKeysDeleted(ctx.user.id, input.keys);
        return { success: true, deleted } as const;
      }),
  }),

  account: router({
    deleteMe: protectedProcedure
      .mutation(async ({ ctx }) => {
        const result = await deleteUserAccount(ctx.user.id);
        return { success: true, deleted: result.deleted } as const;
      }),
  }),

  liturgy: router({
    // Liturgia do dia (ou de uma data "YYYY-MM-DD"). Lê do banco/cache; se ainda
    // não foi gravada pelo cron, busca da API como fallback e persiste.
    getByDate: publicProcedure
      .input(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() }).optional())
      .query(async ({ input }) => {
        const date = input?.date ?? todayIsoSaoPaulo();
        const cached = getCachedValue(liturgyByDateCache, date);
        if (cached !== undefined) return cached;

        const stored = await getDailyLiturgy(date);
        if (stored) {
          setCachedValue(liturgyByDateCache, date, stored);
          return stored;
        }

        try {
          const fetched = await fetchLiturgyForDate(date);
          await upsertDailyLiturgy(fetched);
          const persisted = await getDailyLiturgy(date);
          setCachedValue(liturgyByDateCache, date, persisted);
          return persisted;
        } catch (error) {
          console.error("[Liturgy] Fallback fetch failed:", error);
          return null;
        }
      }),

    getSantoDoDia: publicProcedure
      .query(async ({ ctx }): Promise<{ name: string; biography: string; quote: string | null } | null> => {
        const ip = getClientIp(ctx);
        enforceTrpcRateLimit("santo", ip, 30);

        const date = todayIsoSaoPaulo();
        const cached = getCachedValue(santoDoDiaCache, date);
        if (cached !== undefined) return cached;

        try {
          const response = await axios.get("https://api-liturgia-diaria.vercel.app/santo-do-dia", {
            timeout: 10000,
          });

          if (response.status !== 200 || !response.data?.today) {
            setCachedValue(santoDoDiaCache, date, null);
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

          const result = {
            name,
            biography,
            quote,
          };
          setCachedValue(santoDoDiaCache, date, result);
          return result;
        } catch (error) {
          console.error("[Santo do Dia Fetch Error]", error);
          setCachedValue(santoDoDiaCache, date, null);
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

  push: router({
    registerDevice: protectedProcedure
      .input(
        z.object({
          token: z.string().min(20).max(4096),
          platform: z.enum(["android", "ios", "web"]),
          deviceId: z.string().max(128).optional().nullable(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await registerPushDevice(ctx.user.id, input);
        return { success: true } as const;
      }),

    unregisterDevice: protectedProcedure
      .input(z.object({ token: z.string().min(20).max(4096) }))
      .mutation(async ({ ctx, input }) => {
        await unregisterPushDeviceByToken(ctx.user.id, input.token);
        return { success: true } as const;
      }),

    sendTestToMe: protectedProcedure
      .mutation(async ({ ctx }) => {
        const tokens = await getEnabledPushTokensByUser(ctx.user.id);
        if (tokens.length === 0) {
          return { success: false, reason: "no_devices" } as const;
        }

        const result = await sendPushToTokens(tokens, {
          title: "Sanctificare",
          body: "Push remoto ativo. Que sua jornada de oração seja abençoada!",
          data: { screen: "/perfil", kind: "test" },
        });

        if (ctx.user.role === "admin") {
          try {
            await createAdminAuditLog({
              actorUserId: ctx.user.id,
              action: "push.test_sent",
              metadata: {
                sent: result.successCount,
                failed: result.failureCount,
              },
            });
          } catch (auditError) {
            console.error("[Admin Audit] Failed to record test push:", auditError);
          }
        }

        return {
          success: result.successCount > 0,
          sent: result.successCount,
          failed: result.failureCount,
        } as const;
      }),
  }),

  bible: router({
    getChapter: publicProcedure
      .input(z.object({
        bookId: z.string(),
        chapter: z.number().int().positive()
      }))
      .query(async ({ ctx, input }) => {
        const ip = getClientIp(ctx);
        enforceTrpcRateLimit("bible-chapter", ip, 120);

        try {
          return getBibleChapter(input.bookId, input.chapter);
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: getPublicTrpcErrorMessage(error, "Erro ao carregar o capítulo da Bíblia."),
          });
        }
      }),

    search: publicProcedure
      .input(z.object({
        query: z.string().min(3)
      }))
      .query(async ({ ctx, input }) => {
        const ip = getClientIp(ctx);
        enforceTrpcRateLimit("bible-search", ip, 45);

        try {
          return searchBible(input.query);
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: getPublicTrpcErrorMessage(error, "Erro ao realizar a busca na Bíblia."),
          });
        }
      })
  }),
});

export type AppRouter = typeof appRouter;

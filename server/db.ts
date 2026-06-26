import { eq, desc, and, or, sql, gt, isNull } from "drizzle-orm";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  InsertLectioJournal,
  users,
  prayerLogs,
  prayerIntentions,
  intentionPrayers,
  intentionMessages,
  subscriptions,
  dailyLiturgy,
  InsertDailyLiturgy,
  lectioJournal,
  virtualCandles,
  candlePrayers,
  InsertVirtualCandle,
  passwordResetTokens,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: PostgresJsDatabase | null = null;
let _bootstrapPromise: Promise<void> | null = null;

async function bootstrapDb(sql: any) {
  try {
    // 1. Create enum types safely
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
          CREATE TYPE role AS ENUM ('user', 'admin');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'templatePreference') THEN
          CREATE TYPE "templatePreference" AS ENUM ('classico', 'moderno', 'tradicional', 'minimalista');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan') THEN
          CREATE TYPE plan AS ENUM ('monthly', 'annual');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
          CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'intention_category') THEN
          CREATE TYPE intention_category AS ENUM ('cura', 'familia', 'conversao', 'trabalho', 'defuntos', 'paz');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'candle_type') THEN
          CREATE TYPE candle_type AS ENUM ('intencao', 'defuntos', 'agradecimento', 'adoracao');
        END IF;
      END
      $$;
    `;

    // 2. Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id serial PRIMARY KEY,
        "openId" varchar(64) NOT NULL UNIQUE,
        name text,
        email varchar(320),
        "loginMethod" varchar(64),
        role role DEFAULT 'user' NOT NULL,
        "templatePreference" "templatePreference" DEFAULT 'classico' NOT NULL,
        "passwordHash" text,
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL,
        "lastSignedIn" timestamp DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id serial PRIMARY KEY,
        "userId" integer NOT NULL,
        plan plan NOT NULL,
        status subscription_status DEFAULT 'active' NOT NULL,
        "startedAt" timestamp DEFAULT now() NOT NULL,
        "expiresAt" timestamp NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS prayer_logs (
        id serial PRIMARY KEY,
        "userId" integer NOT NULL,
        "prayerType" varchar(64) NOT NULL,
        "prayerName" varchar(128) NOT NULL,
        "completedAt" timestamp DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS prayer_intentions (
        id serial PRIMARY KEY,
        "userId" integer NOT NULL,
        "authorName" varchar(128) NOT NULL,
        title varchar(200) NOT NULL,
        description text NOT NULL,
        category intention_category,
        "isAnonymous" boolean DEFAULT false NOT NULL,
        "prayerCount" integer DEFAULT 0 NOT NULL,
        "isActive" boolean DEFAULT true NOT NULL,
        "graceObtained" boolean DEFAULT false NOT NULL,
        "expiresAt" timestamp,
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS intention_prayers (
        id serial PRIMARY KEY,
        "intentionId" integer NOT NULL,
        "userId" integer NOT NULL,
        "prayedAt" timestamp DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS intention_messages (
        id serial PRIMARY KEY,
        "intentionId" integer NOT NULL,
        "userId" integer NOT NULL,
        "authorName" varchar(128) NOT NULL,
        "isAnonymous" boolean DEFAULT false NOT NULL,
        message varchar(300) NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS daily_liturgy (
        id serial PRIMARY KEY,
        "liturgyDate" varchar(10) NOT NULL UNIQUE,
        celebration text,
        color varchar(32),
        "firstReading" jsonb,
        psalm jsonb,
        "secondReading" jsonb,
        gospel jsonb,
        prayers jsonb,
        antiphons jsonb,
        source varchar(128) DEFAULT 'liturgia.up.railway.app' NOT NULL,
        "fetchedAt" timestamp DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS lectio_journal (
        id serial PRIMARY KEY,
        "userId" integer NOT NULL,
        "journalDate" varchar(10) NOT NULL,
        "passageId" varchar(80) NOT NULL,
        "passageReference" varchar(120),
        "anchoredPhrase" text,
        "personalNote" text,
        "currentStep" varchar(20),
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS lectio_journal_user_date_passage_uq 
      ON lectio_journal ("userId", "journalDate", "passageId");
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS virtual_candles (
        id serial PRIMARY KEY,
        "userId" integer NOT NULL,
        "authorName" varchar(128) NOT NULL,
        intention text NOT NULL,
        type candle_type DEFAULT 'intencao' NOT NULL,
        "isAnonymous" boolean DEFAULT false NOT NULL,
        "prayerCount" integer DEFAULT 0 NOT NULL,
        "litAt" timestamp DEFAULT now() NOT NULL,
        "expiresAt" timestamp NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS candle_prayers (
        id serial PRIMARY KEY,
        "candleId" integer NOT NULL,
        "userId" integer NOT NULL,
        "prayedAt" timestamp DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id serial PRIMARY KEY,
        "userId" integer NOT NULL,
        token varchar(128) NOT NULL UNIQUE,
        "expiresAt" timestamp NOT NULL,
        "usedAt" timestamp,
        "createdAt" timestamp DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS prt_token_idx ON password_reset_tokens (token);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS prt_user_idx ON password_reset_tokens ("userId");
    `;

    console.log("[Database] Bootstrap completed: all tables and types verified.");
  } catch (error) {
    console.error("[Database] Bootstrap failed:", error);
  }
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db) {
    const dbUrl = process.env.DATABASE_URL;
    const host = process.env.DB_HOST;
    if (dbUrl || host) {
      try {
        let client;
        if (dbUrl) {
          try {
            // Robust parsing of DATABASE_URL to avoid URL malformed errors
            // or connection string parsing issues with special characters in password.
            const parsed = new URL(dbUrl);
            const username = decodeURIComponent(parsed.username);
            let password = decodeURIComponent(parsed.password);
            
            // Handle double URL-encoding just in case
            if (password.includes("%")) {
              try {
                password = decodeURIComponent(password);
              } catch (_) {}
            }
            
            const database = parsed.pathname.replace(/^\//, "") || "postgres";
            const hostname = parsed.hostname;
            const port = parsed.port ? parseInt(parsed.port) : 5432;
            const ssl = parsed.searchParams.get("sslmode") === "disable" ? false : "require";

            client = postgres({
              host: hostname,
              port,
              database,
              username,
              password,
              ssl,
              max: 10,
            });
          } catch (urlErr) {
            console.warn("[Database] Failed to parse DATABASE_URL as URL, falling back to raw string:", urlErr instanceof Error ? urlErr.message : String(urlErr));
            client = postgres(dbUrl, { ssl: "require" });
          }
        } else {
          // Use individual env vars
          client = postgres({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 6543,
            database: process.env.DB_NAME || "postgres",
            username: process.env.DB_USER || "postgres",
            password: process.env.DB_PASS,
            ssl: process.env.DB_SSL === "false" ? false : "require",
            max: 10,
          });
        }

        _db = drizzle(client);
        
        if (!_bootstrapPromise) {
          _bootstrapPromise = bootstrapDb(client);
        }
        
        try {
          await _bootstrapPromise;
        } catch (bootstrapErr) {
          _bootstrapPromise = null; // Clear so we can retry on next connection attempt
          throw bootstrapErr;
        }
      } catch (error) {
        console.warn("[Database] Failed to connect:", error);
        _db = null;
      }
    }
  }
  return _db;
}


export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    // Backward-compatible fallback for environments where optional auth columns
    // were not migrated yet (prevents hard 500 during auth context build).
    const isMissingColumnError =
      error instanceof Error &&
      (/column .* does not exist/i.test(error.message) ||
       /type .* does not exist/i.test(error.message) ||
       /operator does not exist/i.test(error.message));

    if (!isMissingColumnError) {
      throw error;
    }

    console.warn("[Database] users schema drift detected in getUserByOpenId:", error);

    const result = await db
      .select({
        id: users.id,
        openId: users.openId,
        name: users.name,
        email: users.email,
        loginMethod: users.loginMethod,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        lastSignedIn: users.lastSignedIn,
      })
      .from(users)
      .where(eq(users.openId, openId))
      .limit(1);

    if (result.length === 0) return undefined;

    return {
      ...result[0],
      templatePreference: "classico" as const,
      passwordHash: null,
    };
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    // Catch schema drift: missing columns OR missing enum types (e.g. templatePreference enum)
    const isSchemaError =
      error instanceof Error &&
      (/column .* does not exist/i.test(error.message) ||
       /type .* does not exist/i.test(error.message) ||
       /operator does not exist/i.test(error.message));

    if (!isSchemaError) {
      throw error;
    }

    console.warn("[Database] users schema drift detected in getUserByEmail:", error.message);

    // Retry without templatePreference to keep credential login working while
    // production migrations are being aligned.
    try {
      const result = await db
        .select({
          id: users.id,
          openId: users.openId,
          name: users.name,
          email: users.email,
          loginMethod: users.loginMethod,
          role: users.role,
          passwordHash: users.passwordHash,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          lastSignedIn: users.lastSignedIn,
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (result.length === 0) return undefined;

      return {
        ...result[0],
        templatePreference: "classico" as const,
      };
    } catch (fallbackError) {
      const missingPasswordHash =
        fallbackError instanceof Error && /column .*passwordHash.* does not exist/i.test(fallbackError.message);

      if (!missingPasswordHash) {
        throw fallbackError;
      }

      console.warn("[Database] users.passwordHash missing in getUserByEmail:", fallbackError);

      const result = await db
        .select({
          id: users.id,
          openId: users.openId,
          name: users.name,
          email: users.email,
          loginMethod: users.loginMethod,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          lastSignedIn: users.lastSignedIn,
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (result.length === 0) return undefined;

      return {
        ...result[0],
        templatePreference: "classico" as const,
        passwordHash: null,
      };
    }
  }
}

export async function createUser(user: InsertUser) {

  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(users).values(user).returning();
  return result[0];
}

// TODO: add feature queries here as your schema grows.

// ─── Prayer Logs ─────────────────────────────────────────────────────────────

export async function insertPrayerLog(userId: number, prayerType: string, prayerName: string) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(prayerLogs).values({ userId, prayerType, prayerName });
}

export async function getPrayerLogsByUser(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(prayerLogs)
    .where(eq(prayerLogs.userId, userId))
    .orderBy(desc(prayerLogs.completedAt))
    .limit(limit);
}

// ─── Prayer Intentions ────────────────────────────────────────────────────────

export async function getActiveIntentions(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db
    .select()
    .from(prayerIntentions)
    .where(
      and(
        eq(prayerIntentions.isActive, true),
        // Intenções sem expiresAt (legado) ou com expiresAt no futuro
        or(
          isNull(prayerIntentions.expiresAt),
          gt(prayerIntentions.expiresAt, now)
        )
      )
    )
    .orderBy(desc(prayerIntentions.createdAt))
    .limit(limit);
}

export async function createIntention(
  userId: number,
  authorName: string,
  title: string,
  description: string,
  options?: {
    category?: "cura" | "familia" | "conversao" | "trabalho" | "defuntos" | "paz" | null;
    isAnonymous?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 9); // Novena de 9 dias
  await db.insert(prayerIntentions).values({
    userId,
    authorName,
    title,
    description,
    category: options?.category ?? null,
    isAnonymous: options?.isAnonymous ?? false,
    expiresAt,
  });
}

export async function getPrayedIntentionsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ intentionId: intentionPrayers.intentionId })
    .from(intentionPrayers)
    .where(eq(intentionPrayers.userId, userId));
}

export async function recordIntentionPrayer(intentionId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db
    .select()
    .from(intentionPrayers)
    .where(and(eq(intentionPrayers.intentionId, intentionId), eq(intentionPrayers.userId, userId)))
    .limit(1);
  if (existing.length > 0) return { alreadyPrayed: true };
  await db.insert(intentionPrayers).values({ intentionId, userId });
  await db
    .update(prayerIntentions)
    .set({ prayerCount: sql`${prayerIntentions.prayerCount} + 1` })
    .where(eq(prayerIntentions.id, intentionId));
  return { alreadyPrayed: false };
}

export async function deleteIntention(intentionId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const intention = await db
    .select({ id: prayerIntentions.id, userId: prayerIntentions.userId })
    .from(prayerIntentions)
    .where(eq(prayerIntentions.id, intentionId))
    .limit(1);
  if (!intention.length || intention[0].userId !== userId) {
    throw new Error("Não autorizado");
  }
  await db.delete(prayerIntentions).where(eq(prayerIntentions.id, intentionId));
}

export async function updateIntention(
  intentionId: number,
  userId: number,
  fields: {
    description: string;
    category?: "cura" | "familia" | "conversao" | "trabalho" | "defuntos" | "paz" | null;
    isAnonymous?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const intention = await db
    .select({ id: prayerIntentions.id, userId: prayerIntentions.userId })
    .from(prayerIntentions)
    .where(eq(prayerIntentions.id, intentionId))
    .limit(1);
  if (!intention.length || intention[0].userId !== userId) {
    throw new Error("Não autorizado");
  }
  const autoTitle = fields.description.length > 80
    ? fields.description.slice(0, 77).trimEnd() + "..."
    : fields.description;
  await db
    .update(prayerIntentions)
    .set({
      title: autoTitle,
      description: fields.description,
      category: fields.category ?? null,
      isAnonymous: fields.isAnonymous ?? false,
      updatedAt: new Date(),
    })
    .where(eq(prayerIntentions.id, intentionId));
}

export async function addIntentionMessage(
  intentionId: number,
  userId: number,
  authorName: string,
  message: string,
  isAnonymous = false
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(intentionMessages).values({ intentionId, userId, authorName, message, isAnonymous });
}

export async function getIntentionMessages(intentionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(intentionMessages)
    .where(eq(intentionMessages.intentionId, intentionId))
    .orderBy(desc(intentionMessages.createdAt))
    .limit(20);
}

export async function markGraceObtained(intentionId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  // Verifica se a intenção pertence ao usuário
  const intention = await db
    .select({ id: prayerIntentions.id, userId: prayerIntentions.userId })
    .from(prayerIntentions)
    .where(eq(prayerIntentions.id, intentionId))
    .limit(1);
  if (!intention.length || intention[0].userId !== userId) {
    throw new Error("Não autorizado");
  }
  await db
    .update(prayerIntentions)
    .set({ graceObtained: true })
    .where(eq(prayerIntentions.id, intentionId));
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function getActiveSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const now = new Date();
  const result = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .orderBy(desc(subscriptions.expiresAt))
    .limit(1);
  const sub = result[0];
  if (!sub || sub.expiresAt < now) return null;
  return sub;
}

export async function createSubscription(userId: number, plan: "monthly" | "annual") {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const now = new Date();
  const expiresAt = new Date(now);
  if (plan === "monthly") expiresAt.setMonth(expiresAt.getMonth() + 1);
  else expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  await db
    .update(subscriptions)
    .set({ status: "cancelled" })
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")));
  await db.insert(subscriptions).values({ userId, plan, status: "active", startedAt: now, expiresAt });
}

export async function cancelSubscription(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db
    .update(subscriptions)
    .set({ status: "cancelled" })
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")));
}

// ─── Template Preferences ─────────────────────────────────────────────────────

export async function updateTemplatePreference(userId: number, template: "classico" | "moderno" | "tradicional" | "minimalista") {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db
    .update(users)
    .set({ templatePreference: template })
    .where(eq(users.id, userId));
}

export async function getTemplatePreference(userId: number) {
  const db = await getDb();
  if (!db) return "classico";
  try {
    const user = await db
      .select({ templatePreference: users.templatePreference })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user[0]?.templatePreference || "classico";
  } catch (error) {
    console.error("[Database] Failed to get template preference:", error);
    return "classico";
  }
}

// ─── Daily Liturgy ────────────────────────────────────────────────────────────

export async function upsertDailyLiturgy(entry: InsertDailyLiturgy) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const { liturgyDate, ...rest } = entry;
  await db
    .insert(dailyLiturgy)
    .values(entry)
    .onConflictDoUpdate({
      target: dailyLiturgy.liturgyDate,
      set: { ...rest, fetchedAt: new Date() },
    });
}

export async function getDailyLiturgy(liturgyDate: string) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db
      .select()
      .from(dailyLiturgy)
      .where(eq(dailyLiturgy.liturgyDate, liturgyDate))
      .limit(1);
    return result[0] ?? null;
  } catch (error) {
    console.error("[Database] Failed to get daily liturgy:", error);
    return null;
  }
}

// ─── Lectio Journal ─────────────────────────────────────────────────────────

type UpsertLectioJournalInput = {
  journalDate: string;
  passageId: string;
  passageReference?: string | null;
  anchoredPhrase?: string | null;
  personalNote?: string | null;
  currentStep?: string | null;
};

export async function upsertLectioJournalEntry(userId: number, input: UpsertLectioJournalInput) {
  const db = await getDb();
  if (!db) return false;

  const row: InsertLectioJournal = {
    userId,
    journalDate: input.journalDate,
    passageId: input.passageId,
    passageReference: input.passageReference ?? null,
    anchoredPhrase: input.anchoredPhrase ?? null,
    personalNote: input.personalNote ?? null,
    currentStep: input.currentStep ?? null,
    updatedAt: new Date(),
  };

  try {
    await db
      .insert(lectioJournal)
      .values(row)
      .onConflictDoUpdate({
        target: [lectioJournal.userId, lectioJournal.journalDate, lectioJournal.passageId],
        set: {
          passageReference: row.passageReference,
          anchoredPhrase: row.anchoredPhrase,
          personalNote: row.personalNote,
          currentStep: row.currentStep,
          updatedAt: new Date(),
        },
      });
    return true;
  } catch (error) {
    console.error("[Database] Failed to upsert lectio journal:", error);
    return false;
  }
}

export async function getLectioJournalEntry(userId: number, journalDate: string, passageId: string) {
  const db = await getDb();
  if (!db) return null;
  try {
    const rows = await db
      .select()
      .from(lectioJournal)
      .where(
        and(
          eq(lectioJournal.userId, userId),
          eq(lectioJournal.journalDate, journalDate),
          eq(lectioJournal.passageId, passageId)
        )
      )
      .limit(1);
    return rows[0] ?? null;
  } catch (error) {
    console.error("[Database] Failed to get lectio journal entry:", error);
    return null;
  }
}

export async function listRecentLectioJournalEntries(userId: number, limit = 8) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(lectioJournal)
      .where(eq(lectioJournal.userId, userId))
      .orderBy(desc(lectioJournal.updatedAt))
      .limit(limit);
  } catch (error) {
    console.error("[Database] Failed to list lectio journal entries:", error);
    return [];
  }
}

// ─── Virtual Candles ─────────────────────────────────────────────────────────

export async function insertVirtualCandle(candle: InsertVirtualCandle) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(virtualCandles).values(candle).returning();
  return result[0];
}

export async function getActiveVirtualCandles() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  try {
    return await db
      .select()
      .from(virtualCandles)
      .where(gt(virtualCandles.expiresAt, now))
      .orderBy(desc(virtualCandles.litAt));
  } catch (error) {
    console.error("[Database] Failed to list active virtual candles:", error);
    return [];
  }
}

export async function recordCandlePrayer(candleId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const existing = await db
    .select()
    .from(candlePrayers)
    .where(and(eq(candlePrayers.candleId, candleId), eq(candlePrayers.userId, userId)))
    .limit(1);

  if (existing.length > 0) return { alreadyPrayed: true };

  await db.insert(candlePrayers).values({ candleId, userId });
  await db
    .update(virtualCandles)
    .set({ prayerCount: sql`${virtualCandles.prayerCount} + 1` })
    .where(eq(virtualCandles.id, candleId));

  return { alreadyPrayed: false };
}

// ─── Password Reset Tokens ────────────────────────────────────────────────────

/**
 * Cria um token de redefinição de senha (TTL: 1 hora).
 * Invalida tokens anteriores do mesmo usuário antes de inserir.
 */
export async function createPasswordResetToken(
  userId: number,
  token: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // +1 hora

  // Invalida tokens anteriores não utilizados do mesmo usuário
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(passwordResetTokens.userId, userId),
        isNull(passwordResetTokens.usedAt)
      )
    );

  await db.insert(passwordResetTokens).values({ userId, token, expiresAt });
}

/**
 * Valida um token e retorna o userId associado.
 * Retorna null se o token não existir, já foi usado ou expirou.
 */
export async function validatePasswordResetToken(
  token: string
): Promise<number | null> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const rows = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  return rows[0]?.userId ?? null;
}

/**
 * Marca o token como utilizado e atualiza o hash da senha do usuário.
 */
export async function consumePasswordResetToken(
  token: string,
  newPasswordHash: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const userId = await validatePasswordResetToken(token);
  if (!userId) return false;

  // Marca o token como usado
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.token, token));

  // Atualiza a senha
  await db
    .update(users)
    .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return true;
}

function todayIsoSaoPaulo(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

export async function getDailyPlanStatus(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const today = todayIsoSaoPaulo();

  // Fetch data
  const logs = await db
    .select()
    .from(prayerLogs)
    .where(eq(prayerLogs.userId, userId))
    .orderBy(desc(prayerLogs.completedAt))
    .limit(100);

  const journals = await db
    .select()
    .from(lectioJournal)
    .where(eq(lectioJournal.userId, userId))
    .orderBy(desc(lectioJournal.journalDate))
    .limit(100);

  const intentions = await db
    .select()
    .from(intentionPrayers)
    .where(eq(intentionPrayers.userId, userId))
    .orderBy(desc(intentionPrayers.prayedAt))
    .limit(100);

  // Timezone formatting helper
  const formatSaoPaulo = (d: Date) => {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return fmt.format(d);
  };

  // Check completions for today
  const liturgyCompleted = logs.some(
    (l) => l.prayerType === "liturgia" && formatSaoPaulo(new Date(l.completedAt)) === today
  );
  
  const rosaryCompleted = logs.some(
    (l) => l.prayerType === "rosario" && formatSaoPaulo(new Date(l.completedAt)) === today
  );

  const lectioCompleted = journals.some((j) => j.journalDate === today);

  const excludedTypes = ["liturgia", "rosario", "lectio_divina", "via_sacra", "vela_virtual", "novena"];
  const prayersCompleted = logs.some(
    (l) => !excludedTypes.includes(l.prayerType) && formatSaoPaulo(new Date(l.completedAt)) === today
  );

  const velaVirtualCompleted = logs.some(
    (l) => l.prayerType === "vela_virtual" && formatSaoPaulo(new Date(l.completedAt)) === today
  );

  const intercessionCompleted =
    velaVirtualCompleted ||
    intentions.some((i) => formatSaoPaulo(new Date(i.prayedAt)) === today);

  const novenaCompleted = logs.some(
    (l) =>
      (l.prayerType === "novena" || l.prayerType === "via_sacra") &&
      formatSaoPaulo(new Date(l.completedAt)) === today
  );

  // Combine unique dates of activity
  const dates = new Set<string>();
  logs.forEach((l) => dates.add(formatSaoPaulo(new Date(l.completedAt))));
  journals.forEach((j) => dates.add(j.journalDate));
  intentions.forEach((i) => dates.add(formatSaoPaulo(new Date(i.prayedAt))));

  const activeDates = Array.from(dates).sort((a, b) => b.localeCompare(a));

  // Calculate streak
  let streak = 0;
  const hasActivityToday = activeDates.includes(today);

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatSaoPaulo(yesterdayDate);
  const hasActivityYesterday = activeDates.includes(yesterday);

  if (hasActivityToday || hasActivityYesterday) {
    let checkDate = hasActivityToday ? new Date() : yesterdayDate;
    while (true) {
      const checkStr = formatSaoPaulo(checkDate);
      if (activeDates.includes(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return {
    liturgyCompleted,
    rosaryCompleted,
    lectioCompleted,
    prayersCompleted,
    intercessionCompleted,
    novenaCompleted,
    streak,
  };
}

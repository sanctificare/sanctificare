import { eq, desc, and, sql, gt } from "drizzle-orm";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  InsertLectioJournal,
  users,
  prayerLogs,
  prayerIntentions,
  intentionPrayers,
  subscriptions,
  dailyLiturgy,
  InsertDailyLiturgy,
  lectioJournal,
  virtualCandles,
  candlePrayers,
  InsertVirtualCandle,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: PostgresJsDatabase | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
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

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
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
  return db
    .select()
    .from(prayerIntentions)
    .where(eq(prayerIntentions.isActive, true))
    .orderBy(desc(prayerIntentions.createdAt))
    .limit(limit);
}

export async function createIntention(userId: number, authorName: string, title: string, description: string) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(prayerIntentions).values({ userId, authorName, title, description });
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


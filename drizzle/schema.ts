import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  boolean,
  index,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const templatePreferenceEnum = pgEnum("templatePreference", ["classico", "moderno", "tradicional", "minimalista"]);
export const planEnum = pgEnum("plan", ["monthly", "annual"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "cancelled", "expired", "past_due"]);
export const intentionCategoryEnum = pgEnum("intention_category", ["cura", "familia", "conversao", "trabalho", "defuntos", "paz"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  templatePreference: templatePreferenceEnum("templatePreference").default("classico").notNull(),
  passwordHash: text("passwordHash"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Assinaturas premium
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  plan: planEnum("plan").notNull(),
  status: subscriptionStatusEnum("status").default("active").notNull(),
  startedAt: timestamp("startedAt", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  stripeSubscriptionIdIdx: uniqueIndex("subscriptions_stripe_sub_id_idx").on(table.stripeSubscriptionId),
}));

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// Histórico de orações realizadas
export const prayerLogs = pgTable("prayer_logs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  prayerType: varchar("prayerType", { length: 64 }).notNull(), // rosario, terce, angelus, pai_nosso, etc.
  prayerName: varchar("prayerName", { length: 128 }).notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type PrayerLog = typeof prayerLogs.$inferSelect;
export type InsertPrayerLog = typeof prayerLogs.$inferInsert;

// Intenções de oração da comunidade
export const prayerIntentions = pgTable("prayer_intentions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  authorName: varchar("authorName", { length: 128 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  category: intentionCategoryEnum("category"),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  prayerCount: integer("prayerCount").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  graceObtained: boolean("graceObtained").default(false).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PrayerIntention = typeof prayerIntentions.$inferSelect;
export type InsertPrayerIntention = typeof prayerIntentions.$inferInsert;

// Registro de quem orou por qual intenção
export const intentionPrayers = pgTable("intention_prayers", {
  id: serial("id").primaryKey(),
  intentionId: integer("intentionId").notNull(),
  userId: integer("userId").notNull(),
  prayedAt: timestamp("prayedAt").defaultNow().notNull(),
});

export type IntentionPrayer = typeof intentionPrayers.$inferSelect;
export type InsertIntentionPrayer = typeof intentionPrayers.$inferInsert;

// Mensagens de encorajamento em intenções de oração
export const intentionMessages = pgTable("intention_messages", {
  id: serial("id").primaryKey(),
  intentionId: integer("intentionId").notNull(),
  userId: integer("userId").notNull(),
  authorName: varchar("authorName", { length: 128 }).notNull(),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  message: varchar("message", { length: 300 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IntentionMessage = typeof intentionMessages.$inferSelect;
export type InsertIntentionMessage = typeof intentionMessages.$inferInsert;

// Liturgia diária (leituras do dia), alimentada por cron a partir de API externa
export interface LiturgyReading {
  referencia: string;
  titulo?: string;
  texto: string;
  refrao?: string;
}

export interface LiturgyPrayers {
  coleta?: string;
  oferendas?: string;
  comunhao?: string;
}

export interface LiturgyAntiphons {
  entrada?: string;
  comunhao?: string;
}

export const dailyLiturgy = pgTable("daily_liturgy", {
  id: serial("id").primaryKey(),
  // Data no formato ISO "YYYY-MM-DD" — chave de busca do app
  liturgyDate: varchar("liturgyDate", { length: 10 }).notNull().unique(),
  celebration: text("celebration"), // nome da celebração/festa do dia
  color: varchar("color", { length: 32 }), // cor litúrgica
  firstReading: jsonb("firstReading").$type<LiturgyReading>(),
  psalm: jsonb("psalm").$type<LiturgyReading>(),
  secondReading: jsonb("secondReading").$type<LiturgyReading | null>(),
  gospel: jsonb("gospel").$type<LiturgyReading>(),
  prayers: jsonb("prayers").$type<LiturgyPrayers>(),
  antiphons: jsonb("antiphons").$type<LiturgyAntiphons>(),
  source: varchar("source", { length: 128 }).default("liturgia.up.railway.app").notNull(),
  fetchedAt: timestamp("fetchedAt").defaultNow().notNull(),
});

export type DailyLiturgy = typeof dailyLiturgy.$inferSelect;
export type InsertDailyLiturgy = typeof dailyLiturgy.$inferInsert;

// Diário espiritual da Lectio Divina
export const lectioJournal = pgTable(
  "lectio_journal",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    journalDate: varchar("journalDate", { length: 10 }).notNull(), // YYYY-MM-DD
    passageId: varchar("passageId", { length: 80 }).notNull(),
    passageReference: varchar("passageReference", { length: 120 }),
    anchoredPhrase: text("anchoredPhrase"),
    personalNote: text("personalNote"),
    currentStep: varchar("currentStep", { length: 20 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    userDatePassageUnique: uniqueIndex("lectio_journal_user_date_passage_uq").on(
      table.userId,
      table.journalDate,
      table.passageId
    ),
  })
);

export type LectioJournal = typeof lectioJournal.$inferSelect;
export type InsertLectioJournal = typeof lectioJournal.$inferInsert;

export const candleTypeEnum = pgEnum("candle_type", ["intencao", "defuntos", "agradecimento", "adoracao"]);

export const virtualCandles = pgTable("virtual_candles", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  authorName: varchar("authorName", { length: 128 }).notNull(),
  intention: text("intention").notNull(),
  type: candleTypeEnum("type").default("intencao").notNull(),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  prayerCount: integer("prayerCount").default(0).notNull(),
  litAt: timestamp("litAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type VirtualCandle = typeof virtualCandles.$inferSelect;
export type InsertVirtualCandle = typeof virtualCandles.$inferInsert;

export const candlePrayers = pgTable("candle_prayers", {
  id: serial("id").primaryKey(),
  candleId: integer("candleId").notNull(),
  userId: integer("userId").notNull(),
  prayedAt: timestamp("prayedAt").defaultNow().notNull(),
});

export type CandlePrayer = typeof candlePrayers.$inferSelect;
export type InsertCandlePrayer = typeof candlePrayers.$inferInsert;

// Tokens de redefinição de senha (válidos por 1 hora)
export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    token: varchar("token", { length: 128 }).notNull().unique(),
    expiresAt: timestamp("expiresAt").notNull(),
    usedAt: timestamp("usedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    tokenIdx: index("prt_token_idx").on(table.token),
    userIdx: index("prt_user_idx").on(table.userId),
  })
);

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

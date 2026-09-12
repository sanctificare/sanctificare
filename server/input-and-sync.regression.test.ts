import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";
import { createIntention, createUser, getDb, recordIntentionPrayer } from "./db";
import { intentionPrayers, prayerIntentions, users } from "../drizzle/schema";
import { and, eq } from "drizzle-orm";
import {
  createPostMergeBaseline,
  diffSnapshots,
  type RemoteStateEntry,
} from "../client/src/lib/userStateSync";

const anonymousContext = {
  user: null,
  req: { ip: "127.0.0.1", socket: {} },
  res: {},
} as TrpcContext;

describe("API input validation regressions", () => {
  it("rejects an impossible calendar date before a liturgy fetch", async () => {
    const caller = appRouter.createCaller(anonymousContext);
    await expect(caller.liturgy.getByDate({ date: "2026-02-30" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("rejects intention fields made only of whitespace", async () => {
    const caller = appRouter.createCaller({
      ...anonymousContext,
      user: {
        id: 123, openId: "validation-user", name: "Fiel", email: "fiel@example.com",
        role: "user", loginMethod: "credentials", templatePreference: "classico",
        passwordHash: null, passwordChangedAt: null,
        createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
      },
    } as TrpcContext);

    await expect(
      caller.intentions.create({ title: "     ", description: "          " })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("first-login state synchronization regression", () => {
  it("uploads local-only keys after applying the remote snapshot", () => {
    const remote: RemoteStateEntry[] = [
      { key: "remote-key", value: "server", deletedAt: null, updatedAt: "2026-09-12T12:00:00Z" },
    ];
    const merged = { "remote-key": "server", "local-only": "draft" };
    const baseline = createPostMergeBaseline(remote, merged);
    expect(diffSnapshots(baseline, merged)).toEqual({
      upserts: [{ key: "local-only", value: "draft" }], deletions: [],
    });
  });

  it("does not resurrect a remotely deleted key", () => {
    const remote: RemoteStateEntry[] = [
      { key: "deleted", value: null, deletedAt: "2026-09-12T12:00:00Z", updatedAt: "2026-09-12T12:00:00Z" },
    ];
    expect(createPostMergeBaseline(remote, {})).toEqual({});
    expect(diffSnapshots({}, {})).toEqual({ upserts: [], deletions: [] });
  });
});

describe("duplicate interaction regression", () => {
  it("counts two concurrent clicks from the same user only once", async () => {
    const db = await getDb();
    if (!db) return;

    const suffix = `${Date.now()}-${Math.random()}`;
    const user = await createUser({ openId: `concurrency-${suffix}`, name: "Concurrency test" });
    try {
      await createIntention(user.id, user.name ?? "Test", "Pedido de teste", "Descrição válida para testar concorrência.");
      const [intention] = await db
        .select({ id: prayerIntentions.id })
        .from(prayerIntentions)
        .where(eq(prayerIntentions.userId, user.id))
        .limit(1);

      const results = await Promise.all([
        recordIntentionPrayer(intention.id, user.id),
        recordIntentionPrayer(intention.id, user.id),
      ]);

      const [stored] = await db
        .select({ prayerCount: prayerIntentions.prayerCount })
        .from(prayerIntentions)
        .where(eq(prayerIntentions.id, intention.id));
      const relations = await db
        .select({ id: intentionPrayers.id })
        .from(intentionPrayers)
        .where(and(eq(intentionPrayers.intentionId, intention.id), eq(intentionPrayers.userId, user.id)));

      expect(results.filter((result) => !result.alreadyPrayed)).toHaveLength(1);
      expect(relations).toHaveLength(1);
      expect(stored.prayerCount).toBe(1);
    } finally {
      await db.delete(users).where(eq(users.id, user.id));
    }
  });
});

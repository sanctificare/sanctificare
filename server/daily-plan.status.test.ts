import { describe, expect, it } from "vitest";
import { computeDailyPlanStatusFromData } from "./db";

describe("computeDailyPlanStatusFromData", () => {
  it("calcula flags diárias e streak com dados combinados", () => {
    const now = new Date("2026-07-02T15:00:00.000Z");

    const status = computeDailyPlanStatusFromData({
      now,
      logs: [
        { prayerType: "liturgia", completedAt: "2026-07-02T16:00:00.000Z" },
        { prayerType: "rosario", completedAt: "2026-07-02T17:00:00.000Z" },
        { prayerType: "novena", completedAt: "2026-07-02T18:00:00.000Z" },
        { prayerType: "vela_virtual", completedAt: "2026-07-02T19:00:00.000Z" },
        { prayerType: "terco_misericordia", completedAt: "2026-07-02T20:00:00.000Z" },
        { prayerType: "rosario", completedAt: "2026-07-01T15:00:00.000Z" },
        { prayerType: "liturgia", completedAt: "2026-06-30T15:00:00.000Z" },
      ],
      journals: [{ journalDate: "2026-07-02" }],
      intentions: [{ prayedAt: "2026-07-01T13:00:00.000Z" }],
    });

    expect(status).toEqual({
      liturgyCompleted: true,
      rosaryCompleted: true,
      lectioCompleted: true,
      prayersCompleted: true,
      intercessionCompleted: true,
      novenaCompleted: true,
      streak: 3,
      weeklyActivity: ["2026-06-30", "2026-07-01", "2026-07-02"],
    });
  });

  it("não conta prayersCompleted quando há apenas tipos excluídos", () => {
    const now = new Date("2026-07-02T15:00:00.000Z");

    const status = computeDailyPlanStatusFromData({
      now,
      logs: [
        { prayerType: "liturgia", completedAt: "2026-07-02T16:00:00.000Z" },
        { prayerType: "rosario", completedAt: "2026-07-02T17:00:00.000Z" },
      ],
      journals: [],
      intentions: [],
    });

    expect(status).toEqual({
      liturgyCompleted: true,
      rosaryCompleted: true,
      lectioCompleted: false,
      prayersCompleted: false,
      intercessionCompleted: false,
      novenaCompleted: false,
      streak: 1,
      weeklyActivity: ["2026-07-02"],
    });
  });

  it("inicia streak pelo ontem quando hoje ainda não teve atividade", () => {
    const now = new Date("2026-07-02T15:00:00.000Z");

    const status = computeDailyPlanStatusFromData({
      now,
      logs: [{ prayerType: "rosario", completedAt: "2026-07-01T15:00:00.000Z" }],
      journals: [{ journalDate: "2026-06-30" }],
      intentions: [],
    });

    expect(status).toEqual({
      liturgyCompleted: false,
      rosaryCompleted: false,
      lectioCompleted: false,
      prayersCompleted: false,
      intercessionCompleted: false,
      novenaCompleted: false,
      streak: 2,
      weeklyActivity: ["2026-06-30", "2026-07-01"],
    });
  });
});

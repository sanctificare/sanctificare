import type { Novena } from "@/data/novenas";

export const NOVENA_PROGRESS_STORAGE_KEY = "sanctificare.novenas.progress.v1";

export type ProgressMap = Record<string, number[]>;

export type InProgressNovena = {
  novena: Novena;
  completed: number[];
  completedCount: number;
  maxCompletedDay: number;
  nextDay: number;
  progressPercent: number;
};

export type DashboardActiveNovena = {
  novena: Novena;
  nextDay: number;
  completedCount: number;
};

export type NovenasInProgressItem = {
  novena: Novena;
  completed: number[];
  nextDay: number;
  progressPercent: number;
};

function sanitizeCompletedDays(completedDays: number[], totalDays: number) {
  return Array.from(
    new Set(
      completedDays.filter(
        (day) => Number.isInteger(day) && day >= 1 && day <= totalDays
      )
    )
  ).sort((a, b) => a - b);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getCompletedDays(value: unknown): number[] {
  return Array.isArray(value) ? value : [];
}

export function parseNovenaProgress(raw: string | null | undefined): ProgressMap {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return isPlainObject(parsed) ? (parsed as ProgressMap) : {};
  } catch {
    return {};
  }
}

export function getNextPendingNovenaDay(completedDays: number[], totalDays = 9): number {
  const completedSet = new Set(completedDays);
  for (let day = 1; day <= totalDays; day += 1) {
    if (!completedSet.has(day)) return day;
  }
  return 1;
}

export function getInProgressNovenas(
  progressMap: ProgressMap,
  novenas: Novena[]
): InProgressNovena[] {
  return novenas
    .map((novena) => {
      const totalDays = Math.max(1, novena.days.length);
      const completed = sanitizeCompletedDays(
        getCompletedDays(progressMap[novena.id]),
        totalDays
      );

      if (completed.length === 0 || completed.length >= totalDays) {
        return null;
      }

      const maxCompletedDay = completed[completed.length - 1];
      return {
        novena,
        completed,
        completedCount: completed.length,
        maxCompletedDay,
        nextDay: getNextPendingNovenaDay(completed, totalDays),
        progressPercent: Math.round((completed.length / totalDays) * 100),
      };
    })
    .filter((item): item is InProgressNovena => item !== null)
    .sort((a, b) => {
      if (b.completedCount !== a.completedCount) {
        return b.completedCount - a.completedCount;
      }

      if (b.maxCompletedDay !== a.maxCompletedDay) {
        return b.maxCompletedDay - a.maxCompletedDay;
      }

      return a.novena.name.localeCompare(b.novena.name, "pt-BR");
    });
}

export function getTopActiveNovena(progressMap: ProgressMap, novenas: Novena[]) {
  return getInProgressNovenas(progressMap, novenas)[0] ?? null;
}

export function buildDashboardActiveNovena(
  progressMap: ProgressMap,
  novenas: Novena[]
): DashboardActiveNovena | null {
  const selected = getTopActiveNovena(progressMap, novenas);
  if (!selected) return null;

  return {
    novena: selected.novena,
    nextDay: selected.nextDay,
    completedCount: selected.completedCount,
  };
}

export function buildNovenasInProgressItems(
  progressMap: ProgressMap,
  novenas: Novena[]
): NovenasInProgressItem[] {
  return getInProgressNovenas(progressMap, novenas).map((item) => ({
    novena: item.novena,
    completed: item.completed,
    nextDay: item.nextDay,
    progressPercent: item.progressPercent,
  }));
}

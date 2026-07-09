import { CSRF_STORAGE_KEY, SESSION_STORAGE_KEY } from "@/const";

type LocalSnapshot = Record<string, string>;

export type RemoteStateEntry = {
  key: string;
  value: string | null;
  deletedAt: Date | string | null;
  updatedAt: Date | string;
};

const INTERNAL_SYNC_META_KEY = "sanctificare.sync.meta.v1";

const EXCLUDED_KEYS = new Set<string>([
  SESSION_STORAGE_KEY,
  CSRF_STORAGE_KEY,
  "app-runtime-user-info",
  INTERNAL_SYNC_META_KEY,
]);

function toEpoch(value: Date | string | null | undefined): number {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isSyncableKey(key: string): boolean {
  if (!key) return false;
  if (EXCLUDED_KEYS.has(key)) return false;
  return true;
}

export function collectSyncableLocalSnapshot(): LocalSnapshot {
  if (typeof window === "undefined") return {};

  const snapshot: LocalSnapshot = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !isSyncableKey(key)) continue;

    const value = localStorage.getItem(key);
    if (value === null) continue;

    // Evita payloads grandes demais; nesses casos o estado continua local.
    if (value.length > 200_000) continue;
    snapshot[key] = value;
  }

  return snapshot;
}

export function diffSnapshots(previous: LocalSnapshot, next: LocalSnapshot) {
  const upserts: Array<{ key: string; value: string }> = [];
  const deletions: string[] = [];

  for (const [key, value] of Object.entries(next)) {
    if (previous[key] !== value) {
      upserts.push({ key, value });
    }
  }

  for (const key of Object.keys(previous)) {
    if (!(key in next)) {
      deletions.push(key);
    }
  }

  return { upserts, deletions };
}

export function applyRemoteState(params: {
  entries: RemoteStateEntry[];
  localVersionByKey: Map<string, number>;
}) {
  const { entries, localVersionByKey } = params;
  if (typeof window === "undefined") return;

  for (const entry of entries) {
    const remoteUpdatedAt = toEpoch(entry.updatedAt);
    const localUpdatedAt = localVersionByKey.get(entry.key) ?? 0;

    if (remoteUpdatedAt < localUpdatedAt) {
      continue;
    }

    const wasDeleted = Boolean(entry.deletedAt);
    if (wasDeleted) {
      localStorage.removeItem(entry.key);
      localVersionByKey.set(entry.key, Math.max(remoteUpdatedAt, toEpoch(entry.deletedAt)));
      continue;
    }

    if (entry.value === null) {
      continue;
    }

    const current = localStorage.getItem(entry.key);
    if (current !== entry.value) {
      localStorage.setItem(entry.key, entry.value);
    }
    localVersionByKey.set(entry.key, remoteUpdatedAt);
  }
}

export function splitIntoChunks<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

import { HISTORY_STORAGE_KEY } from "./history-store";
import { PRACTICE_HISTORY_KEY, PRACTICE_SESSION_KEY } from "./practice-store";
import { LEGACY_SESSION_STORAGE_KEYS, SESSION_STORAGE_KEY } from "./session-store";
import { STUDY_PLAN_STATE_KEY } from "./study-plan";
import { REPAIR_QUEUE_KEY } from "./repair-queue";
import { STRATEGY_HISTORY_KEY } from "./strategy-experiments";

export const USER_DATA_KEYS = [
  SESSION_STORAGE_KEY,
  ...LEGACY_SESSION_STORAGE_KEYS,
  HISTORY_STORAGE_KEY,
  PRACTICE_SESSION_KEY,
  PRACTICE_HISTORY_KEY,
  STUDY_PLAN_STATE_KEY,
  REPAIR_QUEUE_KEY,
  STRATEGY_HISTORY_KEY,
] as const;

type StorageLike = Pick<Storage, "getItem" | "removeItem">;

export type UserDataExport = {
  format: "aptitude-coach-export";
  version: 1;
  exportedAt: string;
  data: Record<string, unknown>;
};

export function collectUserData(storage: StorageLike, now = new Date()): UserDataExport {
  const data: Record<string, unknown> = {};
  for (const key of USER_DATA_KEYS) {
    const value = storage.getItem(key);
    if (value === null) continue;
    try { data[key] = JSON.parse(value); } catch { data[key] = value; }
  }
  return { format: "aptitude-coach-export", version: 1, exportedAt: now.toISOString(), data };
}

export function clearUserData(storage: StorageLike) {
  for (const key of USER_DATA_KEYS) storage.removeItem(key);
}

export function countStoredDataGroups(storage: StorageLike) {
  return USER_DATA_KEYS.filter((key) => storage.getItem(key) !== null).length;
}

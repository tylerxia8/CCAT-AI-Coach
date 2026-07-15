import { describe, expect, it } from "vitest";
import { clearUserData, collectUserData, countStoredDataGroups, USER_DATA_KEYS } from "./user-data";

function memoryStorage(seed: Record<string, string> = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key: string) { return values.get(key) ?? null; },
    removeItem(key: string) { values.delete(key); },
    values,
  };
}

describe("user data controls", () => {
  it("exports only owned application keys with a versioned format", () => {
    const storage = memoryStorage({ [USER_DATA_KEYS[0]]: JSON.stringify({ status: "active" }), unrelated: "leave-me" });
    const exported = collectUserData(storage, new Date("2026-07-15T12:00:00Z"));
    expect(exported).toMatchObject({ format: "aptitude-coach-export", version: 1, exportedAt: "2026-07-15T12:00:00.000Z" });
    expect(exported.data[USER_DATA_KEYS[0]]).toEqual({ status: "active" });
    expect(exported.data).not.toHaveProperty("unrelated");
  });

  it("clears every owned key without touching unrelated browser storage", () => {
    const seed = Object.fromEntries(USER_DATA_KEYS.map((key) => [key, "stored"]));
    const storage = memoryStorage({ ...seed, unrelated: "keep" });
    expect(countStoredDataGroups(storage)).toBe(USER_DATA_KEYS.length);
    clearUserData(storage);
    expect(countStoredDataGroups(storage)).toBe(0);
    expect(storage.getItem("unrelated")).toBe("keep");
  });

  it("preserves malformed legacy values in exports rather than dropping them", () => {
    const storage = memoryStorage({ [USER_DATA_KEYS[1]]: "legacy-value" });
    expect(collectUserData(storage).data[USER_DATA_KEYS[1]]).toBe("legacy-value");
  });
});

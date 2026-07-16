import { describe, expect, it } from "vitest";
import { drillProgression, meetsStageGate, targetForStage } from "./adaptive-practice";
import type { PracticeHistoryEntry } from "./practice-store";

const entry = (correct: number, onPace: number): PracticeHistoryEntry => ({ sessionId: crypto.randomUUID(), completedAt: new Date().toISOString(), focus: "speed practice", correct, total: 8, onPace });

describe("adaptive drill progression", () => {
  it("advances only when each evidence gate is met", () => {
    const history = { version: 1 as const, entries: [entry(6, 2), entry(6, 5)] };
    expect(drillProgression("speed practice", history).stage).toBe(3);
    expect(meetsStageGate(entry(6, 4), 2)).toBe(false);
  });

  it("tightens the clock across stages", () => {
    expect(targetForStage(24, 1, "speed practice")).toBe(45);
    expect(targetForStage(24, 3, "speed practice")).toBe(17);
  });
});

import { describe, expect, it } from "vitest";
import { dueRepairs, nextRepairSkill, parseRepairQueue, recordRepairEvidence } from "./repair-queue";

describe("repair queue", () => {
  it("adds misses immediately and spaces successful repairs", () => {
    const now = new Date("2026-07-17T12:00:00Z");
    const missed = recordRepairEvidence(parseRepairQueue(null), { key: "q1", skill: "ratios", isCorrect: false }, now);
    expect(dueRepairs(missed, now)).toHaveLength(1);
    expect(nextRepairSkill(missed, now)).toBe("ratios");
    const repaired = recordRepairEvidence(missed, { key: "q1", skill: "ratios", isCorrect: true }, now);
    expect(dueRepairs(repaired, now)).toHaveLength(0);
    expect(repaired.items[0].intervalDays).toBe(1);
  });
});

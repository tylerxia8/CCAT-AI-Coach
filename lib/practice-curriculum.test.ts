import { describe, expect, it } from "vitest";
import { questionExposureCounts, recommendPracticeSkill } from "./practice-curriculum";

describe("practice curriculum", () => {
  it("counts exposure so unseen questions can be preferred", () => {
    const history = { version: 1 as const, entries: [{ sessionId: "one", completedAt: "now", focus: "practice", correct: 1, total: 2, onPace: 2, questionIds: ["a", "b"] }, { sessionId: "two", completedAt: "later", focus: "practice", correct: 1, total: 1, onPace: 1, questionIds: ["a"] }] };
    expect(questionExposureCounts(history)).toEqual({ a: 2, b: 1 });
  });

  it("prioritizes recent drill misses before the diagnostic fallback", () => {
    const diagnostics = { version: 1 as const, entries: [{ weakestSkill: "percentages" }] } as never;
    const practice = { version: 1 as const, entries: [{ sessionId: "one", completedAt: "now", focus: "practice", correct: 1, total: 2, onPace: 2, skillResults: [{ skill: "mental rotation", correct: 0, total: 2 }] }] };
    expect(recommendPracticeSkill(diagnostics, practice)).toBe("mental rotation");
  });
});

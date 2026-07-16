import { describe, expect, it } from "vitest";
import { estimateAbility, selectAdaptiveSequence } from "./adaptive-question-selection";
import { PRACTICE_QUESTIONS } from "./practice";

describe("adaptive question selection", () => {
  it("raises conceptual difficulty after accurate, on-pace evidence", () => {
    const history = { version: 1 as const, entries: [{ sessionId: "one", completedAt: "2026-01-01", focus: "speed practice", correct: 8, total: 8, onPace: 7, averageDifficulty: 3 }] };
    expect(estimateAbility("speed practice", 2, history).targetDifficulty).toBe(4);
  });

  it("lowers difficulty for a knowledge-first start", () => {
    expect(estimateAbility("knowledge practice", 1, { version: 1, entries: [] }).targetDifficulty).toBe(1);
  });

  it("does not transfer evidence between different skills", () => {
    const history = { version: 1 as const, entries: [{ sessionId: "one", completedAt: "2026-01-01", focus: "speed practice · percentages", correct: 8, total: 8, onPace: 8, averageDifficulty: 4 }] };
    expect(estimateAbility("speed practice · mental rotation", 1, history).observations).toBe(0);
  });

  it("creates a stable, unique mixed-difficulty sequence and prioritizes the requested skill", () => {
    const sequence = selectAdaptiveSequence(PRACTICE_QUESTIONS, 3, "sentence completion");
    expect(sequence).toHaveLength(PRACTICE_QUESTIONS.length);
    expect(new Set(sequence.map((item) => item.id)).size).toBe(PRACTICE_QUESTIONS.length);
    expect(sequence.findIndex((item) => item.skill === "sentence completion")).toBeLessThanOrEqual(4);
    expect(sequence.some((item) => item.difficulty < 3)).toBe(true);
    expect(sequence.some((item) => item.difficulty > 3)).toBe(true);
  });
});

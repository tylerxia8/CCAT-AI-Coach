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
    expect(sequence).toHaveLength(Math.min(10, PRACTICE_QUESTIONS.length));
    expect(new Set(sequence.map((item) => item.id)).size).toBe(sequence.length);
    expect(sequence.findIndex((item) => item.skill === "sentence completion")).toBeLessThanOrEqual(4);
    expect(sequence.filter((item) => item.skill === "sentence completion").length).toBeLessThanOrEqual(4);
    expect(sequence.some((item) => item.difficulty < 3)).toBe(true);
    expect(sequence.some((item) => item.difficulty > 3)).toBe(true);
  });

  it("cycles toward questions with fewer prior exposures", () => {
    const exposures = Object.fromEntries(PRACTICE_QUESTIONS.slice(0, 5).map((item) => [item.id, 2]));
    const sequence = selectAdaptiveSequence(PRACTICE_QUESTIONS, 3, null, exposures, 4);
    expect(sequence.every((item) => (exposures[item.id] ?? 0) === 0)).toBe(true);
  });

  it("changes most of the set after a completed personalized session", () => {
    const first = selectAdaptiveSequence(PRACTICE_QUESTIONS, 3, "sentence completion");
    const exposures = Object.fromEntries(first.map((item) => [item.id, 1]));
    const second = selectAdaptiveSequence(PRACTICE_QUESTIONS, 3, "sentence completion", exposures);
    const repeated = second.filter((item) => first.some((prior) => prior.id === item.id));
    expect(repeated.length).toBeLessThanOrEqual(4);
  });

  it("keeps logic remediation mixed with the broader CCAT formats", () => {
    const sequence = selectAdaptiveSequence(PRACTICE_QUESTIONS, 4, "deductive reasoning");
    const formalLogic = new Set(["deductive reasoning", "syllogisms", "ordering logic", "truth logic"]);

    expect(sequence.filter((item) => formalLogic.has(item.skill))).toHaveLength(3);
    expect(sequence.some((item) => item.category === "Verbal")).toBe(true);
    expect(sequence.some((item) => item.stimulus && ["bar", "line", "pie", "table"].includes(item.stimulus.kind))).toBe(true);
    expect(sequence.some((item) => item.category === "Numerical" && item.skill !== "number sequences" && !item.stimulus)).toBe(true);
    expect(sequence.some((item) => ["number sequences", "letter series", "mixed series", "visual sequences", "figure matrices"].includes(item.skill))).toBe(true);
    expect(sequence.some((item) => item.skill === "attention to detail" || item.stimulus?.kind === "pairs")).toBe(true);
  });
});

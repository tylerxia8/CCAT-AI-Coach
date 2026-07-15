import { describe, expect, it } from "vitest";
import { buildCoachingPlan } from "./coaching";
import type { DiagnosticResult, QuestionReview } from "./diagnostic";

const baseResult: DiagnosticResult = {
  correct: 6,
  total: 8,
  accuracy: 0.75,
  averageSeconds: 28,
  paceScore: 0.75,
  confidenceScore: 0.8,
  priority: "Practice under sustained time pressure",
  categoryResults: [
    { category: "Numerical", correct: 2, total: 3 },
    { category: "Verbal", correct: 2, total: 2 },
    { category: "Logic", correct: 2, total: 2 },
    { category: "Spatial", correct: 1, total: 1 },
  ],
};

function review(index: number, overrides: Partial<QuestionReview> = {}): QuestionReview {
  return {
    questionId: `q-${index}`,
    category: "Logic",
    prompt: `Question ${index}`,
    selectedAnswer: "A",
    correctAnswer: "A",
    isCorrect: true,
    pace: "on_target",
    elapsedSeconds: 20,
    targetSeconds: 30,
    confidence: 2,
    explanation: "Verified explanation.",
    ...overrides,
  };
}

describe("buildCoachingPlan", () => {
  it("prioritizes widespread slow decisions", () => {
    const reviews = Array.from({ length: 8 }, (_, index) => review(index, index < 4 ? { pace: "slow", elapsedSeconds: 45 } : {}));
    expect(buildCoachingPlan(baseResult, reviews).bottleneck).toBe("pacing");
  });

  it("identifies repeated high-confidence misses", () => {
    const reviews = Array.from({ length: 8 }, (_, index) => review(index, index < 2 ? { isCorrect: false, confidence: 3, correctAnswer: "B" } : {}));
    expect(buildCoachingPlan(baseResult, reviews).bottleneck).toBe("confidence");
  });

  it("detects a material second-half accuracy drop", () => {
    const reviews = Array.from({ length: 8 }, (_, index) => review(index, index >= 4 ? { isCorrect: false, correctAnswer: "B" } : {}));
    expect(buildCoachingPlan(baseResult, reviews).bottleneck).toBe("endurance");
  });

  it("falls back to the weakest category when execution signals are stable", () => {
    const reviews = Array.from({ length: 8 }, (_, index) => review(index, index === 1 || index === 5 ? { isCorrect: false, confidence: 1, correctAnswer: "B" } : {}));
    const result = { ...baseResult, categoryResults: [{ category: "Numerical" as const, correct: 1, total: 3 }] };
    expect(buildCoachingPlan(result, reviews)).toMatchObject({ bottleneck: "category", title: "Strengthen numerical reasoning" });
  });
});

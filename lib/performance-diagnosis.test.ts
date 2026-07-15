import { describe, expect, it } from "vitest";
import type { QuestionReview } from "./diagnostic";
import { diagnosePerformance } from "./performance-diagnosis";

function review(index: number, overrides: Partial<QuestionReview> = {}): QuestionReview {
  return {
    questionId: `q-${index}`,
    category: "Numerical",
    skill: "percentages",
    prompt: `Question ${index}`,
    selectedAnswer: "A",
    correctAnswer: "A",
    isCorrect: true,
    pace: "on_target",
    elapsedSeconds: 14,
    targetSeconds: 18,
    confidence: 2,
    answerChanges: 0,
    explanation: "Verified explanation for the question.",
    ...overrides,
  };
}

describe("diagnosePerformance", () => {
  it("separates fast knowledge misses from a speed problem", () => {
    const reviews = Array.from({ length: 10 }, (_, index) => review(index, index < 5 ? { isCorrect: false, correctAnswer: "B" } : {}));
    const diagnosis = diagnosePerformance(reviews);
    expect(diagnosis.primaryCause).toBe("knowledge");
    expect(diagnosis.weakestSkill).toBe("percentages");
    expect(diagnosis.prescriptions[0].mode).toBe("learn");
  });

  it("recognizes correct but slow work as a fluency problem", () => {
    const reviews = Array.from({ length: 10 }, (_, index) => review(index, index < 7 ? { pace: "slow", elapsedSeconds: 29 } : {}));
    const diagnosis = diagnosePerformance(reviews);
    expect(diagnosis.primaryCause).toBe("speed");
    expect(diagnosis.prescriptions[0].mode).toBe("fluency");
  });

  it("detects unstable cadence even when average accuracy is strong", () => {
    const times = [4, 35, 5, 38, 4, 36, 5, 40, 4, 37];
    const reviews = times.map((time, index) => review(index, { elapsedSeconds: time, pace: time > 18 ? "slow" : "on_target" }));
    expect(diagnosePerformance(reviews).primaryCause).toBe("rhythm");
  });

  it("detects costly repeated answer changes", () => {
    const reviews = Array.from({ length: 10 }, (_, index) => review(index, index < 5 ? { answerChanges: 2, isCorrect: false, correctAnswer: "B" } : {}));
    const diagnosis = diagnosePerformance(reviews);
    expect(diagnosis.primaryCause).toBe("second_guessing");
    expect(diagnosis.prescriptions[0].mode).toBe("commitment");
  });
});

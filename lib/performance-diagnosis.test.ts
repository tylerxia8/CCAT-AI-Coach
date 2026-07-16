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
    firstAnswerCorrect: null,
    firstAnswerSeconds: null,
    viewCount: 1,
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
    expect(diagnosis.nextActivity).toMatchObject({ title: "Learn and apply percentages", target: "4 of 5 unseen examples correct" });
    expect(diagnosis.skillBreakdown[0]).toMatchObject({ skill: "percentages", level: "developing" });
  });

  it("recognizes correct but slow work as a fluency problem", () => {
    const reviews = Array.from({ length: 10 }, (_, index) => review(index, index < 7 ? { pace: "slow", elapsedSeconds: 29 } : {}));
    const diagnosis = diagnosePerformance(reviews);
    expect(diagnosis.primaryCause).toBe("speed");
    expect(diagnosis.prescriptions[0].mode).toBe("fluency");
  });

  it("separates rushed errors from deliberate knowledge misses", () => {
    const reviews = Array.from({ length: 10 }, (_, index) => review(index, index < 4 ? { isCorrect: false, correctAnswer: "B", elapsedSeconds: 6, firstAnswerSeconds: 5, confidence: 3 } : {}));
    const diagnosis = diagnosePerformance(reviews);
    expect(diagnosis.primaryCause).toBe("rushing");
    expect(diagnosis.nextActivity).toMatchObject({ title: "Add a verification beat to percentages", target: "No fast misses across 5 decisions" });
    expect(diagnosis.causes.find((cause) => cause.cause === "rushing")?.evidence.join(" ")).toContain("4 of 4 very fast decisions were incorrect");
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

  it("distinguishes harmful correct-to-wrong changes from productive corrections", () => {
    const reviews = Array.from({ length: 10 }, (_, index) => review(index, index < 2 ? { answerChanges: 1, firstAnswerCorrect: true, isCorrect: false, correctAnswer: "B" } : {}));
    const diagnosis = diagnosePerformance(reviews);
    expect(diagnosis.primaryCause).toBe("second_guessing");
    expect(diagnosis.causes.find((cause) => cause.cause === "second_guessing")?.evidence.join(" ")).toContain("2 correct first choices became wrong");
  });
});

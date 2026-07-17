import { describe, expect, it } from "vitest";
import type { QuestionReview } from "./diagnostic";
import { analyzeStrategy, curriculumSignals } from "./score-improvement";

const review = (overrides: Partial<QuestionReview>): QuestionReview => ({ questionId: "q", category: "Numerical", prompt: "", selectedAnswer: "A", correctAnswer: "B", isCorrect: false, pace: "slow", elapsedSeconds: 40, targetSeconds: 18, confidence: 3, answerChanges: 0, firstAnswerCorrect: false, firstAnswerSeconds: 10, viewCount: 1, skill: "math", explanation: "", ...overrides });

describe("score improvement analytics", () => {
  it("detects long misses and confidence errors", () => {
    const result = analyzeStrategy([review({}), review({ questionId: "q2", isCorrect: true, correctAnswer: "A", elapsedSeconds: 12, pace: "on_target" })]);
    expect(result.slowMisses).toBe(1);
    expect(result.highConfidenceWrong).toBe(1);
    expect(result.checkpoints).toHaveLength(3);
  });
  it("flags transfer across repeat skill sessions", () => {
    const base = { focus: "math", total: 10, onPace: 5 };
    const signals = curriculumSignals({ version: 1, entries: [
      { ...base, sessionId: "a", completedAt: "2026-01-01", correct: 4, skillResults: [{ skill: "math", correct: 2, total: 5, onPace: 2 }] },
      { ...base, sessionId: "b", completedAt: "2026-01-02", correct: 8, skillResults: [{ skill: "math", correct: 5, total: 5, onPace: 5 }] },
    ] });
    expect(signals[0].status).toBe("improving");
  });
});

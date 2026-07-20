import { describe, expect, it } from "vitest";
import type { QuestionReview } from "./diagnostic";
import { inferMisconceptions } from "./misconception-model";

const review = (overrides: Partial<QuestionReview>): QuestionReview => ({ questionId: "q1", category: "Logic", prompt: "", selectedAnswer: "A", correctAnswer: "B", isCorrect: false, pace: "on_target", elapsedSeconds: 15, targetSeconds: 20, confidence: 3, answerChanges: 0, firstAnswerCorrect: false, firstAnswerSeconds: 15, viewCount: 1, skill: "deductive reasoning", explanation: "", ...overrides });

describe("misconception model", () => {
  it("distinguishes premature guesses from logic misunderstandings", () => {
    const signals = inferMisconceptions([review({ elapsedSeconds: 5, confidence: 1 }), review({ questionId: "q2" }), review({ questionId: "q3" })]);
    expect(signals.find((item) => item.code === "logic_scope")).toMatchObject({ count: 2, confidence: "moderate" });
    expect(signals.find((item) => item.code === "premature_guess")).toBeTruthy();
  });
});

import { describe, expect, it } from "vitest";
import { Attempt, QUESTIONS, scoreDiagnostic } from "./diagnostic";

describe("scoreDiagnostic", () => {
  it("scores a fully correct, on-pace diagnostic deterministically", () => {
    const attempts: Attempt[] = QUESTIONS.map((question) => ({
      questionId: question.id,
      answerIndex: question.correctIndex,
      elapsedSeconds: question.targetSeconds,
      confidence: 3,
    }));
    const result = scoreDiagnostic(QUESTIONS, attempts);
    expect(result.correct).toBe(QUESTIONS.length);
    expect(result.accuracy).toBe(1);
    expect(result.paceScore).toBe(1);
    expect(result.confidenceScore).toBe(1);
  });

  it("prioritizes pacing when most responses exceed target time", () => {
    const attempts: Attempt[] = QUESTIONS.map((question) => ({
      questionId: question.id,
      answerIndex: question.correctIndex,
      elapsedSeconds: question.targetSeconds + 20,
      confidence: 3,
    }));
    expect(scoreDiagnostic(QUESTIONS, attempts).priority).toBe("Build a faster decision rhythm");
  });

  it("treats unanswered questions as incorrect", () => {
    const result = scoreDiagnostic(QUESTIONS, []);
    expect(result.correct).toBe(0);
    expect(result.total).toBe(QUESTIONS.length);
    expect(result.accuracy).toBe(0);
  });
});

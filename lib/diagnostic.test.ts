import { describe, expect, it } from "vitest";
import { Attempt, normalizeCompletedAttempts, QUESTIONS, scoreDiagnostic } from "./diagnostic";
import { DIAGNOSTIC_ANSWER_KEY } from "./question-bank.server";

describe("scoreDiagnostic", () => {
  it("scores a fully correct, on-pace diagnostic deterministically", () => {
    const attempts: Attempt[] = QUESTIONS.map((question) => ({
      questionId: question.id,
      answerIndex: DIAGNOSTIC_ANSWER_KEY[question.id].correctIndex,
      elapsedSeconds: question.targetSeconds,
      confidence: 3,
    }));
    const result = scoreDiagnostic(QUESTIONS, attempts, DIAGNOSTIC_ANSWER_KEY);
    expect(result.correct).toBe(QUESTIONS.length);
    expect(result.accuracy).toBe(1);
    expect(result.paceScore).toBe(1);
    expect(result.confidenceScore).toBe(1);
  });

  it("prioritizes pacing when most responses exceed target time", () => {
    const attempts: Attempt[] = QUESTIONS.map((question) => ({
      questionId: question.id,
      answerIndex: DIAGNOSTIC_ANSWER_KEY[question.id].correctIndex,
      elapsedSeconds: question.targetSeconds + 20,
      confidence: 3,
    }));
    expect(scoreDiagnostic(QUESTIONS, attempts, DIAGNOSTIC_ANSWER_KEY).priority).toBe("Build a faster decision rhythm");
  });

  it("treats unanswered questions as incorrect", () => {
    const result = scoreDiagnostic(QUESTIONS, [], DIAGNOSTIC_ANSWER_KEY);
    expect(result.correct).toBe(0);
    expect(result.total).toBe(QUESTIONS.length);
    expect(result.accuracy).toBe(0);
  });

  it("normalizes missing questions into explicit unanswered records", () => {
    const attempts: Attempt[] = [{ questionId: QUESTIONS[0].id, answerIndex: 2, elapsedSeconds: 20, confidence: 3 }];
    const normalized = normalizeCompletedAttempts(QUESTIONS, attempts);
    expect(normalized).toHaveLength(QUESTIONS.length);
    expect(normalized[0]).toEqual(attempts[0]);
    expect(normalized[1]).toMatchObject({ questionId: QUESTIONS[1].id, answerIndex: null, elapsedSeconds: 0, confidence: null });
  });
});

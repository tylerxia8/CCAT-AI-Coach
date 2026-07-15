import { describe, expect, it } from "vitest";
import { Attempt, normalizeCompletedAttempts, QUESTIONS, scoreDiagnostic } from "./diagnostic";
import { DIAGNOSTIC_ANSWER_KEY } from "./question-bank.server";

describe("scoreDiagnostic", () => {
  it("ships a balanced 50-question, 15-minute full diagnostic", () => {
    expect(QUESTIONS).toHaveLength(50);
    expect(Object.keys(DIAGNOSTIC_ANSWER_KEY)).toHaveLength(50);
    expect(new Set(QUESTIONS.map((question) => question.id)).size).toBe(50);
    expect(QUESTIONS.reduce((total, question) => total + question.targetSeconds, 0)).toBe(900);
    expect(QUESTIONS.filter((question) => question.category === "Numerical")).toHaveLength(18);
    expect(QUESTIONS.filter((question) => question.category === "Verbal")).toHaveLength(16);
    expect(QUESTIONS.filter((question) => question.category === "Logic")).toHaveLength(10);
    expect(QUESTIONS.filter((question) => question.category === "Spatial")).toHaveLength(6);
  });

  it("keeps every answer key within its question's choice range", () => {
    for (const question of QUESTIONS) {
      const answer = DIAGNOSTIC_ANSWER_KEY[question.id];
      expect(answer, question.id).toBeDefined();
      expect(answer.correctIndex).toBeGreaterThanOrEqual(0);
      expect(answer.correctIndex).toBeLessThan(question.choices.length);
      expect(answer.explanation.length).toBeGreaterThan(20);
    }
  });

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

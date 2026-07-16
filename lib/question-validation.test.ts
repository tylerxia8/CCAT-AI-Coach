import { describe, expect, it } from "vitest";
import { QUESTIONS } from "./diagnostic";
import { PRACTICE_TEST_QUESTIONS } from "./practice-test";
import { DIAGNOSTIC_ANSWER_KEY } from "./question-bank.server";
import { PRACTICE_TEST_ANSWER_KEY } from "./practice-test-bank.server";
import { PRACTICE_QUESTIONS } from "./practice";
import { validateQuestionBank } from "./question-validation";

describe("question-bank quality gate", () => {
  it("accepts every timed bank", () => {
    expect(validateQuestionBank(QUESTIONS, DIAGNOSTIC_ANSWER_KEY)).toEqual([]);
    expect(validateQuestionBank(PRACTICE_TEST_QUESTIONS, PRACTICE_TEST_ANSWER_KEY)).toEqual([]);
  });

  it("maintains a 200-question original inventory with unique IDs", () => {
    const allQuestions = [...QUESTIONS, ...PRACTICE_TEST_QUESTIONS, ...PRACTICE_QUESTIONS];
    expect(allQuestions).toHaveLength(200);
    expect(new Set(allQuestions.map((question) => question.id)).size).toBe(200);
  });

  it("identifies ambiguous bank construction errors", () => {
    const question = { ...QUESTIONS[0], prompt: "Complete this ___", choices: ["A", "A", "", "D", "E"] };
    const issues = validateQuestionBank([question], { [question.id]: { correctIndex: 8, explanation: "Too short" } });
    expect(issues.map((item) => item.code)).toEqual(expect.arrayContaining(["duplicate_choice", "blank_choice", "missing_family", "answer_range", "weak_explanation"]));
  });
});

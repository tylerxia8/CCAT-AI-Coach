import { describe, expect, it } from "vitest";
import { PRACTICE_QUESTIONS } from "./practice";
import { PRACTICE_ANSWER_KEY } from "./practice-bank.server";

describe("practice bank", () => {
  it("has a private answer for every public question", () => {
    expect(Object.keys(PRACTICE_ANSWER_KEY).sort()).toEqual(PRACTICE_QUESTIONS.map((question) => question.id).sort());
  });

  it("keeps every correct index within its choice range", () => {
    for (const question of PRACTICE_QUESTIONS) {
      expect(PRACTICE_ANSWER_KEY[question.id].correctIndex).toBeGreaterThanOrEqual(0);
      expect(PRACTICE_ANSWER_KEY[question.id].correctIndex).toBeLessThan(question.choices.length);
    }
  });

  it("covers all four reasoning categories", () => {
    expect(new Set(PRACTICE_QUESTIONS.map((question) => question.category))).toEqual(new Set(["Numerical", "Verbal", "Logic", "Spatial"]));
  });
});

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
    expect(Object.fromEntries(["Numerical", "Verbal", "Logic", "Spatial"].map((category) => [category, PRACTICE_QUESTIONS.filter((question) => question.category === category).length])))
      .toEqual({ Numerical: 41, Verbal: 38, Logic: 26, Spatial: 25 });
  });

  it("maintains depth in the formerly thin skill areas", () => {
    const minimumCoverage: Record<string, number> = {
      averages: 3,
      "fractions and proportions": 3,
      "letter series": 3,
      reflection: 3,
      "word classification": 3,
      "data interpretation": 4,
      "attention to detail": 3,
      "figure matrices": 3,
    };

    for (const [skill, minimum] of Object.entries(minimumCoverage)) {
      expect(PRACTICE_QUESTIONS.filter((question) => question.skill === skill).length).toBeGreaterThanOrEqual(minimum);
    }
    expect(new Set(PRACTICE_QUESTIONS.flatMap((question) => question.stimulus ? [question.stimulus.kind] : [])))
      .toEqual(new Set(["bar", "table", "line", "pie", "pairs"]));
  });

  it("tags every drill question for adaptive selection", () => {
    expect(PRACTICE_QUESTIONS).toHaveLength(130);
    for (const question of PRACTICE_QUESTIONS) {
      expect(question.difficulty).toBeGreaterThanOrEqual(1);
      expect(question.difficulty).toBeLessThanOrEqual(5);
      expect(question.skill.length).toBeGreaterThan(2);
      expect(question.choices).toHaveLength(5);
      expect(new Set(question.choices.map((choice) => choice.toLowerCase())).size).toBe(5);
      expect(PRACTICE_ANSWER_KEY[question.id].explanation.length).toBeGreaterThan(20);
    }
    expect(new Set(PRACTICE_QUESTIONS.map((question) => question.difficulty)).size).toBeGreaterThanOrEqual(4);
    for (const difficulty of [1, 2, 3, 4, 5]) {
      expect(PRACTICE_QUESTIONS.filter((question) => question.difficulty === difficulty).length).toBeGreaterThanOrEqual(10);
    }
    expect(new Set(PRACTICE_QUESTIONS.map((question) => question.prompt.toLowerCase())).size).toBe(PRACTICE_QUESTIONS.length);
  });

  it("includes a contextual sentence-completion drill", () => {
    expect(PRACTICE_QUESTIONS.some((question) => question.id === "practice-ver-03" && question.prompt.includes("___"))).toBe(true);
  });

  it("scores the compound rotation question as east", () => {
    const question = PRACTICE_QUESTIONS.find((item) => item.id === "practice-spa-01");
    const answer = PRACTICE_ANSWER_KEY["practice-spa-01"];
    expect(question?.choices[answer.correctIndex]).toBe("East");
  });
});

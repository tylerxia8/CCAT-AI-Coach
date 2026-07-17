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
      .toEqual({ Numerical: 81, Verbal: 98, Logic: 76, Spatial: 75 });
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
      .toEqual(new Set(["bar", "table", "line", "pie", "pairs", "matrix"]));
  });

  it("tags every drill question for adaptive selection", () => {
    expect(PRACTICE_QUESTIONS).toHaveLength(330);
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

  it("fills the formerly thin logic and spatial families", () => {
    for (const skill of ["coding rules", "classification logic", "mixed series", "cube relations", "spatial tracking", "paper folding"]) {
      expect(PRACTICE_QUESTIONS.filter((question) => question.skill === skill).length).toBeGreaterThanOrEqual(5);
    }
    const expansion = PRACTICE_QUESTIONS.filter((question) => /practice-(log-(2[7-9]|[3-7]\d)|spa-(2[6-9]|[3-7]\d))/.test(question.id));
    expect(expansion).toHaveLength(100);
    for (const difficulty of [1, 2, 3, 4, 5]) expect(expansion.some((question) => question.difficulty === difficulty)).toBe(true);
  });

  it("prioritizes requested vocabulary, comparison, and hard-math coverage", () => {
    expect(PRACTICE_QUESTIONS.filter((question) => question.skill === "sentence completion").length).toBeGreaterThanOrEqual(40);
    expect(PRACTICE_QUESTIONS.filter((question) => question.skill === "attention to detail").length).toBeGreaterThanOrEqual(28);
    const advancedMath = PRACTICE_QUESTIONS.filter((question) => question.category === "Numerical" && question.difficulty >= 4);
    expect(advancedMath.length).toBeGreaterThanOrEqual(45);
    const comparisonAnswers = PRACTICE_QUESTIONS
      .filter((question) => /^practice-ver-(7[4-9]|8\d|9[0-8])$/.test(question.id))
      .map((question) => question.choices[PRACTICE_ANSWER_KEY[question.id].correctIndex]);
    expect(new Set(comparisonAnswers)).toEqual(new Set(["1", "2", "3", "4", "5"]));

    const answerPositions = Object.values(PRACTICE_ANSWER_KEY).reduce((counts, answer) => {
      counts[answer.correctIndex] += 1;
      return counts;
    }, [0, 0, 0, 0, 0]);
    expect(Math.min(...answerPositions)).toBeGreaterThanOrEqual(25);
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

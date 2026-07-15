import { describe, expect, it } from "vitest";
import { QUESTIONS } from "./diagnostic";
import { ccatDomainFor, validateCcatForm } from "./ccat-blueprint";

describe("CCAT form blueprint", () => {
  it("uses only the three verified official domains in the intended form balance", () => {
    expect(validateCcatForm(QUESTIONS)).toEqual([]);
    expect(QUESTIONS.filter((question) => ccatDomainFor(question.category) === "Verbal")).toHaveLength(15);
    expect(QUESTIONS.filter((question) => ccatDomainFor(question.category) === "Math & Logic")).toHaveLength(25);
    expect(QUESTIONS.filter((question) => ccatDomainFor(question.category) === "Spatial")).toHaveLength(10);
    expect(QUESTIONS.filter((question) => question.difficulty === 1)).toHaveLength(8);
    expect(QUESTIONS.filter((question) => question.difficulty === 2)).toHaveLength(28);
    expect(QUESTIONS.filter((question) => question.difficulty === 3)).toHaveLength(14);
  });

  it("rejects malformed forms instead of silently shipping them", () => {
    expect(validateCcatForm(QUESTIONS.slice(0, 49))).not.toEqual([]);
    expect(validateCcatForm([{ ...QUESTIONS[0], choices: ["A", "B"] }, ...QUESTIONS.slice(1)])).toContain("num-01 must have exactly five choices.");
  });

  it("includes native chart, graph, and table questions", () => {
    expect(QUESTIONS.filter((question) => question.stimulus?.kind === "bar")).toHaveLength(1);
    expect(QUESTIONS.filter((question) => question.stimulus?.kind === "line")).toHaveLength(1);
    expect(QUESTIONS.filter((question) => question.stimulus?.kind === "table")).toHaveLength(1);
  });
});

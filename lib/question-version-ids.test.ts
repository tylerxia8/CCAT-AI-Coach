import { describe, expect, it } from "vitest";
import { QUESTIONS } from "./diagnostic";
import { getQuestionVersionId, QUESTION_VERSION_IDS } from "./question-version-ids";

describe("question version mapping", () => {
  it("maps every shipped question to a unique immutable database version", () => {
    const mapped = QUESTIONS.map((question) => getQuestionVersionId(question.id));
    expect(mapped.every(Boolean)).toBe(true);
    expect(new Set(mapped).size).toBe(QUESTIONS.length);
  });

  it("does not silently map unknown content", () => {
    expect(getQuestionVersionId("unknown-question")).toBeNull();
  });

  it("uses UUID-shaped identifiers", () => {
    for (const value of Object.values(QUESTION_VERSION_IDS)) {
      expect(value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/);
    }
  });
});

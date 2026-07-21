import { describe, expect, it } from "vitest";
import { PRACTICE_QUESTIONS } from "./practice";
import { isSelectablePracticeTopic, PRACTICE_TOPICS, topicQuestionPool } from "./practice-topics";

describe("selectable practice topics", () => {
  it("provides a full rotating set for every public topic", () => {
    for (const topic of PRACTICE_TOPICS) {
      const pool = topicQuestionPool(PRACTICE_QUESTIONS, topic.skill, true);
      expect(pool.length).toBeGreaterThanOrEqual(10);
      expect(pool.every((question) => question.skill === topic.skill)).toBe(true);
    }
  });

  it("does not let arbitrary URL skills activate strict topic mode", () => {
    expect(isSelectablePracticeTopic("syllogisms")).toBe(false);
    expect(topicQuestionPool(PRACTICE_QUESTIONS, "syllogisms", true)).toBe(PRACTICE_QUESTIONS);
  });
});

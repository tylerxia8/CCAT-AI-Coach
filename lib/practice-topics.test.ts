import { describe, expect, it } from "vitest";
import { PRACTICE_QUESTIONS } from "./practice";
import { isSelectablePracticeTopic, practiceTopicCatalog, topicQuestionPool } from "./practice-topics";

describe("selectable practice topics", () => {
  it("publishes every bank skill and builds a strict pool for each", () => {
    const topics = practiceTopicCatalog(PRACTICE_QUESTIONS);
    expect(topics.length).toBe(new Set(PRACTICE_QUESTIONS.map((question) => question.skill)).size);
    for (const topic of topics) {
      const pool = topicQuestionPool(PRACTICE_QUESTIONS, topic.skill, true);
      expect(pool).toHaveLength(topic.count);
      expect(pool.every((question) => question.skill === topic.skill)).toBe(true);
    }
  });

  it("does not let arbitrary URL skills activate strict topic mode", () => {
    expect(isSelectablePracticeTopic(PRACTICE_QUESTIONS, "not a real skill")).toBe(false);
    expect(topicQuestionPool(PRACTICE_QUESTIONS, "not a real skill", true)).toBe(PRACTICE_QUESTIONS);
  });
});

import { describe, expect, it } from "vitest";
import { remediationLessonFor } from "./remediation-lessons";

describe("remediation lessons", () => {
  it.each([
    ["deductive reasoning", "Logic"],
    ["sentence completion", "Verbal"],
    ["percentages", "Math"],
    ["figure matrices", "Spatial"],
    ["attention to detail", "Attention to detail"],
  ])("builds a complete %s curriculum", (skill, domain) => {
    const lesson = remediationLessonFor(skill);
    expect(lesson.domain).toBe(domain);
    expect(lesson.modules).toHaveLength(4);
    for (const lessonModule of lesson.modules) {
      expect(lessonModule.instruction.length).toBeGreaterThanOrEqual(4);
      expect(lessonModule.workedExample.length).toBeGreaterThan(30);
      expect(lessonModule.check.choices[lessonModule.check.correctIndex]).toBeTruthy();
    }
  });
});

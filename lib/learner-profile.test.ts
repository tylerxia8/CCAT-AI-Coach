import { describe, expect, it } from "vitest";
import { buildLearnerProfile, recommendedLearnerTarget } from "./learner-profile";
import type { DiagnosticHistory } from "./history-store";

const baseSkill = { averageSeconds: 20, slow: 0, changed: 0, mastery: 50, level: "developing" as const };
const diagnostics: DiagnosticHistory = {
  version: 1,
  entries: [{
    sessionId: "diagnostic",
    completedAt: "2026-07-17T12:00:00Z",
    correct: 30,
    total: 50,
    accuracy: .6,
    averageSeconds: 18,
    paceScore: .7,
    confidenceScore: .7,
    categoryResults: [{ category: "Numerical", correct: 8, total: 15 }],
    bottleneck: "pacing",
    coachingTitle: "Personalized coaching",
    skillResults: [
      { ...baseSkill, skill: "number sequences", correct: 4, total: 4, onPace: 4, fastMisses: 0, mastery: 90, level: "secure" },
      { ...baseSkill, skill: "percentages", correct: 1, total: 4, onPace: 4, fastMisses: 2 },
      { ...baseSkill, skill: "sentence completion", correct: 1, total: 4, onPace: 1, fastMisses: 0, slow: 3 },
    ],
  }],
};

describe("learner profile", () => {
  it("separates strengths, rushing, and slow inaccurate work", () => {
    const profile = buildLearnerProfile(diagnostics, { version: 1, entries: [] });
    expect(profile.strengths[0]).toMatchObject({ skill: "number sequences", status: "strength", accuracy: 1, onPace: 1 });
    expect(profile.improvements[0]).toMatchObject({ skill: "percentages", status: "rushing", cause: "rushing" });
    expect(profile.improvements.find((signal) => signal.skill === "sentence completion")).toMatchObject({ status: "slow_inaccurate", cause: "knowledge" });
    expect(profile.summary).toContain("rushing math questions");
  });

  it("uses the highest-priority behavior to prescribe the next adaptive set", () => {
    expect(recommendedLearnerTarget(diagnostics, { version: 1, entries: [] })).toMatchObject({ skill: "percentages", cause: "rushing", targetDifficulty: 2 });
  });
});

import { describe, expect, it } from "vitest";
import { buildStudyPlan, nextStudyPlanSession, parseStudyPlanState, toggleStudyPlanSession } from "./study-plan";
import type { DiagnosticHistoryEntry } from "./history-store";

function baseline(bottleneck: DiagnosticHistoryEntry["bottleneck"] = "pacing"): DiagnosticHistoryEntry {
  return {
    sessionId: "baseline-session",
    completedAt: "2026-07-15T12:00:00Z",
    correct: 6,
    total: 8,
    accuracy: 0.75,
    averageSeconds: 30,
    paceScore: 0.6,
    confidenceScore: 0.8,
    categoryResults: [{ category: "Numerical", correct: 2, total: 3 }],
    bottleneck,
    coachingTitle: "Build a faster decision rhythm",
  };
}

describe("study plan", () => {
  it("builds a five-session sequence anchored to the latest baseline", () => {
    const plan = buildStudyPlan(baseline("pacing"));
    expect(plan.baselineSessionId).toBe("baseline-session");
    expect(plan.sessions).toHaveLength(5);
    expect(plan.sessions.map((session) => session.id)).toEqual(["method", "apply", "review", "mixed", "reassess"]);
    expect(plan.sessions.at(-1)?.href).toBe("/?new=1");
  });

  it("changes intervention copy by bottleneck", () => {
    expect(buildStudyPlan(baseline("confidence")).title).toContain("confident decisions");
    expect(buildStudyPlan(baseline("endurance")).title).toContain("final question");
  });

  it("tracks completion and advances the next action", () => {
    const plan = buildStudyPlan(baseline());
    let state = parseStudyPlanState(null, plan.baselineSessionId);
    expect(nextStudyPlanSession(plan, state)?.id).toBe("method");
    state = toggleStudyPlanSession(state, "method");
    expect(nextStudyPlanSession(plan, state)?.id).toBe("apply");
    state = toggleStudyPlanSession(state, "method");
    expect(state.completedSessionIds).toEqual([]);
  });

  it("resets stale completion state when the baseline changes", () => {
    const stale = JSON.stringify({ version: 1, baselineSessionId: "old", completedSessionIds: ["method"] });
    expect(parseStudyPlanState(stale, "new").completedSessionIds).toEqual([]);
  });
});

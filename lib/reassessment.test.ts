import { describe, expect, it } from "vitest";
import { compareWithBaseline } from "./reassessment";
import type { DiagnosticHistoryEntry } from "./history-store";

function entry(id: string, correct: number, paceScore: number, confidenceScore: number, completedAt: string): DiagnosticHistoryEntry {
  return { sessionId: id, correct, total: 50, accuracy: correct / 50, averageSeconds: 18, paceScore, confidenceScore, completedAt, categoryResults: [], bottleneck: "pacing", coachingTitle: "Coach" };
}

describe("reassessment comparison", () => {
  it("compares a later session with the first baseline", () => {
    const comparison = compareWithBaseline([entry("base", 22, .5, .6, "2026-01-01"), entry("new", 28, .7, .72, "2026-01-03")], "new");
    expect(comparison).toMatchObject({ scoreDelta: 6, paceDelta: .2, sessions: 2 });
  });

  it("requires a prior full diagnostic", () => {
    expect(compareWithBaseline([entry("only", 22, .5, .6, "2026-01-01")], "only")).toBeNull();
  });
});

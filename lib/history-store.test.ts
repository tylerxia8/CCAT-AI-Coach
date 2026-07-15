import { describe, expect, it } from "vitest";
import { addHistoryEntry, parseHistory, summarizeProgress, type DiagnosticHistoryEntry } from "./history-store";

function entry(sessionId: string, accuracy: number, completedAt: string, bottleneck: DiagnosticHistoryEntry["bottleneck"] = "pacing"): DiagnosticHistoryEntry {
  return {
    sessionId,
    completedAt,
    correct: Math.round(accuracy * 8),
    total: 8,
    accuracy,
    averageSeconds: 30,
    paceScore: 0.75,
    confidenceScore: 0.8,
    categoryResults: [{ category: "Numerical", correct: Math.round(accuracy * 3), total: 3 }],
    bottleneck,
    coachingTitle: "Test coaching title",
  };
}

describe("diagnostic history", () => {
  it("adds sessions chronologically and replaces duplicate session IDs", () => {
    let history = { version: 1 as const, entries: [] };
    history = addHistoryEntry(history, entry("later", 0.75, "2026-01-02T00:00:00Z"));
    history = addHistoryEntry(history, entry("earlier", 0.5, "2026-01-01T00:00:00Z"));
    history = addHistoryEntry(history, entry("later", 0.875, "2026-01-02T00:00:00Z"));
    expect(history.entries.map((item) => item.sessionId)).toEqual(["earlier", "later"]);
    expect(history.entries[1].accuracy).toBe(0.875);
  });

  it("summarizes improvement, category accuracy, and recurring bottlenecks", () => {
    const history = {
      version: 1 as const,
      entries: [entry("one", 0.5, "2026-01-01T00:00:00Z"), entry("two", 0.75, "2026-01-02T00:00:00Z")],
    };
    const summary = summarizeProgress(history);
    expect(summary).toMatchObject({ sessions: 2, latestAccuracy: 0.75, accuracyChange: 0.25 });
    expect(summary?.bottlenecks[0]).toEqual({ bottleneck: "pacing", count: 2 });
    expect(summary?.categoryAccuracy[0].attempts).toBe(6);
  });

  it("recovers safely from malformed storage", () => {
    expect(parseHistory("not-json").entries).toEqual([]);
    expect(parseHistory(JSON.stringify({ version: 2, entries: [] })).entries).toEqual([]);
  });
});

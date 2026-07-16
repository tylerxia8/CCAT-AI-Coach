import type { DiagnosticHistoryEntry } from "./history-store";

export type ReassessmentComparison = {
  baselineSessionId: string;
  sessions: number;
  scoreDelta: number;
  accuracyDelta: number;
  paceDelta: number;
  confidenceDelta: number;
  summary: string;
};

export function compareWithBaseline(entries: DiagnosticHistoryEntry[], currentSessionId: string): ReassessmentComparison | null {
  const ordered = [...entries].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  const current = ordered.find((entry) => entry.sessionId === currentSessionId);
  const baseline = ordered.find((entry) => entry.sessionId !== currentSessionId);
  if (!current || !baseline) return null;
  const scoreDelta = current.correct - baseline.correct;
  const paceDelta = roundedDelta(current.paceScore, baseline.paceScore);
  const accuracyDelta = roundedDelta(current.accuracy, baseline.accuracy);
  const confidenceDelta = roundedDelta(current.confidenceScore, baseline.confidenceScore);
  const improved = [scoreDelta > 0, paceDelta >= 0.05, confidenceDelta >= 0.05].filter(Boolean).length;
  return {
    baselineSessionId: baseline.sessionId,
    sessions: ordered.length,
    scoreDelta,
    accuracyDelta,
    paceDelta,
    confidenceDelta,
    summary: improved >= 2 ? "Your training is transferring under full-test conditions." : scoreDelta > 0 ? "Your raw score improved; stabilize pace and confidence next." : "The new baseline shows where the next training block should focus.",
  };
}

function roundedDelta(current: number, baseline: number) { return Math.round((current - baseline) * 10_000) / 10_000; }

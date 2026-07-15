import type { Bottleneck } from "./coaching";
import type { Category, ScoredDiagnosticResult } from "./diagnostic";

export const HISTORY_STORAGE_KEY = "aptitude-coach:history:v1";

export type DiagnosticHistoryEntry = {
  sessionId: string;
  completedAt: string;
  correct: number;
  total: number;
  accuracy: number;
  averageSeconds: number;
  paceScore: number;
  confidenceScore: number;
  categoryResults: Array<{ category: Category; correct: number; total: number }>;
  bottleneck: Bottleneck;
  coachingTitle: string;
};

export type DiagnosticHistory = {
  version: 1;
  entries: DiagnosticHistoryEntry[];
};

export type ProgressSummary = {
  sessions: number;
  latestAccuracy: number;
  accuracyChange: number | null;
  latestPaceScore: number;
  latestConfidenceScore: number;
  categoryAccuracy: Array<{ category: Category; accuracy: number; attempts: number }>;
  bottlenecks: Array<{ bottleneck: Bottleneck; count: number }>;
};

export function createHistoryEntry(sessionId: string, completedAt: string, result: ScoredDiagnosticResult): DiagnosticHistoryEntry {
  return {
    sessionId,
    completedAt,
    correct: result.correct,
    total: result.total,
    accuracy: result.accuracy,
    averageSeconds: result.averageSeconds,
    paceScore: result.paceScore,
    confidenceScore: result.confidenceScore,
    categoryResults: result.categoryResults,
    bottleneck: result.coaching.bottleneck,
    coachingTitle: result.coaching.title,
  };
}

export function addHistoryEntry(history: DiagnosticHistory, entry: DiagnosticHistoryEntry): DiagnosticHistory {
  const entries = [...history.entries.filter((existing) => existing.sessionId !== entry.sessionId), entry]
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  return { version: 1, entries };
}

export function parseHistory(value: string | null): DiagnosticHistory {
  if (!value) return { version: 1, entries: [] };
  try {
    const candidate = JSON.parse(value) as Partial<DiagnosticHistory>;
    if (candidate.version !== 1 || !Array.isArray(candidate.entries)) return { version: 1, entries: [] };
    const entries = candidate.entries.filter(isHistoryEntry);
    return { version: 1, entries };
  } catch {
    return { version: 1, entries: [] };
  }
}

export function summarizeProgress(history: DiagnosticHistory): ProgressSummary | null {
  if (!history.entries.length) return null;
  const latest = history.entries.at(-1)!;
  const first = history.entries[0];
  const categoryTotals = new Map<Category, { correct: number; total: number }>();
  const bottleneckCounts = new Map<Bottleneck, number>();
  for (const entry of history.entries) {
    bottleneckCounts.set(entry.bottleneck, (bottleneckCounts.get(entry.bottleneck) ?? 0) + 1);
    for (const category of entry.categoryResults) {
      const current = categoryTotals.get(category.category) ?? { correct: 0, total: 0 };
      categoryTotals.set(category.category, { correct: current.correct + category.correct, total: current.total + category.total });
    }
  }
  return {
    sessions: history.entries.length,
    latestAccuracy: latest.accuracy,
    accuracyChange: history.entries.length > 1 ? latest.accuracy - first.accuracy : null,
    latestPaceScore: latest.paceScore,
    latestConfidenceScore: latest.confidenceScore,
    categoryAccuracy: [...categoryTotals.entries()].map(([category, value]) => ({ category, accuracy: value.total ? value.correct / value.total : 0, attempts: value.total })),
    bottlenecks: [...bottleneckCounts.entries()].map(([bottleneck, count]) => ({ bottleneck, count })).sort((a, b) => b.count - a.count),
  };
}

function isHistoryEntry(value: unknown): value is DiagnosticHistoryEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<DiagnosticHistoryEntry>;
  return typeof entry.sessionId === "string"
    && typeof entry.completedAt === "string"
    && typeof entry.correct === "number"
    && typeof entry.total === "number"
    && typeof entry.accuracy === "number"
    && typeof entry.averageSeconds === "number"
    && typeof entry.paceScore === "number"
    && typeof entry.confidenceScore === "number"
    && Array.isArray(entry.categoryResults)
    && typeof entry.bottleneck === "string"
    && typeof entry.coachingTitle === "string";
}

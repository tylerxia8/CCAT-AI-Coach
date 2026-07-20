import type { Bottleneck } from "./coaching";
import type { Category, ScoredDiagnosticResult } from "./diagnostic";
import type { PerformanceCause } from "./performance-diagnosis";
import type { SkillMastery } from "./performance-diagnosis";
import type { MisconceptionSignal } from "./misconception-model";

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
  primaryCause?: PerformanceCause;
  weakestSkill?: string | null;
  skillResults?: SkillMastery[];
  misconceptions?: MisconceptionSignal[];
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
  skillPriorities: Array<{ skill: string; mastery: number; evidence: number }>;
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
    primaryCause: result.diagnosis.primaryCause,
    weakestSkill: result.diagnosis.weakestSkill,
    skillResults: result.diagnosis.skillBreakdown,
    misconceptions: result.diagnosis.misconceptions,
  };
}

export function addHistoryEntry(history: DiagnosticHistory, entry: DiagnosticHistoryEntry): DiagnosticHistory {
  const existing = history.entries.find((candidate) => candidate.sessionId === entry.sessionId);
  const enrichedEntry = existing?.skillResults && !entry.skillResults ? { ...entry, skillResults: existing.skillResults, misconceptions: entry.misconceptions ?? existing.misconceptions, primaryCause: entry.primaryCause ?? existing.primaryCause, weakestSkill: entry.weakestSkill ?? existing.weakestSkill } : entry;
  const entries = [...history.entries.filter((candidate) => candidate.sessionId !== entry.sessionId), enrichedEntry]
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
  const skillTotals = new Map<string, { weightedMastery: number; evidence: number }>();
  for (const entry of history.entries) {
    bottleneckCounts.set(entry.bottleneck, (bottleneckCounts.get(entry.bottleneck) ?? 0) + 1);
    for (const category of entry.categoryResults) {
      const current = categoryTotals.get(category.category) ?? { correct: 0, total: 0 };
      categoryTotals.set(category.category, { correct: current.correct + category.correct, total: current.total + category.total });
    }
    for (const skill of entry.skillResults ?? []) {
      const current = skillTotals.get(skill.skill) ?? { weightedMastery: 0, evidence: 0 };
      skillTotals.set(skill.skill, { weightedMastery: current.weightedMastery + skill.mastery * skill.total, evidence: current.evidence + skill.total });
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
    skillPriorities: [...skillTotals.entries()].map(([skill, value]) => ({ skill, mastery: Math.round(value.weightedMastery / value.evidence), evidence: value.evidence })).sort((a, b) => a.mastery - b.mastery || b.evidence - a.evidence).slice(0, 3),
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

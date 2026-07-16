import type { DiagnosticHistory } from "./history-store";
import type { PracticeHistory } from "./practice-store";

export function questionExposureCounts(history: PracticeHistory) {
  const counts: Record<string, number> = {};
  for (const entry of history.entries) for (const id of entry.questionIds ?? []) counts[id] = (counts[id] ?? 0) + 1;
  return counts;
}

export function recommendPracticeSkill(diagnostics: DiagnosticHistory, practice: PracticeHistory) {
  const evidence = new Map<string, { misses: number; total: number; lastSeen: number }>();
  practice.entries.slice(-5).forEach((entry, index) => {
    for (const result of entry.skillResults ?? []) {
      const current = evidence.get(result.skill) ?? { misses: 0, total: 0, lastSeen: 0 };
      evidence.set(result.skill, { misses: current.misses + result.total - result.correct, total: current.total + result.total, lastSeen: index });
    }
  });
  const practicePriority = [...evidence.entries()]
    .filter(([, result]) => result.misses > 0)
    .sort((a, b) => b[1].misses / b[1].total - a[1].misses / a[1].total || b[1].misses - a[1].misses || b[1].lastSeen - a[1].lastSeen)[0]?.[0];
  return practicePriority ?? diagnostics.entries.at(-1)?.weakestSkill ?? null;
}

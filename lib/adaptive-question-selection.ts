import type { DrillStage } from "./adaptive-practice";
import type { PracticeQuestion } from "./practice";
import type { PracticeHistory } from "./practice-store";

export type AbilityEstimate = {
  targetDifficulty: 1 | 2 | 3 | 4 | 5;
  observations: number;
  confidence: "low" | "moderate" | "high";
  reason: string;
};

export function estimateAbility(focus: string, stage: DrillStage, history: PracticeHistory): AbilityEstimate {
  const relevant = history.entries.filter((entry) => focusKey(entry.focus) === focusKey(focus)).slice(-4);
  const observations = relevant.reduce((sum, entry) => sum + entry.total, 0);
  const latest = relevant.at(-1);
  let target = latest?.averageDifficulty ?? ({ 1: 2, 2: 3, 3: 4 } as const)[stage];
  if (latest) {
    const accuracy = latest.correct / latest.total;
    const pace = latest.onPace / latest.total;
    if (accuracy >= .8 && pace >= .65) target += 1;
    else if (accuracy < .6) target -= 1;
  }
  if (focus.startsWith("knowledge") && !latest) target -= 1;
  const targetDifficulty = clampDifficulty(Math.round(target));
  return {
    targetDifficulty,
    observations,
    confidence: observations >= 24 ? "high" : observations >= 8 ? "moderate" : "low",
    reason: latest
      ? `Recent ${Math.round(latest.correct / latest.total * 100)}% accuracy and ${Math.round(latest.onPace / latest.total * 100)}% on-pace performance set this level.`
      : `Stage ${stage} starts at level ${targetDifficulty} while the app gathers personal evidence.`,
  };
}

export function selectAdaptiveSequence(questions: PracticeQuestion[], targetDifficulty: number, requestedSkill?: string | null, exposures: Record<string, number> = {}, limit = 10) {
  const preferred = requestedSkill ? questions.filter((question) => question.skill === requestedSkill) : [];
  const rank = (a: PracticeQuestion, b: PracticeQuestion) => (exposures[a.id] ?? 0) - (exposures[b.id] ?? 0) || Math.abs(a.difficulty - targetDifficulty) - Math.abs(b.difficulty - targetDifficulty) || a.difficulty - b.difficulty || a.id.localeCompare(b.id);
  const preferredLimit = Math.min(preferred.length, Math.max(1, Math.ceil(limit * .4)));
  const selectedPreferred = [...preferred].sort(rank).slice(0, preferredLimit);
  const remaining = questions.filter((question) => !preferred.some((item) => item.id === question.id));
  const sequence = [...remaining].sort(rank);
  for (const question of selectedPreferred) {
    const probePosition = question.difficulty === targetDifficulty ? 0 : question.difficulty < targetDifficulty ? 1 : 4;
    sequence.splice(Math.min(probePosition, sequence.length), 0, question);
  }
  const result = unique(sequence).slice(0, Math.min(limit, questions.length));
  for (const direction of ["lower", "higher"] as const) {
    const qualifies = (item: PracticeQuestion) => direction === "lower" ? item.difficulty < targetDifficulty : item.difficulty > targetDifficulty;
    if (result.some(qualifies)) continue;
    const candidate = [...questions].filter((item) => qualifies(item) && !result.some((selected) => selected.id === item.id)).sort(rank)[0];
    if (!candidate) continue;
    const replaceIndex = result.map((item, index) => ({ item, index })).reverse().find(({ item }) => item.skill !== requestedSkill && item.difficulty === targetDifficulty)?.index;
    if (replaceIndex !== undefined) result[replaceIndex] = candidate;
  }
  return result;
}

function unique(questions: PracticeQuestion[]) {
  const seen = new Set<string>();
  return questions.filter((question) => !seen.has(question.id) && Boolean(seen.add(question.id)));
}

function focusKey(value: string) { return value.trim().toLowerCase(); }
function clampDifficulty(value: number): 1 | 2 | 3 | 4 | 5 { return Math.max(1, Math.min(5, value)) as 1 | 2 | 3 | 4 | 5; }

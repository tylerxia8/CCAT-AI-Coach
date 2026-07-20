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
  const result: PracticeQuestion[] = [];
  const targetLength = Math.min(limit, questions.length);
  const add = (candidate?: PracticeQuestion) => {
    if (candidate && result.length < targetLength && !result.some((item) => item.id === candidate.id)) result.push(candidate);
  };

  // Keep remediation personal without letting one weak skill turn the entire set
  // into near-duplicate questions. Three targeted items provide enough evidence;
  // the remaining questions test transfer across the broader CCAT blueprint.
  const preferredLimit = Math.min(preferred.length, Math.max(1, Math.min(3, Math.ceil(limit * .3))));
  [...preferred].sort(rank).slice(0, preferredLimit).forEach(add);

  // Every normal ten-question set should visibly include the high-value formats
  // learners asked to practice, even when the current weakness is formal logic.
  for (const family of BALANCED_FAMILIES) {
    if (result.length >= targetLength) break;
    if (result.some(family.matches)) continue;
    add([...questions].filter((item) => !result.some((selected) => selected.id === item.id) && family.matches(item)).sort(rank)[0]);
  }

  for (const candidate of [...questions].sort(rank)) {
    if (result.length >= targetLength) break;
    if (isFormalLogic(candidate) && result.filter(isFormalLogic).length >= FORMAL_LOGIC_CAP) continue;
    const sameSkillCount = result.filter((item) => item.skill === candidate.skill).length;
    const skillCap = candidate.skill === requestedSkill ? 3 : 2;
    if (sameSkillCount >= skillCap) continue;
    add(candidate);
  }

  // Tiny banks used by tests or future specialty drills may not have all families.
  for (const candidate of [...questions].sort(rank)) {
    if (result.length >= targetLength) break;
    add(candidate);
  }
  for (const direction of ["lower", "higher"] as const) {
    const qualifies = (item: PracticeQuestion) => direction === "lower" ? item.difficulty < targetDifficulty : item.difficulty > targetDifficulty;
    if (result.some(qualifies)) continue;
    const candidate = [...questions].filter((item) =>
      qualifies(item)
      && !result.some((selected) => selected.id === item.id)
      && (!isFormalLogic(item) || result.filter(isFormalLogic).length < FORMAL_LOGIC_CAP),
    ).sort(rank)[0];
    if (!candidate) continue;
    const replaceIndex = result.map((item, index) => ({ item, index })).reverse().find(({ item }) => item.skill !== requestedSkill && item.difficulty === targetDifficulty)?.index;
    if (replaceIndex !== undefined) result[replaceIndex] = candidate;
  }
  return result;
}

const FORMAL_LOGIC_SKILLS = new Set(["deductive reasoning", "syllogisms", "ordering logic", "truth logic"]);
const FORMAL_LOGIC_CAP = 3;

const BALANCED_FAMILIES: Array<{ name: string; matches: (question: PracticeQuestion) => boolean }> = [
  {
    name: "vocabulary and context",
    matches: (question) => question.category === "Verbal" && ["vocabulary", "sentence completion", "antonyms", "verbal analogies", "word classification"].includes(question.skill),
  },
  {
    name: "charts and graphs",
    matches: (question) => question.stimulus !== undefined && ["bar", "line", "pie", "table"].includes(question.stimulus.kind),
  },
  {
    name: "mathematics",
    matches: (question) => question.category === "Numerical" && question.skill !== "number sequences" && question.stimulus === undefined,
  },
  {
    name: "pattern recognition",
    matches: (question) => ["number sequences", "letter series", "mixed series", "visual sequences", "figure matrices"].includes(question.skill),
  },
  {
    name: "exact comparisons",
    matches: (question) => question.skill === "attention to detail" || question.stimulus?.kind === "pairs",
  },
];

function isFormalLogic(question: PracticeQuestion) {
  return FORMAL_LOGIC_SKILLS.has(question.skill);
}

function focusKey(value: string) { return value.trim().toLowerCase(); }
function clampDifficulty(value: number): 1 | 2 | 3 | 4 | 5 { return Math.max(1, Math.min(5, value)) as 1 | 2 | 3 | 4 | 5; }

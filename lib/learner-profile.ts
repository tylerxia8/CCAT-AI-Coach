import type { DiagnosticHistory } from "./history-store";
import type { PerformanceCause } from "./performance-diagnosis";
import type { PracticeHistory } from "./practice-store";

export type LearnerSignalStatus = "strength" | "rushing" | "slow_accurate" | "slow_inaccurate" | "knowledge" | "developing";
export type LearnerSignal = {
  skill: string;
  label: string;
  correct: number;
  observations: number;
  accuracy: number;
  onPace: number;
  averageSeconds: number;
  fastMisses: number;
  status: LearnerSignalStatus;
  cause: PerformanceCause;
  targetDifficulty: 1 | 2 | 3 | 4 | 5;
  message: string;
  action: string;
  href: string;
};

export type LearnerProfile = { strengths: LearnerSignal[]; improvements: LearnerSignal[]; allSignals: LearnerSignal[]; summary: string };

type Totals = { correct: number; total: number; onPace: number; elapsed: number; timed: number; fastMisses: number };

export function buildLearnerProfile(diagnostics: DiagnosticHistory, practice: PracticeHistory): LearnerProfile {
  const totals = new Map<string, Totals>();
  for (const entry of diagnostics.entries.slice(-4)) {
    for (const result of entry.skillResults ?? []) add(totals, result.skill, result.correct, result.total, result.onPace ?? result.total - result.slow, result.averageSeconds, result.fastMisses ?? 0);
  }
  for (const entry of practice.entries.slice(-8)) {
    for (const result of entry.skillResults ?? []) add(totals, result.skill, result.correct, result.total, result.onPace ?? result.total, result.averageSeconds ?? 0, result.fastMisses ?? 0);
  }
  const allSignals = [...totals.entries()].filter(([, value]) => value.total >= 2).map(([skill, value]) => signalFor(skill, value));
  const strengths = allSignals.filter((signal) => signal.status === "strength").sort((a, b) => b.accuracy - a.accuracy || b.onPace - a.onPace || b.observations - a.observations).slice(0, 3);
  const improvements = allSignals.filter((signal) => signal.status !== "strength").sort(prioritySort).slice(0, 4);
  return {
    strengths,
    improvements,
    allSignals,
    summary: improvements.length
      ? `${strengths.length ? `You are strongest in ${strengths[0].label.toLowerCase()}. ` : ""}${improvements[0].message}`
      : "Your current evidence is balanced. Continue mixed practice to confirm the pattern.",
  };
}

export function recommendedLearnerTarget(diagnostics: DiagnosticHistory, practice: PracticeHistory) {
  return buildLearnerProfile(diagnostics, practice).improvements[0] ?? null;
}

function add(totals: Map<string, Totals>, skill: string, correct: number, total: number, onPace: number, averageSeconds: number, fastMisses: number) {
  const current = totals.get(skill) ?? { correct: 0, total: 0, onPace: 0, elapsed: 0, timed: 0, fastMisses: 0 };
  totals.set(skill, { correct: current.correct + correct, total: current.total + total, onPace: current.onPace + onPace, elapsed: current.elapsed + averageSeconds * total, timed: current.timed + Number(averageSeconds > 0) * total, fastMisses: current.fastMisses + fastMisses });
}

function signalFor(skill: string, value: Totals): LearnerSignal {
  const accuracy = value.correct / value.total;
  const onPace = value.onPace / value.total;
  const averageSeconds = value.timed ? Math.round(value.elapsed / value.timed) : 0;
  const status: LearnerSignalStatus = accuracy >= .8 && onPace >= .7
    ? "strength"
    : value.fastMisses >= 2 && value.fastMisses / value.total >= .2
      ? "rushing"
      : accuracy < .7 && onPace < .6
        ? "slow_inaccurate"
        : accuracy >= .75 && onPace < .6
          ? "slow_accurate"
          : accuracy < .65
            ? "knowledge"
            : "developing";
  const cause: PerformanceCause = status === "rushing" ? "rushing" : status === "slow_accurate" ? "speed" : status === "slow_inaccurate" || status === "knowledge" ? "knowledge" : "refinement";
  const label = skillLabel(skill);
  const targetDifficulty = (accuracy >= .85 && onPace >= .75 ? 4 : accuracy < .6 ? 2 : 3) as 2 | 3 | 4;
  const message = messageFor(status, label);
  return { skill, label, correct: value.correct, observations: value.total, accuracy, onPace, averageSeconds, fastMisses: value.fastMisses, status, cause, targetDifficulty, message, action: actionFor(status), href: `/practice?focus=${cause}&skill=${encodeURIComponent(skill)}&new=1` };
}

function messageFor(status: LearnerSignalStatus, label: string) {
  if (status === "strength") return `You are accurate and on pace with ${label.toLowerCase()}.`;
  if (status === "rushing") return `You are rushing ${label.toLowerCase()} and losing points. Take a brief verification beat before committing.`;
  if (status === "slow_accurate") return `You are accurate but a little slow on ${label.toLowerCase()}. Let’s compress the method without sacrificing accuracy.`;
  if (status === "slow_inaccurate") return `You are a little slow and inaccurate on ${label.toLowerCase()}. Let’s rebuild the method before adding time pressure.`;
  if (status === "knowledge") return `${label} accuracy is limiting your score. Let’s strengthen the underlying skill first.`;
  return `You are developing consistency with ${label.toLowerCase()}. Focus on clean decisions at target pace.`;
}

function actionFor(status: LearnerSignalStatus) {
  if (status === "rushing") return "Practice a verification beat";
  if (status === "slow_accurate") return "Build speed";
  if (status === "slow_inaccurate" || status === "knowledge") return "Rebuild this skill";
  return "Practice this skill";
}

function skillLabel(skill: string) {
  if (["number sequences", "letter series", "visual sequences", "figure matrices", "mixed series"].includes(skill)) return `Pattern-related questions: ${skill}`;
  if (["sentence completion", "vocabulary", "antonyms", "verbal analogies", "word classification"].includes(skill)) return `Reading and vocabulary questions: ${skill}`;
  if (["attention to detail"].includes(skill)) return "Pair-comparison questions";
  if (["mental rotation", "reflection", "cube relations", "spatial tracking"].includes(skill)) return "Spatial questions";
  if (["syllogisms", "ordering logic", "deductive reasoning", "coding rules", "classification logic"].includes(skill)) return "Logic questions";
  if (["percentages", "averages", "fractions and proportions", "rates and arithmetic", "basic algebra", "ratios and algebra", "work rates", "mixtures", "geometry", "systems of equations", "quadratic reasoning", "exponents", "digit algebra", "algebraic relationships", "numerical analogies", "number sequences"].includes(skill)) return `Math questions: ${skill}`;
  return `${skill.charAt(0).toUpperCase()}${skill.slice(1)} questions`;
}

function prioritySort(a: LearnerSignal, b: LearnerSignal) {
  const rank = { rushing: 0, slow_inaccurate: 1, knowledge: 2, slow_accurate: 3, developing: 4, strength: 5 };
  return rank[a.status] - rank[b.status] || a.accuracy - b.accuracy || a.onPace - b.onPace || b.observations - a.observations;
}

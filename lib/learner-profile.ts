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
  evidence: string;
  interpretation: string;
  impact: string;
  prescription: string[];
  successMeasure: string;
  confidence: "early signal" | "moderate evidence" | "strong evidence";
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
      ? `${strengths.length ? `${strengths[0].label} is currently your most dependable point source. ` : ""}${improvements[0].message} This priority is based on ${improvements[0].observations} recent skill-level observations across diagnostics and practice.`
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
  const details = detailFor(status, label, value, accuracy, onPace, averageSeconds);
  return { skill, label, correct: value.correct, observations: value.total, accuracy, onPace, averageSeconds, fastMisses: value.fastMisses, status, cause, targetDifficulty, message, ...details, action: actionFor(status), href: `/practice?focus=${cause}&skill=${encodeURIComponent(skill)}&new=1` };
}

function detailFor(status: LearnerSignalStatus, label: string, value: Totals, accuracy: number, onPace: number, averageSeconds: number) {
  const misses = value.total - value.correct;
  const slow = value.total - value.onPace;
  const evidence = `${value.correct} of ${value.total} correct; ${value.onPace} of ${value.total} within target pace${averageSeconds ? `; ${averageSeconds}s average` : ""}${value.fastMisses ? `; ${value.fastMisses} fast miss${value.fastMisses === 1 ? "" : "es"}` : ""}.`;
  const confidence = value.total >= 12 ? "strong evidence" as const : value.total >= 6 ? "moderate evidence" as const : "early signal" as const;
  if (status === "strength") return { evidence, confidence, interpretation: `You are recognizing the underlying ${label.toLowerCase()} method quickly and executing it reliably. This is a genuine point-producing skill, not merely untimed accuracy.`, impact: `Protect this strength: it can supply dependable first-pass points and preserve time for harder items.`, prescription: ["Keep it in mixed sets so the skill remains automatic.", "Increase difficulty only after accuracy and pace remain stable."], successMeasure: "Maintain at least 80% accuracy with 70% or more answers on pace." };
  if (status === "rushing") return { evidence, confidence, interpretation: `The speed is available, but the error pattern suggests incomplete reading, skipped computation checks, or premature commitment rather than a lack of ability.`, impact: `${misses} observed misses are currently reducing the value of your pace. Slowing only the final verification step can recover points without making the whole test slower.`, prescription: ["Name the rule or operation before selecting an answer.", "Use a five-second exact-value, sign, direction, or character check.", "Do not revisit unless you can state a concrete contradiction."], successMeasure: `Reduce fast misses to zero while keeping at least ${Math.max(60, Math.round(onPace * 100) - 10)}% of answers on pace.` };
  if (status === "slow_accurate") return { evidence, confidence, interpretation: `Your method is reliable, but it is using too many steps or too much checking. The knowledge is present; retrieval and execution need to become more automatic.`, impact: `${slow} slow decisions can limit how many of the 50 questions you reach, even when those answers are correct.`, prescription: ["Compare your method with the shortest worked solution.", "Repeat the same question family in short timed blocks.", "Leave at 30 seconds if no clear solution path has formed."], successMeasure: "Keep accuracy at 75% or higher while moving at least 70% of answers inside target pace." };
  if (status === "slow_inaccurate") return { evidence, confidence, interpretation: `Extra time is not yet producing reliable answers. That combination usually means the method is unclear, several approaches are being tried, or foundational knowledge is missing.`, impact: `This is a double cost: ${misses} missed points plus time that could have been used on more attainable questions.`, prescription: ["Return to untimed worked examples and name each step.", "Practice one question family at a time before mixing.", "Add a clock only after two clean sets in a row."], successMeasure: "Reach 70% untimed accuracy first, then bring at least 60% of answers inside target pace." };
  if (status === "knowledge") return { evidence, confidence, interpretation: `Timing is not the main constraint. The misses indicate that the relevant vocabulary, rule, relationship, or calculation is not consistently available yet.`, impact: `${misses} of ${value.total} observed opportunities were lost primarily to skill knowledge, so forcing more speed would likely reinforce guessing.`, prescription: ["Study the compact method and worked example before answering.", "Explain why each wrong choice fails.", "Retrieve the same skill again after 1, 3, and 7 days."], successMeasure: "Reach 75% accuracy across two separate sessions before increasing difficulty." };
  return { evidence, confidence, interpretation: `You show partial command of ${label.toLowerCase()}, but performance is not stable enough to call it either a strength or a single clear bottleneck.`, impact: "Inconsistent decisions make this skill hard to budget for during a timed test.", prescription: ["Use mixed examples to identify the question family faster.", "Track whether each miss came from method, pace, or verification."], successMeasure: "Produce two consecutive sets at 75% accuracy and 70% on-target pace." };
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

import type { Category, Question, QuestionReview } from "./diagnostic";

export type PerformanceCause = "knowledge" | "speed" | "rhythm" | "second_guessing" | "refinement";

export type CauseDiagnosis = {
  cause: PerformanceCause;
  score: number;
  confidence: "emerging" | "moderate" | "strong";
  evidence: string[];
};

export type TrainingPrescription = {
  mode: "learn" | "fluency" | "cadence" | "commitment" | "mixed";
  title: string;
  instructions: string;
  target: string;
};

export type PerformanceDiagnosis = {
  primaryCause: PerformanceCause;
  summary: string;
  causes: CauseDiagnosis[];
  prescriptions: TrainingPrescription[];
  weakestSkill: string | null;
};

export function inferQuestionSkill(question: Pick<Question, "category" | "prompt">) {
  const prompt = question.prompt.toLowerCase();
  if (question.category === "Numerical") {
    if (prompt.includes("comes next")) return "number sequences";
    if (prompt.includes("percent") || prompt.includes("marked down") || prompt.includes("discount")) return "percentages";
    if (prompt.includes("average")) return "averages";
    if (prompt.includes("fraction")) return "fractions and proportions";
    if (/\b[xy]\b/.test(prompt)) return "basic algebra";
    return "rates and arithmetic";
  }
  if (question.category === "Verbal") {
    if (prompt.includes("opposite")) return "antonyms";
    if (prompt.includes("does not belong")) return "word classification";
    if (prompt.includes(" is to ")) return "verbal analogies";
    return "vocabulary";
  }
  if (question.category === "Logic") {
    if (prompt.includes("first two statements")) return "deductive reasoning";
    if (prompt.includes("all ") || prompt.includes("no ") || prompt.includes("some ") || prompt.includes("every ")) return "syllogisms";
    if (prompt.includes("before") || prompt.includes("older") || prompt.includes("taller") || prompt.includes("ordered")) return "ordering logic";
    return "deductive reasoning";
  }
  if (prompt.includes("matrix") || prompt.includes("2×2")) return "figure matrices";
  if (prompt.includes("different") || prompt.includes("not a rotation")) return "figure classification";
  if (prompt.includes("rotat") || /[↖↗↘↙▲▶▼◀]/.test(question.prompt)) return "mental rotation";
  return "visual sequences";
}

export function diagnosePerformance(reviews: QuestionReview[]): PerformanceDiagnosis {
  const answered = reviews.filter((item) => item.selectedAnswer !== null);
  const misses = reviews.filter((item) => !item.isCorrect);
  const slow = answered.filter((item) => item.pace === "slow");
  const slowCorrect = slow.filter((item) => item.isCorrect);
  const normalTimeMisses = misses.filter((item) => item.selectedAnswer !== null && item.elapsedSeconds <= item.targetSeconds * 1.15);
  const changed = answered.filter((item) => item.answerChanges > 0);
  const repeatedChanges = answered.filter((item) => item.answerChanges >= 2);
  const changedMisses = changed.filter((item) => !item.isCorrect);
  const times = answered.map((item) => item.elapsedSeconds);
  const mean = times.length ? times.reduce((sum, value) => sum + value, 0) / times.length : 0;
  const deviation = times.length ? Math.sqrt(times.reduce((sum, value) => sum + (value - mean) ** 2, 0) / times.length) : 0;
  const variation = mean ? deviation / mean : 0;
  const slowStreak = longestStreak(reviews, (item) => item.pace === "slow" || item.selectedAnswer === null);
  const skillMisses = new Map<string, number>();
  const skillTotals = new Map<string, number>();
  for (const review of reviews) {
    skillTotals.set(review.skill, (skillTotals.get(review.skill) ?? 0) + 1);
    if (!review.isCorrect) skillMisses.set(review.skill, (skillMisses.get(review.skill) ?? 0) + 1);
  }
  const weakestSkillEntry = [...skillTotals.entries()]
    .filter(([, total]) => total >= 2)
    .map(([skill, total]) => ({ skill, total, misses: skillMisses.get(skill) ?? 0 }))
    .sort((a, b) => b.misses / b.total - a.misses / a.total)[0];
  const weakestSkill = weakestSkillEntry && weakestSkillEntry.misses / weakestSkillEntry.total >= 0.4 ? weakestSkillEntry.skill : null;

  const knowledgeScore = clamp((normalTimeMisses.length / Math.max(1, reviews.length)) * 2.2 + (weakestSkill ? 0.3 : 0));
  const speedScore = clamp((slowCorrect.length / Math.max(1, answered.length)) * 2 + (slow.length >= answered.length * 0.4 ? 0.2 : 0));
  const rhythmScore = clamp(Math.max(0, variation - 0.45) + Math.max(0, slowStreak - 2) * 0.12);
  const secondGuessingScore = clamp((changedMisses.length / Math.max(1, changed.length)) * 0.5 + repeatedChanges.length / Math.max(1, answered.length) * 2);

  const causes: CauseDiagnosis[] = [
    makeCause("knowledge", knowledgeScore, [
      `${normalTimeMisses.length} misses occurred without a major time overrun.`,
      weakestSkill ? `${weakestSkill} was the clearest recurring skill gap.` : "No single skill gap has enough evidence yet.",
    ], normalTimeMisses.length),
    makeCause("speed", speedScore, [
      `${slowCorrect.length} correct answers took longer than their target.`,
      `${slow.length} of ${answered.length} answered questions exceeded target pace.`,
    ], slowCorrect.length),
    makeCause("rhythm", rhythmScore, [
      `Response-time variability was ${Math.round(variation * 100)}% of the average pace.`,
      `The longest slow-or-skipped streak was ${slowStreak} questions.`,
    ], Math.max(slowStreak, times.length >= 8 ? 2 : 0)),
    makeCause("second_guessing", secondGuessingScore, [
      `${changed.length} answers were changed; ${changedMisses.length} of those finished incorrect.`,
      `${repeatedChanges.length} questions were changed more than once.`,
    ], changed.length),
  ].sort((a, b) => b.score - a.score);

  const primaryCause: PerformanceCause = repeatedChanges.length >= 3 && changedMisses.length >= Math.ceil(changed.length * 0.5)
    ? "second_guessing"
    : variation >= 0.65 && slowStreak < 3
      ? "rhythm"
      : causes[0]?.score >= 0.18 ? causes[0].cause : "refinement";
  return {
    primaryCause,
    summary: summaryFor(primaryCause, weakestSkill),
    causes,
    prescriptions: prescriptionsFor(primaryCause, weakestSkill),
    weakestSkill,
  };
}

function makeCause(cause: PerformanceCause, score: number, evidence: string[], observations: number): CauseDiagnosis {
  return { cause, score, confidence: observations >= 5 ? "strong" : observations >= 2 ? "moderate" : "emerging", evidence };
}

function prescriptionsFor(cause: PerformanceCause, skill: string | null): TrainingPrescription[] {
  if (cause === "knowledge") return [
    { mode: "learn", title: `Learn ${skill ?? "the missed patterns"}`, instructions: "Study a worked example, name the rule, then complete untimed examples with immediate corrective feedback.", target: "80% correct on unseen examples" },
    { mode: "mixed", title: "Prove transfer", instructions: "Mix the repaired skill with neighboring question types so the correct method must be recognized, not prompted.", target: "4 of 5 correct without a hint" },
  ];
  if (cause === "speed") return [
    { mode: "fluency", title: "Compress the method", instructions: "Repeat one known pattern with a shrinking time cap. Review shortcuts only after accuracy is stable.", target: "80% correct within 18 seconds" },
    { mode: "mixed", title: "Timed recognition sprint", instructions: "Alternate familiar item types and commit as soon as the governing pattern is identified.", target: "8 decisions at target pace" },
  ];
  if (cause === "rhythm") return [
    { mode: "cadence", title: "Build a steady decision cadence", instructions: "Use 3-question blocks with a 54-second checkpoint and a mandatory move-on signal at the end of each block.", target: "No block more than 10 seconds off pace" },
    { mode: "mixed", title: "Recover after a hard item", instructions: "Insert one deliberately difficult item into each block and practice resetting immediately afterward.", target: "Next-question time returns to target" },
  ];
  if (cause === "second_guessing") return [
    { mode: "commitment", title: "Train evidence-based commitment", instructions: "Record the rule supporting the first choice. Change it only when a specific contradiction is found.", target: "No repeated answer changes" },
    { mode: "mixed", title: "First-pass decision set", instructions: "Complete a short timed set and review changed answers separately from unchanged answers.", target: "Changes improve rather than reduce accuracy" },
  ];
  return [{ mode: "mixed", title: "Maintain and extend", instructions: "Use longer mixed sets while preserving accuracy, pace, and clean commitments.", target: "Stable performance across 12 questions" }];
}

function summaryFor(cause: PerformanceCause, skill: string | null) {
  if (cause === "knowledge") return `The strongest signal is a knowledge gap${skill ? ` in ${skill}` : ""}.`;
  if (cause === "speed") return "Your methods are often correct, but they are not yet fast enough.";
  if (cause === "rhythm") return "Your average pace hides an uneven question-to-question cadence.";
  if (cause === "second_guessing") return "Answer changes and repeated reconsideration are costing decisions.";
  return "No single limiting cause dominates; use mixed practice to refine execution.";
}

function longestStreak<T>(values: T[], predicate: (value: T) => boolean) {
  let longest = 0;
  let current = 0;
  for (const value of values) {
    current = predicate(value) ? current + 1 : 0;
    longest = Math.max(longest, current);
  }
  return longest;
}

function clamp(value: number) { return Math.max(0, Math.min(1, value)); }

export function causeLabel(cause: PerformanceCause) {
  return cause === "second_guessing" ? "Second-guessing" : cause.charAt(0).toUpperCase() + cause.slice(1);
}

export function categoryLabel(category: Category) { return category; }

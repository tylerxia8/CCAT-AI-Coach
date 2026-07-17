import type { QuestionReview } from "./diagnostic";
import type { PracticeHistory } from "./practice-store";

export type StrategyAnalysis = ReturnType<typeof analyzeStrategy>;

export function analyzeStrategy(reviews: QuestionReview[], allottedSeconds = 900) {
  const answered = reviews.filter((review) => review.selectedAnswer !== null);
  const correct = reviews.filter((review) => review.isCorrect).length;
  const spent = reviews.reduce((sum, review) => sum + review.elapsedSeconds, 0);
  const slowMisses = reviews.filter((review) => !review.isCorrect && review.elapsedSeconds > Math.max(30, review.targetSeconds * 1.5));
  const rushedMisses = reviews.filter((review) => !review.isCorrect && review.elapsedSeconds < review.targetSeconds * .55);
  const changedFromCorrect = reviews.filter((review) => !review.isCorrect && review.firstAnswerCorrect === true).length;
  const highConfidenceWrong = reviews.filter((review) => !review.isCorrect && review.confidence === 3).length;
  const lowConfidenceRight = reviews.filter((review) => review.isCorrect && review.confidence === 1).length;
  const averageSeconds = answered.length ? spent / answered.length : allottedSeconds / Math.max(1, reviews.length);
  const projectedAttempts = Math.min(50, Math.floor(allottedSeconds / Math.max(1, averageSeconds)));
  const projectedCorrect = Math.round(projectedAttempts * (correct / Math.max(1, answered.length)));
  const gain = Math.min(slowMisses.length, Math.floor(slowMisses.reduce((sum, review) => sum + Math.max(0, review.elapsedSeconds - 25), 0) / Math.max(18, averageSeconds)));
  const checkpoints = [0, 1, 2].map((segment) => {
    const slice = reviews.slice(Math.floor(reviews.length * segment / 3), Math.floor(reviews.length * (segment + 1) / 3));
    return { label: ["Opening", "Middle", "Finish"][segment], correct: slice.filter((item) => item.isCorrect).length, total: slice.length, seconds: slice.reduce((sum, item) => sum + item.elapsedSeconds, 0) };
  });
  const prescription = slowMisses.length >= 2
    ? "Use two passes: bank clear points first and leave any item that reaches 30 seconds without a path."
    : rushedMisses.length >= 2
      ? "Add a five-second verification step before committing on math, direction, and exact-match items."
      : changedFromCorrect >= 2
        ? "Keep your first answer unless you can name the specific rule or evidence that disproves it."
        : "Your decision rhythm is reasonably balanced. Build difficulty while preserving this pace.";
  return {
    correctPerMinute: spent ? correct / (spent / 60) : 0,
    slowMisses: slowMisses.length,
    rushedMisses: rushedMisses.length,
    changedFromCorrect,
    highConfidenceWrong,
    lowConfidenceRight,
    projectedAttempts,
    forecastLow: Math.max(0, projectedCorrect - 3),
    forecastHigh: Math.min(50, projectedCorrect + gain + 3),
    recoverablePoints: gain,
    checkpoints,
    prescription,
  };
}

export function curriculumSignals(history: PracticeHistory) {
  const bySkill = new Map<string, Array<{ accuracy: number; pace: number }>>();
  for (const entry of history.entries) for (const result of entry.skillResults ?? []) {
    const values = bySkill.get(result.skill) ?? [];
    values.push({ accuracy: result.correct / result.total, pace: (result.onPace ?? 0) / result.total });
    bySkill.set(result.skill, values);
  }
  return [...bySkill.entries()].filter(([, values]) => values.length >= 2).map(([skill, values]) => {
    const first = values[0]; const latest = values.at(-1)!;
    const change = (latest.accuracy - first.accuracy) + .35 * (latest.pace - first.pace);
    return { skill, sessions: values.length, change, status: change >= .15 ? "improving" as const : change <= -.05 ? "regressing" as const : "stalled" as const };
  }).sort((a, b) => a.change - b.change);
}

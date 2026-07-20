export const ITEM_CALIBRATION_KEY = "aptitude-coach:item-calibration:v1";
export type ItemStat = { questionId: string; attempts: number; correct: number; totalSeconds: number; fastMisses: number; slowMisses: number };
export type ItemCalibration = { version: 1; items: ItemStat[] };

export function parseItemCalibration(value: string | null): ItemCalibration {
  if (!value) return { version: 1, items: [] };
  try { const parsed = JSON.parse(value) as ItemCalibration; return parsed.version === 1 && Array.isArray(parsed.items) ? parsed : { version: 1, items: [] }; } catch { return { version: 1, items: [] }; }
}

export function recordItemOutcome(calibration: ItemCalibration, outcome: { questionId: string; isCorrect: boolean; elapsedSeconds: number; targetSeconds: number }): ItemCalibration {
  const old = calibration.items.find((item) => item.questionId === outcome.questionId) ?? { questionId: outcome.questionId, attempts: 0, correct: 0, totalSeconds: 0, fastMisses: 0, slowMisses: 0 };
  const updated = { ...old, attempts: old.attempts + 1, correct: old.correct + Number(outcome.isCorrect), totalSeconds: old.totalSeconds + outcome.elapsedSeconds, fastMisses: old.fastMisses + Number(!outcome.isCorrect && outcome.elapsedSeconds <= outcome.targetSeconds * .55), slowMisses: old.slowMisses + Number(!outcome.isCorrect && outcome.elapsedSeconds > outcome.targetSeconds * 1.5) };
  return { version: 1, items: [...calibration.items.filter((item) => item.questionId !== outcome.questionId), updated] };
}

export function calibrationSummary(calibration: ItemCalibration) {
  const observed = calibration.items.filter((item) => item.attempts > 0);
  const repeated = observed.filter((item) => item.attempts >= 2);
  return {
    observedItems: observed.length,
    repeatedItems: repeated.length,
    suspectItems: repeated.filter((item) => item.correct / item.attempts <= .1 || item.correct / item.attempts >= .95).map((item) => item.questionId),
    unstableItems: repeated.filter((item) => item.fastMisses + item.slowMisses >= Math.ceil(item.attempts * .75)).map((item) => item.questionId),
  };
}

import type { PracticeHistory, PracticeHistoryEntry } from "./practice-store";

export type DrillStage = 1 | 2 | 3;
export type DrillProgression = { stage: DrillStage; label: string; purpose: string; gate: string };

const STAGES: Record<DrillStage, Omit<DrillProgression, "stage">> = {
  1: { label: "Learn", purpose: "Build the method without avoidable time pressure.", gate: "Reach 75% accuracy." },
  2: { label: "Control", purpose: "Keep the method clean while introducing pace.", gate: "Reach 75% accuracy with 60% on pace." },
  3: { label: "Transfer", purpose: "Execute the skill at realistic test cadence.", gate: "Reach 80% accuracy with 75% on pace." },
};

export function drillProgression(focus: string, history: PracticeHistory): DrillProgression {
  const relevant = history.entries.filter((entry) => sameFocus(entry.focus, focus));
  let stage: DrillStage = 1;
  for (const entry of relevant) {
    if (stage === 1 && meetsStageGate(entry, 1)) stage = 2;
    else if (stage === 2 && meetsStageGate(entry, 2)) stage = 3;
  }
  return { stage, ...STAGES[stage] };
}

export function meetsStageGate(entry: PracticeHistoryEntry, stage: DrillStage) {
  const accuracy = entry.total ? entry.correct / entry.total : 0;
  const pace = entry.total ? entry.onPace / entry.total : 0;
  if (stage === 1) return accuracy >= .75;
  if (stage === 2) return accuracy >= .75 && pace >= .6;
  return accuracy >= .8 && pace >= .75;
}

export function targetForStage(baseTarget: number, stage: DrillStage, focus: string) {
  if (stage === 1) return focus.startsWith("knowledge") ? 120 : Math.max(baseTarget, 45);
  if (stage === 2) return Math.max(baseTarget, Math.round(baseTarget * 1.15));
  return focus.startsWith("speed") ? Math.max(12, Math.round(baseTarget * .7)) : Math.min(baseTarget, 18);
}

function sameFocus(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

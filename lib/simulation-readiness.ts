import type { DiagnosticResult } from "./diagnostic";
import type { DiagnosticHistory } from "./history-store";

export type SimulationReadiness = {
  tier: "foundation" | "developing" | "simulation_ready";
  label: string;
  score: number;
  summary: string;
  nextGate: string;
};

export function assessSimulationReadiness(result: Pick<DiagnosticResult, "accuracy" | "paceScore" | "confidenceScore">, observations: number): SimulationReadiness {
  const evidenceFactor = Math.min(1, observations / 50);
  const score = Math.round((result.accuracy * 0.55 + result.paceScore * 0.3 + result.confidenceScore * 0.15) * (0.85 + evidenceFactor * 0.15) * 100);
  if (observations >= 20 && result.accuracy >= 0.8 && result.paceScore >= 0.7 && score >= 76) return { tier: "simulation_ready", label: "Simulation-ready", score, summary: "Your accuracy and pace are holding together under timed conditions.", nextGate: "Confirm this level on one more fresh timed form." };
  if (result.accuracy >= 0.6 && result.paceScore >= 0.5 && score >= 58) return { tier: "developing", label: "Nearly simulation-ready", score, summary: "The foundation is working, but one performance dimension still needs reinforcement.", nextGate: result.accuracy < 0.75 ? "Reach 75% accuracy on unseen mixed questions." : "Bring at least 70% of decisions inside target pace." };
  return { tier: "foundation", label: "Build the foundation", score, summary: "Focused skill work should come before relying on full simulations.", nextGate: result.accuracy < 0.6 ? "Reach 60% accuracy in guided mixed practice." : "Complete a timed form with at least half of decisions on pace." };
}

export function assessLongitudinalReadiness(history: DiagnosticHistory) {
  const recent = history.entries.slice(-2);
  if (recent.length < 2) return { ready: false, label: "One more fresh form needed", reason: "Readiness requires stable performance on at least two forms." };
  const stableAccuracy = recent.every((entry) => entry.accuracy >= .75) && Math.abs(recent[1].accuracy - recent[0].accuracy) <= .12;
  const stablePace = recent.every((entry) => entry.paceScore >= .65);
  const confidence = recent.every((entry) => entry.confidenceScore >= .6);
  return stableAccuracy && stablePace && confidence
    ? { ready: true, label: "Stable across fresh forms", reason: "Accuracy, pace, and confidence held across the latest two diagnostics." }
    : { ready: false, label: "Readiness gate not yet met", reason: !stableAccuracy ? "Accuracy must reach 75% and remain stable across two forms." : !stablePace ? "At least 65% of decisions must be on pace across two forms." : "Confidence calibration must remain above 60% across two forms." };
}

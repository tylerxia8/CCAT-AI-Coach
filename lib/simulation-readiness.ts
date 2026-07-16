import type { DiagnosticResult } from "./diagnostic";

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

export const INTERVENTION_HISTORY_KEY = "aptitude-coach:intervention-history:v1";
export type InstructionTreatment = "worked_then_problem" | "predict_then_explain";
export type InterventionRun = { skill: string; treatment: InstructionTreatment; completedAt: string };

export function parseInterventionRuns(value: string | null): InterventionRun[] { if (!value) return []; try { const runs = JSON.parse(value) as InterventionRun[]; return Array.isArray(runs) ? runs.filter((run) => run && typeof run.skill === "string") : []; } catch { return []; } }
export function treatmentFor(skill: string, runs: InterventionRun[]): InstructionTreatment { return runs.filter((run) => run.skill === skill).length % 2 === 0 ? "worked_then_problem" : "predict_then_explain"; }
export function treatmentLabel(value: InstructionTreatment) { return value === "worked_then_problem" ? "Study the worked example, then solve" : "Predict the next step, then compare the explanation"; }

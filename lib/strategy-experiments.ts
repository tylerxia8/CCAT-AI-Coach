export const STRATEGY_HISTORY_KEY = "aptitude-coach:strategy-experiments:v1";
export type TestStrategy = "balanced" | "two_pass" | "accuracy_first" | "aggressive";
export type StrategyRun = { id: string; strategy: TestStrategy; correct: number; total: number; paceScore: number; completedAt: string };

export const STRATEGIES: Record<TestStrategy, { label: string; cue: string }> = {
  balanced: { label: "Balanced", cue: "Aim for a steady 18-second rhythm; move when the method is unclear." },
  two_pass: { label: "Two-pass", cue: "Bank obvious points first; leave slow items and spend saved time selectively." },
  accuracy_first: { label: "Accuracy-first", cue: "Solve fewer items cleanly and verify every computation or exact match." },
  aggressive: { label: "Fast pass", cue: "Decide quickly, eliminate, and avoid revisiting unless time remains." },
};

export function parseStrategyRuns(value: string | null): StrategyRun[] {
  if (!value) return [];
  try { const values = JSON.parse(value) as StrategyRun[]; return Array.isArray(values) ? values.filter((value) => value && STRATEGIES[value.strategy] && Number.isInteger(value.correct)) : []; }
  catch { return []; }
}

export function bestStrategy(runs: StrategyRun[]) {
  if (!runs.length) return null;
  const grouped = new Map<TestStrategy, { points: number; count: number; pace: number }>();
  for (const run of runs) { const current = grouped.get(run.strategy) ?? { points: 0, count: 0, pace: 0 }; grouped.set(run.strategy, { points: current.points + run.correct, count: current.count + 1, pace: current.pace + run.paceScore }); }
  return [...grouped.entries()].sort((a, b) => (b[1].points / b[1].count) - (a[1].points / a[1].count) || (b[1].pace / b[1].count) - (a[1].pace / a[1].count))[0][0];
}

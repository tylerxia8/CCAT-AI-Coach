import type { DrillStage } from "./adaptive-practice";

export type TimeConstraint = {
  enabled: boolean;
  hardStop: boolean;
  label: string;
};

export function timeConstraintFor(focus: string, stage: DrillStage): TimeConstraint {
  const timed = ["speed", "rhythm", "rushing"].some((cause) => focus.startsWith(cause));
  if (!timed) return { enabled: false, hardStop: false, label: "Untimed coaching" };
  if (stage === 1) return { enabled: true, hardStop: false, label: "Visible clock" };
  if (stage === 2) return { enabled: true, hardStop: false, label: "Pace warning" };
  return { enabled: true, hardStop: true, label: "Hard deadline" };
}

export function clockState(secondsRemaining: number) {
  if (secondsRemaining <= 0) return "expired" as const;
  if (secondsRemaining <= 5) return "urgent" as const;
  return "steady" as const;
}

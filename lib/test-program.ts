export const TEST_DATE_KEY = "aptitude-coach:test-date:v1";

export type TestProgram = { daysRemaining: number; phase: "urgent" | "one_week" | "build"; title: string; cadence: string; priorities: string[] };

export function buildTestProgram(testDate: string, now = new Date()): TestProgram | null {
  const target = new Date(`${testDate}T12:00:00`);
  if (!testDate || Number.isNaN(target.getTime())) return null;
  const daysRemaining = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
  if (daysRemaining <= 2) return { daysRemaining, phase: "urgent", title: "Protect points and arrive rested", cadence: "One short repair session; no heavy cramming", priorities: ["Review the skip policy", "Repair only the highest-confidence gap", "Run one brief pacing rehearsal", "Stop intensive practice the evening before"] };
  if (daysRemaining <= 9) return { daysRemaining, phase: "one_week", title: "Repair, transfer, simulate", cadence: "25–35 minutes daily with one recovery day", priorities: ["Complete the assigned foundation lesson", "Run recognition and automaticity sprints", "Verify delayed transfer", "Take two fresh timed forms"] };
  return { daysRemaining, phase: "build", title: "Build prerequisites before test pressure", cadence: "Four focused sessions per week", priorities: ["Repair prerequisite knowledge", "Use faded worked examples", "Build automaticity in weak families", "Add mixed and timed forms gradually"] };
}

import type { Bottleneck } from "./coaching";
import type { DiagnosticHistoryEntry } from "./history-store";
import type { PerformanceCause } from "./performance-diagnosis";

export const STUDY_PLAN_STATE_KEY = "aptitude-coach:study-plan:v1";

export type StudyPlanSession = {
  id: string;
  day: number;
  title: string;
  purpose: string;
  minutes: number;
  actionLabel: string;
  href: string;
};

export type StudyPlan = {
  version: 1;
  baselineSessionId: string;
  focus: Bottleneck | PerformanceCause;
  title: string;
  sessions: StudyPlanSession[];
};

export type StudyPlanState = {
  version: 1;
  baselineSessionId: string;
  completedSessionIds: string[];
};

const focusCopy: Record<Bottleneck, { title: string; skill: string; application: string }> = {
  pacing: { title: "Build a reliable decision rhythm", skill: "Practice the 30-second checkpoint on short mixed sets.", application: "Apply a two-pass rule under visible time pressure." },
  confidence: { title: "Calibrate confident decisions", skill: "Name the strongest competing answer before committing.", application: "Track high-confidence choices and audit the misses." },
  category: { title: "Strengthen your weakest reasoning pattern", skill: "Solve slowly enough to label the pattern before acting.", application: "Add time pressure only after the method is repeatable." },
  endurance: { title: "Protect accuracy through the final question", skill: "Use a deliberate midpoint reset between test halves.", application: "Practice maintaining first-half accuracy late in a set." },
  refinement: { title: "Extend strong performance under pressure", skill: "Review only slow correct answers, changed answers, and confident misses.", application: "Increase set length without changing your reliable method." },
};

const causeCopy: Record<PerformanceCause, { title: string; skill: string; application: string }> = {
  knowledge: { title: "Repair the underlying skill gap", skill: "Study worked examples and explain the governing rule before solving.", application: "Retrieve the rule on unseen examples, then mix it with neighboring skills." },
  rushing: { title: "Turn fast guesses into fast checks", skill: "Add a two-second verification beat before committing.", application: "Name the governing rule and verify the requested value without exceeding target pace." },
  speed: { title: "Turn correct methods into fast methods", skill: "Build fluency with shrinking time caps after accuracy is stable.", application: "Recognize and execute the method within the 18-second decision target." },
  rhythm: { title: "Build a consistent test cadence", skill: "Practice three-question blocks against fixed checkpoints.", application: "Recover immediately after a difficult item instead of carrying the delay forward." },
  second_guessing: { title: "Make cleaner final decisions", skill: "Change an answer only when you can name specific contradictory evidence.", application: "Compare the accuracy of changed and unchanged answers under time pressure." },
  refinement: { title: "Extend strong performance under pressure", skill: "Use longer mixed sets without changing reliable methods.", application: "Maintain accuracy and cadence across the full set." },
};

export function buildStudyPlan(baseline: DiagnosticHistoryEntry): StudyPlan {
  const focus = baseline.primaryCause ?? baseline.bottleneck;
  const copy = baseline.primaryCause ? causeCopy[baseline.primaryCause] : focusCopy[baseline.bottleneck];
  return {
    version: 1,
    baselineSessionId: baseline.sessionId,
    focus,
    title: copy.title,
    sessions: [
      { id: "method", day: 1, title: "Learn the intervention", purpose: copy.skill, minutes: 20, actionLabel: "Start focused drill", href: `/practice?focus=${focus}&new=1` },
      { id: "apply", day: 2, title: "Apply it at pace", purpose: copy.application, minutes: 25, actionLabel: "Run paced practice", href: `/practice?focus=${focus}&new=1` },
      { id: "review", day: 3, title: "Review high-information decisions", purpose: "Revisit incorrect, slow, and low-confidence decisions. Write one sentence describing the better rule for each.", minutes: 20, actionLabel: "Open progress", href: "/progress" },
      { id: "mixed", day: 4, title: "Prove it on a mixed set", purpose: "Complete a fresh mixed drill without pausing. Preserve the intervention even when the question type changes.", minutes: 25, actionLabel: "Start mixed drill", href: `/practice?focus=${focus}&new=1` },
      { id: "reassess", day: 5, title: "Measure the change", purpose: "Take a fresh timed diagnostic and compare accuracy, pace, confidence fit, and the highest-impact bottleneck.", minutes: 15, actionLabel: "Take diagnostic", href: "/?new=1" },
    ],
  };
}

export function parseStudyPlanState(value: string | null, baselineSessionId: string): StudyPlanState {
  if (!value) return emptyState(baselineSessionId);
  try {
    const state = JSON.parse(value) as Partial<StudyPlanState>;
    if (state.version !== 1 || state.baselineSessionId !== baselineSessionId || !Array.isArray(state.completedSessionIds)) return emptyState(baselineSessionId);
    return { version: 1, baselineSessionId, completedSessionIds: [...new Set(state.completedSessionIds.filter((id): id is string => typeof id === "string"))] };
  } catch { return emptyState(baselineSessionId); }
}

export function toggleStudyPlanSession(state: StudyPlanState, sessionId: string): StudyPlanState {
  const completed = state.completedSessionIds.includes(sessionId)
    ? state.completedSessionIds.filter((id) => id !== sessionId)
    : [...state.completedSessionIds, sessionId];
  return { ...state, completedSessionIds: completed };
}

export function nextStudyPlanSession(plan: StudyPlan, state: StudyPlanState) {
  return plan.sessions.find((session) => !state.completedSessionIds.includes(session.id)) ?? null;
}

function emptyState(baselineSessionId: string): StudyPlanState {
  return { version: 1, baselineSessionId, completedSessionIds: [] };
}

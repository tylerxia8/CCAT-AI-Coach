"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HISTORY_STORAGE_KEY, parseHistory } from "@/lib/history-store";
import { buildStudyPlan, nextStudyPlanSession, parseStudyPlanState, STUDY_PLAN_STATE_KEY, toggleStudyPlanSession, type StudyPlan, type StudyPlanState } from "@/lib/study-plan";

export function StudyPlanExperience() {
  const [plan, setPlan] = useState<StudyPlan | null | undefined>(undefined);
  const [state, setState] = useState<StudyPlanState | null>(null);

  useEffect(() => {
    const history = parseHistory(window.localStorage.getItem(HISTORY_STORAGE_KEY));
    const baseline = history.entries.at(-1);
    if (!baseline) { setPlan(null); return; }
    const generated = buildStudyPlan(baseline);
    setPlan(generated);
    setState(parseStudyPlanState(window.localStorage.getItem(STUDY_PLAN_STATE_KEY), generated.baselineSessionId));
  }, []);

  function toggle(sessionId: string) {
    if (!state) return;
    const updated = toggleStudyPlanSession(state, sessionId);
    setState(updated);
    window.localStorage.setItem(STUDY_PLAN_STATE_KEY, JSON.stringify(updated));
  }

  if (plan === undefined) return <main className="plan-shell"><div className="dashboard-loading">Building your plan…</div></main>;
  if (!plan || !state) {
    return <main className="plan-shell"><PlanNav /><section className="empty-progress"><div className="eyebrow">Personal study plan</div><h1>First, establish your baseline.</h1><p>Your plan will use diagnostic evidence to prioritize the intervention, practice sequence, and reassessment.</p><Link className="primary link-button" href="/?new=1">Begin diagnostic →</Link></section></main>;
  }

  const next = nextStudyPlanSession(plan, state);
  const completed = state.completedSessionIds.length;
  return (
    <main className="plan-shell">
      <PlanNav />
      <section className="plan-head"><div><div className="eyebrow">Five-session plan · {plan.focus}</div><h1>{plan.title}</h1><p>Short sessions, one behavioral focus, then a clean reassessment.</p></div><div className="plan-progress-ring"><strong>{completed}/5</strong><span>complete</span></div></section>
      {next ? <section className="next-session"><div className="drill-marker">Next</div><div><div className="section-label">Session {next.day}</div><h2>{next.title}</h2><p>{next.purpose}</p></div><Link className="primary link-button" href={next.href}>{next.actionLabel} →</Link></section> : <section className="next-session complete"><div className="drill-marker">Done</div><div><div className="section-label">Plan complete</div><h2>Compare your new baseline.</h2><p>Your completed plan remains saved. Review progress or begin another diagnostic to generate the next plan.</p></div><Link className="primary link-button" href="/progress">View progress →</Link></section>}
      <details className="plan-schedule"><summary>View all five sessions</summary><section className="plan-list">{plan.sessions.map((session) => { const isComplete = state.completedSessionIds.includes(session.id); return <article className={isComplete ? "completed" : ""} key={session.id}><button aria-label={`${isComplete ? "Mark incomplete" : "Mark complete"}: ${session.title}`} onClick={() => toggle(session.id)}>{isComplete ? "✓" : ""}</button><div className="plan-day">Session {session.day}<small>{session.minutes} min</small></div><div><h3>{session.title}</h3><p>{session.purpose}</p></div><Link href={session.href}>{session.actionLabel} →</Link></article>; })}</section></details>
    </main>
  );
}

function PlanNav() {
  return <nav className="nav"><Link className="brand brand-link" href="/"><span>AC</span>Aptitude Coach</Link><div className="nav-actions"><Link className="nav-text-link" href="/practice/topics">Choose topics</Link><Link className="nav-text-link" href="/progress">Progress</Link><Link className="nav-link" href="/settings">Settings</Link></div></nav>;
}

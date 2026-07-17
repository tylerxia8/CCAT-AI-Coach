"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addHistoryEntry, HISTORY_STORAGE_KEY, parseHistory, summarizeProgress, type DiagnosticHistory, type DiagnosticHistoryEntry } from "@/lib/history-store";
import { parsePracticeHistory, PRACTICE_HISTORY_KEY, type PracticeHistory } from "@/lib/practice-store";
import { buildLearnerProfile, type LearnerSignal } from "@/lib/learner-profile";
import { curriculumSignals } from "@/lib/score-improvement";
import { dueRepairs, parseRepairQueue, REPAIR_QUEUE_KEY, type RepairQueue } from "@/lib/repair-queue";

function percent(value: number) { return `${Math.round(value * 100)}%`; }

export function ProgressDashboard() {
  const [history, setHistory] = useState<DiagnosticHistory | null>(null);
  const [source, setSource] = useState<"browser" | "cloud">("browser");
  const [practiceHistory, setPracticeHistory] = useState<PracticeHistory>({ version: 1, entries: [] });
  const [repairQueue, setRepairQueue] = useState<RepairQueue>({ version: 1, items: [] });
  useEffect(() => {
    const refreshLocal = () => {
      setHistory(parseHistory(window.localStorage.getItem(HISTORY_STORAGE_KEY)));
      setPracticeHistory(parsePracticeHistory(window.localStorage.getItem(PRACTICE_HISTORY_KEY)));
      setRepairQueue(parseRepairQueue(window.localStorage.getItem(REPAIR_QUEUE_KEY)));
    };
    const local = parseHistory(window.localStorage.getItem(HISTORY_STORAGE_KEY));
    refreshLocal();
    setHistory(local);
    const onStorage = (event: StorageEvent) => { if ([HISTORY_STORAGE_KEY, PRACTICE_HISTORY_KEY, REPAIR_QUEUE_KEY].includes(event.key ?? "")) refreshLocal(); };
    const onVisible = () => { if (document.visibilityState === "visible") refreshLocal(); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refreshLocal);
    document.addEventListener("visibilitychange", onVisible);
    fetch("/api/progress")
      .then((response) => response.ok ? response.json() as Promise<{ entries: DiagnosticHistoryEntry[]; source: string }> : null)
      .then((payload) => {
        if (!payload?.entries.length) return;
        const merged = payload.entries.reduce(addHistoryEntry, local);
        window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(merged));
        setHistory(merged);
        if (payload.source === "cloud") setSource("cloud");
      })
      .catch(() => { /* Browser history remains available during cloud outages. */ });
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("focus", refreshLocal); document.removeEventListener("visibilitychange", onVisible); };
  }, []);
  if (!history) return <main className="progress-shell"><div className="dashboard-loading">Loading progress…</div></main>;
  const summary = summarizeProgress(history);
  const learnerProfile = buildLearnerProfile(history, practiceHistory);
  const practiceCorrect = practiceHistory.entries.reduce((total, entry) => total + entry.correct, 0);
  const practiceTotal = practiceHistory.entries.reduce((total, entry) => total + entry.total, 0);
  const latestPractice = practiceHistory.entries.at(-1);
  const repairs = dueRepairs(repairQueue);
  const curriculum = curriculumSignals(practiceHistory);

  if (!summary) {
    return (
      <main className="progress-shell">
        <DashboardNav />
        <section className="empty-progress"><div className="eyebrow">Your progress</div><h1>Start with a diagnostic.</h1><p>Your score, pace, confidence, and category trends will appear here after your first completed session.</p><Link className="primary link-button" href="/">Begin diagnostic →</Link></section>
      </main>
    );
  }

  return (
    <main className="progress-shell">
      <DashboardNav />
      <section className="dashboard-head"><div><div className="eyebrow">Performance dashboard</div><h1>Progress is a pattern.</h1><p>{summary.sessions} completed {summary.sessions === 1 ? "diagnostic" : "diagnostics"} · {source === "cloud" ? "synced across your account" : "saved in this browser"}</p></div><Link className="primary link-button" href="/">New diagnostic →</Link></section>
      <section className="dashboard-metrics">
        <article><small>Latest accuracy</small><strong>{percent(summary.latestAccuracy)}</strong><span>{summary.accuracyChange === null ? "Baseline established" : `${summary.accuracyChange >= 0 ? "+" : ""}${Math.round(summary.accuracyChange * 100)} points from baseline`}</span></article>
        <article><small>On-target pace</small><strong>{percent(summary.latestPaceScore)}</strong><span>Latest session</span></article>
        <article><small>Confidence fit</small><strong>{percent(summary.latestConfidenceScore)}</strong><span>Latest session</span></article>
        <article><small>Practice drills</small><strong>{practiceHistory.entries.length}</strong><span>{practiceTotal ? `${Math.round((practiceCorrect / practiceTotal) * 100)}% accuracy${latestPractice?.averageDifficulty ? ` · latest level ${latestPractice.averageDifficulty}/5` : ""}` : "No drills completed"}</span></article>
      </section>
      <section className="repair-summary"><div><div className="section-label">Spaced error repair</div><h2>{repairs.length ? `${repairs.length} missed item${repairs.length === 1 ? " is" : "s are"} due.` : "Your repair queue is current."}</h2><p>Correct repairs return after 1, 3, 7, 14, then 30 days. A new miss returns immediately.</p></div>{repairs.length > 0 && <Link className="primary link-button" href={`/practice?skill=${encodeURIComponent(repairs[0].skill)}&new=1`}>Repair {repairs[0].skill} →</Link>}</section>
      <section className="dashboard-grid">
        <article className="trend-card"><div className="section-label">Accuracy by session</div><div className="trend-chart">{history.entries.map((entry, index) => <div className="trend-column" key={entry.sessionId}><div className="trend-value">{percent(entry.accuracy)}</div><div className="trend-track"><i style={{ height: percent(entry.accuracy) }} /></div><span>{index + 1}</span></div>)}</div></article>
        <article className="bottleneck-card"><div className="section-label">Recurring bottlenecks</div>{summary.bottlenecks.map((item) => <div className="bottleneck-row" key={item.bottleneck}><span>{item.bottleneck}</span><strong>{item.count}×</strong></div>)}<p>Repeated findings matter more than a single session. Use these to choose where practice time goes.</p></article>
      </section>
      <section className="learner-report" aria-labelledby="learner-report-title">
        <div className="learner-report-head"><div><div className="section-label">Personalized performance report</div><h2 id="learner-report-title">What is helping—and costing—your score.</h2><p>{learnerProfile.summary}</p><small className="report-refresh-note">This report refreshes when you return from practice or complete a diagnostic. It emphasizes your latest 2 diagnostics and 4 drills, so old labels fade as your performance changes.</small></div><span>{learnerProfile.allSignals.reduce((total, signal) => total + signal.observations, 0)} recent observations</span></div>
        {learnerProfile.strengths.length > 0 && <div className="report-group"><h3>Reliable point sources</h3><div className="report-cards">{learnerProfile.strengths.map((signal) => <SignalCard key={signal.skill} signal={signal} strength />)}</div></div>}
        <div className="report-group"><h3>Highest-value improvements</h3>{learnerProfile.improvements.length ? <div className="report-cards">{learnerProfile.improvements.map((signal) => <SignalCard key={signal.skill} signal={signal} />)}</div> : <p className="report-empty">No clear weakness has enough evidence yet. Continue mixed practice to make the report more specific.</p>}</div>
      </section>
      <section className="category-progress"><div><div className="section-label">Cumulative category performance</div><h2>Where your points come from.</h2></div>{summary.categoryAccuracy.map((item) => <div className="category-progress-row" key={item.category}><span>{item.category}<small>{item.attempts} attempts</small></span><div className="bar"><i style={{ width: percent(item.accuracy) }} /></div><strong>{percent(item.accuracy)}</strong></div>)}</section>
      {summary.skillPriorities.length > 0 && <section className="priority-strip"><div><div className="section-label">Curriculum priorities</div><h2>Focus on these next.</h2></div>{summary.skillPriorities.map((item) => <div key={item.skill}><strong>{item.skill}</strong><span>{item.mastery}% mastery estimate · {item.evidence} observations</span></div>)}</section>}
      <section className="curriculum-health"><div><div className="section-label">Curriculum effectiveness</div><h2>Is practice transferring?</h2><p>We compare your first and latest drill evidence for each skill, including accuracy and pace.</p></div>{curriculum.length ? <div>{curriculum.slice(0, 6).map((signal) => <article key={signal.skill}><strong>{signal.skill}</strong><span>{signal.status === "improving" ? "Improving—keep the progression" : signal.status === "regressing" ? "Regressing—return to method practice" : "Stalled—change the drill or difficulty"}</span><small>{signal.sessions} sessions · {signal.change >= 0 ? "+" : ""}{Math.round(signal.change * 100)} transfer index</small></article>)}</div> : <p>Complete the same skill in at least two drill sessions to measure transfer.</p>}</section>
    </main>
  );
}

function reportStatus(status: string) {
  if (status === "rushing") return "Rushing";
  if (status === "slow_accurate") return "Build speed";
  if (status === "slow_inaccurate") return "Method + pace";
  if (status === "knowledge") return "Knowledge gap";
  return "Developing";
}

function SignalCard({ signal, strength = false }: { signal: LearnerSignal; strength?: boolean }) {
  return <article className={`report-card ${strength ? "strength" : signal.status}`}>
    <div><span>{strength ? "Strength" : reportStatus(signal.status)} · {signal.confidence}</span><h4>{signal.label}</h4><small className="signal-updated">Updated {relativeDate(signal.updatedAt)}</small></div>
    <p className="signal-lead">{signal.message}</p>
    <dl><div><dt>Accuracy</dt><dd>{percent(signal.accuracy)}</dd></div><div><dt>On pace</dt><dd>{percent(signal.onPace)}</dd></div><div><dt>Avg. time</dt><dd>{signal.averageSeconds ? `${signal.averageSeconds}s` : "—"}</dd></div></dl>
    <details className="signal-details"><summary>Why this diagnosis?</summary><div><h5>Observed evidence</h5><p>{signal.evidence}</p><h5>What it likely means</h5><p>{signal.interpretation}</p><h5>Likely score impact</h5><p>{signal.impact}</p><h5>Training prescription</h5><ol>{signal.prescription.map((step) => <li key={step}>{step}</li>)}</ol><h5>Graduation target</h5><p>{signal.successMeasure}</p></div></details>
    {!strength && <Link className="secondary link-button" href={signal.href}>{signal.action} →</Link>}
  </article>;
}

function relativeDate(value: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000));
  return days === 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
}

function DashboardNav() {
  return <nav className="nav"><Link className="brand brand-link" href="/"><span>AC</span>Aptitude Coach</Link><div className="nav-actions"><Link className="nav-text-link" href="/plan">Study plan</Link><Link className="nav-link" href="/settings">Settings</Link></div></nav>;
}

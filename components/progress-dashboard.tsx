"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addHistoryEntry, HISTORY_STORAGE_KEY, parseHistory, summarizeProgress, type DiagnosticHistory, type DiagnosticHistoryEntry } from "@/lib/history-store";
import { parsePracticeHistory, PRACTICE_HISTORY_KEY, type PracticeHistory } from "@/lib/practice-store";
import { buildLearnerProfile } from "@/lib/learner-profile";

function percent(value: number) { return `${Math.round(value * 100)}%`; }

export function ProgressDashboard() {
  const [history, setHistory] = useState<DiagnosticHistory | null>(null);
  const [source, setSource] = useState<"browser" | "cloud">("browser");
  const [practiceHistory, setPracticeHistory] = useState<PracticeHistory>({ version: 1, entries: [] });
  useEffect(() => {
    const local = parseHistory(window.localStorage.getItem(HISTORY_STORAGE_KEY));
    setPracticeHistory(parsePracticeHistory(window.localStorage.getItem(PRACTICE_HISTORY_KEY)));
    setHistory(local);
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
  }, []);
  if (!history) return <main className="progress-shell"><div className="dashboard-loading">Loading progress…</div></main>;
  const summary = summarizeProgress(history);
  const learnerProfile = buildLearnerProfile(history, practiceHistory);
  const practiceCorrect = practiceHistory.entries.reduce((total, entry) => total + entry.correct, 0);
  const practiceTotal = practiceHistory.entries.reduce((total, entry) => total + entry.total, 0);
  const latestPractice = practiceHistory.entries.at(-1);

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
      <section className="dashboard-grid">
        <article className="trend-card"><div className="section-label">Accuracy by session</div><div className="trend-chart">{history.entries.map((entry, index) => <div className="trend-column" key={entry.sessionId}><div className="trend-value">{percent(entry.accuracy)}</div><div className="trend-track"><i style={{ height: percent(entry.accuracy) }} /></div><span>{index + 1}</span></div>)}</div></article>
        <article className="bottleneck-card"><div className="section-label">Recurring bottlenecks</div>{summary.bottlenecks.map((item) => <div className="bottleneck-row" key={item.bottleneck}><span>{item.bottleneck}</span><strong>{item.count}×</strong></div>)}<p>Repeated findings matter more than a single session. Use these to choose where practice time goes.</p></article>
      </section>
      <section className="learner-report" aria-labelledby="learner-report-title">
        <div className="learner-report-head"><div><div className="section-label">Personalized performance report</div><h2 id="learner-report-title">What is helping—and costing—your score.</h2><p>{learnerProfile.summary}</p></div><span>{learnerProfile.allSignals.reduce((total, signal) => total + signal.observations, 0)} skill-level observations</span></div>
        {learnerProfile.strengths.length > 0 && <div className="report-group"><h3>What you are doing well</h3><div className="report-cards">{learnerProfile.strengths.map((signal) => <article className="report-card strength" key={signal.skill}><div><span>Strength</span><h4>{signal.label}</h4></div><p>{signal.message}</p><dl><div><dt>Accuracy</dt><dd>{percent(signal.accuracy)}</dd></div><div><dt>On pace</dt><dd>{percent(signal.onPace)}</dd></div><div><dt>Evidence</dt><dd>{signal.observations}</dd></div></dl></article>)}</div></div>}
        <div className="report-group"><h3>Where to improve next</h3>{learnerProfile.improvements.length ? <div className="report-cards">{learnerProfile.improvements.map((signal) => <article className={`report-card ${signal.status}`} key={signal.skill}><div><span>{reportStatus(signal.status)}</span><h4>{signal.label}</h4></div><p>{signal.message}</p><dl><div><dt>Accuracy</dt><dd>{percent(signal.accuracy)}</dd></div><div><dt>On pace</dt><dd>{percent(signal.onPace)}</dd></div><div><dt>Avg. time</dt><dd>{signal.averageSeconds ? `${signal.averageSeconds}s` : "—"}</dd></div></dl><Link className="secondary link-button" href={signal.href}>{signal.action} →</Link></article>)}</div> : <p className="report-empty">No clear weakness has enough evidence yet. Continue mixed practice to make the report more specific.</p>}</div>
      </section>
      <section className="category-progress"><div><div className="section-label">Cumulative category performance</div><h2>Where your points come from.</h2></div>{summary.categoryAccuracy.map((item) => <div className="category-progress-row" key={item.category}><span>{item.category}<small>{item.attempts} attempts</small></span><div className="bar"><i style={{ width: percent(item.accuracy) }} /></div><strong>{percent(item.accuracy)}</strong></div>)}</section>
      {summary.skillPriorities.length > 0 && <section className="priority-strip"><div><div className="section-label">Curriculum priorities</div><h2>Focus on these next.</h2></div>{summary.skillPriorities.map((item) => <div key={item.skill}><strong>{item.skill}</strong><span>{item.mastery}% mastery estimate · {item.evidence} observations</span></div>)}</section>}
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

function DashboardNav() {
  return <nav className="nav"><Link className="brand brand-link" href="/"><span>AC</span>Aptitude Coach</Link><div className="nav-actions"><Link className="nav-text-link" href="/plan">Study plan</Link><Link className="nav-link" href="/settings">Settings</Link></div></nav>;
}

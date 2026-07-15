"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HISTORY_STORAGE_KEY, parseHistory, summarizeProgress, type DiagnosticHistory } from "@/lib/history-store";

function percent(value: number) { return `${Math.round(value * 100)}%`; }

export function ProgressDashboard() {
  const [history, setHistory] = useState<DiagnosticHistory | null>(null);
  useEffect(() => setHistory(parseHistory(window.localStorage.getItem(HISTORY_STORAGE_KEY))), []);
  if (!history) return <main className="progress-shell"><div className="dashboard-loading">Loading progress…</div></main>;
  const summary = summarizeProgress(history);

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
      <section className="dashboard-head"><div><div className="eyebrow">Performance dashboard</div><h1>Progress is a pattern.</h1><p>{summary.sessions} completed {summary.sessions === 1 ? "diagnostic" : "diagnostics"} saved in this browser.</p></div><Link className="primary link-button" href="/">New diagnostic →</Link></section>
      <section className="dashboard-metrics">
        <article><small>Latest accuracy</small><strong>{percent(summary.latestAccuracy)}</strong><span>{summary.accuracyChange === null ? "Baseline established" : `${summary.accuracyChange >= 0 ? "+" : ""}${Math.round(summary.accuracyChange * 100)} points from baseline`}</span></article>
        <article><small>On-target pace</small><strong>{percent(summary.latestPaceScore)}</strong><span>Latest session</span></article>
        <article><small>Confidence fit</small><strong>{percent(summary.latestConfidenceScore)}</strong><span>Latest session</span></article>
      </section>
      <section className="dashboard-grid">
        <article className="trend-card"><div className="section-label">Accuracy by session</div><div className="trend-chart">{history.entries.map((entry, index) => <div className="trend-column" key={entry.sessionId}><div className="trend-value">{percent(entry.accuracy)}</div><div className="trend-track"><i style={{ height: percent(entry.accuracy) }} /></div><span>{index + 1}</span></div>)}</div></article>
        <article className="bottleneck-card"><div className="section-label">Recurring bottlenecks</div>{summary.bottlenecks.map((item) => <div className="bottleneck-row" key={item.bottleneck}><span>{item.bottleneck}</span><strong>{item.count}×</strong></div>)}<p>Repeated findings matter more than a single session. Use these to choose where practice time goes.</p></article>
      </section>
      <section className="category-progress"><div><div className="section-label">Cumulative category performance</div><h2>Where your points come from.</h2></div>{summary.categoryAccuracy.map((item) => <div className="category-progress-row" key={item.category}><span>{item.category}<small>{item.attempts} attempts</small></span><div className="bar"><i style={{ width: percent(item.accuracy) }} /></div><strong>{percent(item.accuracy)}</strong></div>)}</section>
    </main>
  );
}

function DashboardNav() {
  return <nav className="nav"><Link className="brand brand-link" href="/"><span>AC</span>Aptitude Coach</Link><Link className="nav-link" href="/auth">Account</Link></nav>;
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addHistoryEntry, HISTORY_STORAGE_KEY, parseHistory, summarizeProgress, type DiagnosticHistory, type DiagnosticHistoryEntry } from "@/lib/history-store";
import { parsePracticeHistory, PRACTICE_HISTORY_KEY, type PracticeHistory } from "@/lib/practice-store";
import { buildLearnerProfile, type LearnerSignal } from "@/lib/learner-profile";
import { curriculumSignals } from "@/lib/score-improvement";
import { dueRepairs, parseRepairQueue, REPAIR_QUEUE_KEY, type RepairQueue } from "@/lib/repair-queue";
import { LESSON_PROGRESS_KEY } from "@/lib/remediation-lessons";
import { dueTransfers, parseTransferQueue, TRANSFER_QUEUE_KEY, type TransferItem } from "@/lib/transfer-store";
import { calibrationSummary, ITEM_CALIBRATION_KEY, parseItemCalibration, type ItemCalibration } from "@/lib/item-calibration";
import { masteryPath, prerequisiteFor } from "@/lib/mastery-prerequisites";
import { buildTestProgram, TEST_DATE_KEY, type TestProgram } from "@/lib/test-program";
import { assessLongitudinalReadiness } from "@/lib/simulation-readiness";

function percent(value: number) { return `${Math.round(value * 100)}%`; }

export function ProgressDashboard() {
  const [history, setHistory] = useState<DiagnosticHistory | null>(null);
  const [source, setSource] = useState<"browser" | "cloud">("browser");
  const [practiceHistory, setPracticeHistory] = useState<PracticeHistory>({ version: 1, entries: [] });
  const [repairQueue, setRepairQueue] = useState<RepairQueue>({ version: 1, items: [] });
  const [lessonProgress, setLessonProgress] = useState<Record<string, number[]>>({});
  const [transferQueue, setTransferQueue] = useState<TransferItem[]>([]);
  const [itemCalibration, setItemCalibration] = useState<ItemCalibration>({ version: 1, items: [] });
  const [testProgram, setTestProgram] = useState<TestProgram | null>(null);
  useEffect(() => {
    const refreshLocal = () => {
      setHistory(parseHistory(window.localStorage.getItem(HISTORY_STORAGE_KEY)));
      setPracticeHistory(parsePracticeHistory(window.localStorage.getItem(PRACTICE_HISTORY_KEY)));
      setRepairQueue(parseRepairQueue(window.localStorage.getItem(REPAIR_QUEUE_KEY)));
      try { setLessonProgress(JSON.parse(window.localStorage.getItem(LESSON_PROGRESS_KEY) ?? "{}") as Record<string, number[]>); } catch { setLessonProgress({}); }
      setTransferQueue(parseTransferQueue(window.localStorage.getItem(TRANSFER_QUEUE_KEY)));
      setItemCalibration(parseItemCalibration(window.localStorage.getItem(ITEM_CALIBRATION_KEY)));
      setTestProgram(buildTestProgram(window.localStorage.getItem(TEST_DATE_KEY) ?? ""));
    };
    const local = parseHistory(window.localStorage.getItem(HISTORY_STORAGE_KEY));
    refreshLocal();
    setHistory(local);
    const onStorage = (event: StorageEvent) => { if ([HISTORY_STORAGE_KEY, PRACTICE_HISTORY_KEY, REPAIR_QUEUE_KEY, LESSON_PROGRESS_KEY, TRANSFER_QUEUE_KEY, ITEM_CALIBRATION_KEY, TEST_DATE_KEY].includes(event.key ?? "")) refreshLocal(); };
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
  const primary = learnerProfile.improvements[0] ?? null;
  const transferDue = dueTransfers(transferQueue)[0];
  const needsInstruction = Boolean(primary && ["guessing", "knowledge", "slow_inaccurate"].includes(primary.status));
  const lessonComplete = Boolean(primary && (lessonProgress[primary.skill]?.length ?? 0) >= 4);
  const lessonFirst = needsInstruction && !lessonComplete;
  const recognitionFirst = needsInstruction && lessonComplete;
  const nextHref = transferDue ? `/practice?focus=refinement&skill=${encodeURIComponent(transferDue.skill)}&new=1` : lessonFirst ? primary!.href : recognitionFirst ? `/recognition?skill=${encodeURIComponent(primary!.skill)}` : repairs.length ? `/practice?skill=${encodeURIComponent(repairs[0].skill)}&new=1` : primary?.href ?? "/practice?new=1";
  const nextTitle = transferDue ? `Verify ${transferDue.skill} after a delay` : lessonFirst ? `Learn ${primary!.label.toLowerCase()}` : recognitionFirst ? `Recognize ${primary!.label.toLowerCase()}` : repairs.length ? `Repair ${repairs[0].skill}` : primary ? primary.action : "Complete a mixed practice set";
  const nextReason = transferDue ? "This skill is due for an unseen delayed check. Passing it demonstrates retention rather than short-term familiarity." : lessonFirst ? `${primary!.message} Instruction comes before more timed practice.` : recognitionFirst ? "You passed the foundation checks. Now prove that you can identify the method before solving." : repairs.length ? `${repairs.length} missed item${repairs.length === 1 ? " is" : "s are"} ready for retrieval practice.` : primary?.message ?? "More recent practice will make your coaching recommendations more specific.";
  const path = primary ? masteryPath(primary.skill) : [];
  const calibration = calibrationSummary(itemCalibration);
  const latestMisconception = history.entries.at(-1)?.misconceptions?.[0];
  const readiness = assessLongitudinalReadiness(history);

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
      <section className="dashboard-head simplified"><div><div className="eyebrow">Your coaching home</div><h1>Know what to do next.</h1><p>{summary.sessions} completed {summary.sessions === 1 ? "diagnostic" : "diagnostics"} · {source === "cloud" ? "synced" : "saved in this browser"}</p></div></section>
      <section className="next-action-card" aria-labelledby="next-action-title"><div className="next-action-main"><div className="section-label">Your next best action</div><h2 id="next-action-title">{nextTitle}</h2><p>{nextReason}</p><Link className="primary link-button" href={nextHref}>Start this session →</Link></div><ol className="improvement-loop"><li className="active"><span>1</span><div><strong>Train</strong><small>Complete the recommended 10-question session.</small></div></li><li><span>2</span><div><strong>Update</strong><small>Your feedback adjusts from the new accuracy and pace evidence.</small></div></li><li><span>3</span><div><strong>Verify</strong><small>Reassess after the skill reaches its graduation target.</small></div></li></ol></section>
      {testProgram && <section className="test-program-strip"><div><strong>{testProgram.daysRemaining} days to test · {testProgram.title}</strong><span>{testProgram.cadence}</span></div><Link href="/settings">Change date</Link></section>}
      <section className="dashboard-metrics compact"><article><small>Latest accuracy</small><strong>{percent(summary.latestAccuracy)}</strong><span>{summary.accuracyChange === null ? "Baseline" : `${summary.accuracyChange >= 0 ? "+" : ""}${Math.round(summary.accuracyChange * 100)} points`}</span></article><article><small>On-target pace</small><strong>{percent(summary.latestPaceScore)}</strong><span>Latest diagnostic</span></article><article><small>Practice</small><strong>{practiceHistory.entries.length}</strong><span>{practiceTotal ? `${Math.round((practiceCorrect / practiceTotal) * 100)}% correct${latestPractice?.averageDifficulty ? ` · level ${latestPractice.averageDifficulty}` : ""}` : "sets completed"}</span></article></section>
      <section className={`readiness-gate ${readiness.ready ? "ready" : ""}`}><strong>{readiness.label}</strong><span>{readiness.reason}</span></section>
      {primary && <section className="current-priority"><div><div className="section-label">Current coaching priority</div><h2>{primary.label}</h2><p>{primary.interpretation}</p>{latestMisconception?.skill === primary.skill && <div className="misconception-callout"><strong>{latestMisconception.label}</strong><span>{latestMisconception.repair}</span></div>}<details className="priority-plan"><summary>View the mastery path</summary><p><strong>Prerequisite:</strong> {prerequisiteFor(primary.skill)}</p><ol>{path.map((step) => <li key={step.kind}><span>{step.title}</span><small>{step.gate}</small></li>)}</ol></details></div><SignalCard signal={primary} concise /></section>}
      <details className="dashboard-details"><summary>Explore detailed analytics</summary><div className="dashboard-details-body">
        <section className="dashboard-grid"><article className="trend-card"><div className="section-label">Accuracy by session</div><div className="trend-chart">{history.entries.map((entry, index) => <div className="trend-column" key={entry.sessionId}><div className="trend-value">{percent(entry.accuracy)}</div><div className="trend-track"><i style={{ height: percent(entry.accuracy) }} /></div><span>{index + 1}</span></div>)}</div></article><article className="bottleneck-card"><div className="section-label">Recurring bottlenecks</div>{summary.bottlenecks.map((item) => <div className="bottleneck-row" key={item.bottleneck}><span>{item.bottleneck}</span><strong>{item.count}×</strong></div>)}</article></section>
        <section className="learner-report" aria-labelledby="learner-report-title"><div className="learner-report-head"><div><div className="section-label">Full performance report</div><h2 id="learner-report-title">All current skill signals</h2><p>{learnerProfile.summary}</p></div><span>{learnerProfile.allSignals.reduce((total, signal) => total + signal.observations, 0)} recent observations</span></div>{learnerProfile.strengths.length > 0 && <div className="report-group"><h3>Reliable point sources</h3><div className="report-cards">{learnerProfile.strengths.map((signal) => <SignalCard key={signal.skill} signal={signal} strength />)}</div></div>}<div className="report-group"><h3>Other improvements</h3><div className="report-cards">{learnerProfile.improvements.slice(1).map((signal) => <SignalCard key={signal.skill} signal={signal} />)}</div></div></section>
        <section className="category-progress"><div><div className="section-label">Category performance</div><h2>Where your points come from.</h2></div>{summary.categoryAccuracy.map((item) => <div className="category-progress-row" key={item.category}><span>{item.category}<small>{item.attempts} attempts</small></span><div className="bar"><i style={{ width: percent(item.accuracy) }} /></div><strong>{percent(item.accuracy)}</strong></div>)}</section>
        <section className="curriculum-health"><div><div className="section-label">Training effectiveness</div><h2>Is practice transferring?</h2></div>{curriculum.length ? <div>{curriculum.slice(0, 6).map((signal) => <article key={signal.skill}><strong>{signal.skill}</strong><span>{signal.status === "improving" ? "Improving" : signal.status === "regressing" ? "Return to method practice" : "Change the drill"}</span><small>{signal.sessions} sessions</small></article>)}</div> : <p>Repeat a skill in two sessions to measure transfer.</p>}</section>
        <section className="item-health"><div className="section-label">Question-bank evidence</div><h2>{calibration.observedItems} items observed</h2><p>{calibration.repeatedItems} have repeat evidence. {calibration.suspectItems.length + calibration.unstableItems.length ? `${new Set([...calibration.suspectItems, ...calibration.unstableItems]).size} items are flagged for review instead of being trusted for curriculum decisions.` : "No repeated item has enough evidence to trigger a quality flag."}</p></section>
      </div></details>
    </main>
  );
}

function reportStatus(status: string) {
  if (status === "guessing") return "Likely guessing";
  if (status === "rushing") return "Rushing";
  if (status === "slow_accurate") return "Build speed";
  if (status === "slow_inaccurate") return "Method + pace";
  if (status === "knowledge") return "Knowledge gap";
  return "Developing";
}

function SignalCard({ signal, strength = false, concise = false }: { signal: LearnerSignal; strength?: boolean; concise?: boolean }) {
  return <article className={`report-card ${strength ? "strength" : signal.status}`}>
    <div><span>{strength ? "Strength" : reportStatus(signal.status)} · {signal.confidence}</span><h4>{signal.label}</h4><small className="signal-updated">Updated {relativeDate(signal.updatedAt)}</small></div>
    <p className="signal-lead">{signal.message}</p>
    <dl><div><dt>Accuracy</dt><dd>{percent(signal.accuracy)}</dd></div><div><dt>On pace</dt><dd>{percent(signal.onPace)}</dd></div><div><dt>Avg. time</dt><dd>{signal.averageSeconds ? `${signal.averageSeconds}s` : "—"}</dd></div></dl>
    {!concise && <details className="signal-details"><summary>Why this diagnosis?</summary><div><h5>Observed evidence</h5><p>{signal.evidence}</p><h5>What it likely means</h5><p>{signal.interpretation}</p><h5>Likely score impact</h5><p>{signal.impact}</p><h5>Training prescription</h5><ol>{signal.prescription.map((step) => <li key={step}>{step}</li>)}</ol><h5>Graduation target</h5><p>{signal.successMeasure}</p></div></details>}
    {!strength && <Link className="secondary link-button" href={signal.href}>{signal.action} →</Link>}
  </article>;
}

function relativeDate(value: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000));
  return days === 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
}

function DashboardNav() {
  return <nav className="nav"><Link className="brand brand-link" href="/"><span>AC</span>Aptitude Coach</Link><div className="nav-actions"><Link className="nav-text-link" href="/practice/topics">Choose topics</Link><Link className="nav-text-link" href="/plan">Study plan</Link><Link className="nav-link" href="/settings">Settings</Link></div></nav>;
}

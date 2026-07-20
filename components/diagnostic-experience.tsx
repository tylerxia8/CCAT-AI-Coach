"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Attempt, DIAGNOSTIC_SECONDS, normalizeCompletedAttempts, QUESTIONS, ScoredDiagnosticResult } from "@/lib/diagnostic";
import { appendEvent, createSession, parseSession, restoreRemainingSeconds, serializeSession, SESSION_STORAGE_KEY, StoredDiagnosticSession } from "@/lib/session-store";
import { CloudSyncStatus } from "@/components/cloud-sync-status";
import { QuestionReview } from "@/components/question-review";
import { addHistoryEntry, createHistoryEntry, HISTORY_STORAGE_KEY, parseHistory } from "@/lib/history-store";
import { PerformanceDiagnosis } from "@/components/performance-diagnosis";
import { QuestionStimulus } from "@/components/question-stimulus";
import { SimulationReadiness } from "@/components/simulation-readiness";
import { ResultSummary } from "@/components/result-summary";
import { ReassessmentComparison } from "@/components/reassessment-comparison";
import { compareWithBaseline, type ReassessmentComparison as Comparison } from "@/lib/reassessment";
import { ScoreStrategyReport } from "@/components/score-strategy-report";
import { parseRepairQueue, recordRepairEvidence, REPAIR_QUEUE_KEY } from "@/lib/repair-queue";
import { ITEM_CALIBRATION_KEY, parseItemCalibration, recordItemOutcome } from "@/lib/item-calibration";

type Stage = "welcome" | "test" | "results";

const TEST_SECONDS = DIAGNOSTIC_SECONDS;

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function checkpointCue(remaining: number, questionNumber: number) {
  if (remaining > 600) return `Opening phase · bank clear points${questionNumber < 12 ? "" : " · consider moving faster"}`;
  if (remaining > 300) return `Middle phase · protect rhythm · currently on question ${questionNumber}`;
  if (remaining > 120) return "Finish phase · use the move-on rule and avoid long traps";
  return "Final two minutes · make a decision on every reachable item";
}

export function DiagnosticExperience() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(TEST_SECONDS);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [confidence, setConfidence] = useState<Record<string, 1 | 2 | 3>>({});
  const [answerChanges, setAnswerChanges] = useState<Record<string, number>>({});
  const [firstAnswers, setFirstAnswers] = useState<Record<string, number>>({});
  const [firstAnswerSeconds, setFirstAnswerSeconds] = useState<Record<string, number>>({});
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [result, setResult] = useState<ScoredDiagnosticResult | null>(null);
  const [scoreError, setScoreError] = useState(false);
  const [storedSession, setStoredSession] = useState<StoredDiagnosticSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const questionStartedAt = useRef(Date.now());
  const deadlineAt = useRef(Date.now() + TEST_SECONDS * 1000);

  const question = QUESTIONS[index];
  useEffect(() => {
    if (!result) return;
    let queue = parseRepairQueue(window.localStorage.getItem(REPAIR_QUEUE_KEY));
    let calibration = parseItemCalibration(window.localStorage.getItem(ITEM_CALIBRATION_KEY));
    for (const review of result.reviews) { queue = recordRepairEvidence(queue, { key: review.questionId, skill: review.skill, category: review.category, isCorrect: review.isCorrect }); calibration = recordItemOutcome(calibration, { questionId: review.questionId, isCorrect: review.isCorrect, elapsedSeconds: review.elapsedSeconds, targetSeconds: review.targetSeconds }); }
    window.localStorage.setItem(REPAIR_QUEUE_KEY, JSON.stringify(queue));
    window.localStorage.setItem(ITEM_CALIBRATION_KEY, JSON.stringify(calibration));
  }, [result]);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new") === "1") window.localStorage.removeItem(SESSION_STORAGE_KEY);
    const restored = parseSession(window.localStorage.getItem(SESSION_STORAGE_KEY));
    if (restored) {
      setStoredSession(restored);
      setIndex(Math.min(restored.currentIndex, QUESTIONS.length - 1));
      const restoredRemaining = restoreRemainingSeconds(restored);
      setRemaining(restoredRemaining);
      deadlineAt.current = Date.now() + restoredRemaining * 1000;
      setAnswers(restored.answers);
      setConfidence(restored.confidence);
      setAnswerChanges(restored.answerChanges);
      setFirstAnswers(restored.firstAnswers);
      setFirstAnswerSeconds(restored.firstAnswerSeconds);
      setViewCounts(restored.viewCounts);
      setAttempts(restored.attempts);
      setStage(restored.status === "completed" ? "results" : "test");
      questionStartedAt.current = Date.now();
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setStoredSession((current) => {
      if (!current) return current;
      const nextSession: StoredDiagnosticSession = {
        ...current,
        currentIndex: index,
        remainingSeconds: remaining,
        answers,
        confidence,
        answerChanges,
        firstAnswers,
        firstAnswerSeconds,
        viewCounts,
        attempts,
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(SESSION_STORAGE_KEY, serializeSession(nextSession));
      return nextSession;
    });
  }, [answerChanges, answers, attempts, confidence, firstAnswerSeconds, firstAnswers, hydrated, index, remaining, viewCounts]);

  useEffect(() => {
    if (stage !== "results") return;
    const controller = new AbortController();
    setScoreError(false);
    fetch("/api/diagnostic/score", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ attempts: normalizeCompletedAttempts(QUESTIONS, attempts) }),
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Scoring failed");
        return response.json() as Promise<ScoredDiagnosticResult>;
      })
      .then((value) => {
        setResult(value);
        if (storedSession) {
          const history = parseHistory(window.localStorage.getItem(HISTORY_STORAGE_KEY));
          const entry = createHistoryEntry(storedSession.id, storedSession.updatedAt, value);
          const updatedHistory = addHistoryEntry(history, entry);
          window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
          setComparison(compareWithBaseline(updatedHistory.entries, entry.sessionId));
        }
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setScoreError(true);
      });
    return () => controller.abort();
  }, [attempts, stage, storedSession]);

  useEffect(() => {
    if (stage !== "test") return;
    if (remaining <= 0) {
      const elapsedSeconds = Math.max(1, Math.round((Date.now() - questionStartedAt.current) / 1000));
      const previous = attempts.find((attempt) => attempt.questionId === question.id);
      const timedAttempt: Attempt = {
        questionId: question.id,
        answerIndex: answers[question.id] ?? null,
        confidence: confidence[question.id] ?? null,
        elapsedSeconds: (previous?.elapsedSeconds ?? 0) + elapsedSeconds,
        answerChanges: answerChanges[question.id] ?? 0,
        firstAnswerIndex: firstAnswers[question.id] ?? null,
        firstAnswerSeconds: firstAnswerSeconds[question.id] ?? null,
        viewCount: viewCounts[question.id] ?? 1,
      };
      setAttempts((current) => [...current.filter((attempt) => attempt.questionId !== question.id), timedAttempt]);
      setStoredSession((current) => current ? {
        ...appendEvent(appendEvent(current, "question_submit", { questionId: question.id, payload: { elapsedSeconds, timedOut: true } }), "session_complete", { payload: { timedOut: true } }),
        status: "completed",
      } : current);
      setStage("results");
      return;
    }
    const timer = window.setInterval(() => {
      setRemaining(Math.max(0, Math.ceil((deadlineAt.current - Date.now()) / 1000)));
    }, 250);
    return () => window.clearInterval(timer);
  }, [answerChanges, answers, attempts, confidence, firstAnswerSeconds, firstAnswers, question, remaining, stage, viewCounts]);

  function start() {
    const session = appendEvent(createSession(), "session_start");
    const withQuestionView = appendEvent(session, "question_view", { questionId: QUESTIONS[0].id });
    setStoredSession(withQuestionView);
    setViewCounts({ [QUESTIONS[0].id]: 1 });
    window.localStorage.setItem(SESSION_STORAGE_KEY, serializeSession(withQuestionView));
    setStage("test");
    deadlineAt.current = Date.now() + TEST_SECONDS * 1000;
    questionStartedAt.current = Date.now();
  }

  function track(name: Parameters<typeof appendEvent>[1], details: Parameters<typeof appendEvent>[2]) {
    setStoredSession((current) => current ? appendEvent(current, name, details) : current);
  }

  function recordAndMove(nextIndex: number) {
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - questionStartedAt.current) / 1000));
    setAttempts((current) => {
      const previous = current.find((attempt) => attempt.questionId === question.id);
      const withoutCurrent = current.filter((attempt) => attempt.questionId !== question.id);
      return [...withoutCurrent, {
        questionId: question.id,
        answerIndex: answers[question.id] ?? null,
        confidence: confidence[question.id] ?? null,
        elapsedSeconds: (previous?.elapsedSeconds ?? 0) + elapsedSeconds,
        answerChanges: answerChanges[question.id] ?? 0,
        firstAnswerIndex: firstAnswers[question.id] ?? null,
        firstAnswerSeconds: firstAnswerSeconds[question.id] ?? null,
        viewCount: viewCounts[question.id] ?? 1,
      }];
    });
    const nextQuestionId = QUESTIONS[nextIndex].id;
    setViewCounts((current) => ({ ...current, [nextQuestionId]: (current[nextQuestionId] ?? 0) + 1 }));
    setIndex(nextIndex);
    track("question_submit", { questionId: question.id, payload: { elapsedSeconds } });
    track("question_view", { questionId: QUESTIONS[nextIndex].id });
    questionStartedAt.current = Date.now();
  }

  function finish() {
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - questionStartedAt.current) / 1000));
    const previous = attempts.find((attempt) => attempt.questionId === question.id);
    const finalAttempts = attempts.filter((attempt) => attempt.questionId !== question.id);
    finalAttempts.push({
      questionId: question.id,
      answerIndex: answers[question.id] ?? null,
      confidence: confidence[question.id] ?? null,
      elapsedSeconds: (previous?.elapsedSeconds ?? 0) + elapsedSeconds,
      answerChanges: answerChanges[question.id] ?? 0,
      firstAnswerIndex: firstAnswers[question.id] ?? null,
      firstAnswerSeconds: firstAnswerSeconds[question.id] ?? null,
      viewCount: viewCounts[question.id] ?? 1,
    });
    setAttempts(finalAttempts);
    setStoredSession((current) => {
      if (!current) return current;
      const submitted = appendEvent(current, "question_submit", { questionId: question.id, payload: { elapsedSeconds } });
      return { ...appendEvent(submitted, "session_complete", { payload: { answered: Object.keys(answers).length } }), status: "completed" };
    });
    setStage("results");
  }

  if (stage === "welcome") {
    return (
      <main className="shell welcome-shell">
        <nav className="nav"><div className="brand"><span>AC</span>Aptitude Coach</div><div className="nav-actions"><Link className="nav-text-link" href="/practice-tests">Practice</Link><Link className="nav-text-link" href="/progress">My coaching</Link><Link className="nav-link" href="/auth">Sign in</Link></div></nav>
        <section className="hero">
          <div className="eyebrow">Full diagnostic · 15 minutes</div>
          <h1>Find the points you’re <em>leaving on the clock.</em></h1>
          <p className="hero-copy">This short diagnostic measures more than right and wrong. It looks at your pace, confidence, and decision patterns to identify the most useful next drill.</p>
          <div className="hero-actions">
            <button className="primary" onClick={start}>Begin diagnostic <span>→</span></button>
            <span className="quiet">50 original aptitude questions</span>
          </div>
        </section>
        <section className="feature-grid">
          <article><div className="feature-number">01</div><h2>Accuracy</h2><p>See which reasoning categories are costing you points.</p></article>
          <article><div className="feature-number">02</div><h2>Pacing</h2><p>Separate genuine knowledge gaps from slow decisions.</p></article>
          <article><div className="feature-number">03</div><h2>Confidence</h2><p>Spot overthinking, guessing, and missed opportunities.</p></article>
        </section>
        <footer>Original aptitude-practice content · Not affiliated with any assessment publisher</footer>
      </main>
    );
  }

  if (stage === "results") {
    if (!result) {
      return (
        <main className="shell results-shell">
          <nav className="nav"><div className="brand"><span>AC</span>Aptitude Coach</div><div className="nav-note">Diagnostic complete</div></nav>
          <section className="analysis-state"><div className="eyebrow">Secure scoring</div><h1>{scoreError ? "We couldn’t score this session." : "Analyzing your decisions…"}</h1><p>{scoreError ? "Your answers are still saved in this browser. Refresh to try scoring again." : "The answer key stays on the server while we calculate your accuracy, pacing, and confidence fit."}</p>{scoreError && <button className="primary" onClick={() => window.location.reload()}>Try again</button>}</section>
        </main>
      );
    }
    return (
      <main className="shell results-shell">
        <nav className="nav"><div className="brand"><span>AC</span>Aptitude Coach</div><div className="nav-actions"><Link className="nav-text-link" href="/progress">View progress</Link><Link className="nav-link" href="/auth">Save progress</Link></div></nav>
        <section className="results-head">
          <div><div className="eyebrow">Your starting point</div><h1>{result.correct} of {result.total} correct</h1><p>Your highest-impact next move is to <strong>{result.priority.toLowerCase()}</strong>.</p><CloudSyncStatus session={storedSession} diagnosticResult={result} /></div>
          <div className="score-ring"><strong>{Math.round(result.accuracy * 100)}</strong><span>% accuracy</span></div>
        </section>
        <ReassessmentComparison comparison={comparison} />
        <ResultSummary result={result} />
        <details className="results-details">
          <summary>View complete performance report and question review</summary>
        <section className="metric-grid">
          <article><span>Average pace</span><strong>{result.averageSeconds}s</strong><small>per question</small></article>
          <article><span>On-target pace</span><strong>{Math.round(result.paceScore * 100)}%</strong><small>within target time</small></article>
          <article><span>Confidence fit</span><strong>{Math.round(result.confidenceScore * 100)}%</strong><small>calibrated decisions</small></article>
        </section>
        <SimulationReadiness result={result} observations={result.total} />
        <ScoreStrategyReport reviews={result.reviews} />
        <section className="report-grid">
          <article className="category-card"><div className="section-label">Category performance</div>{result.categoryResults.filter((item) => item.total).map((item) => <div className="category-row" key={item.category}><span>{item.category}</span><div className="bar"><i style={{ width: `${(item.correct / item.total) * 100}%` }} /></div><b>{item.correct}/{item.total}</b></div>)}</article>
          <article className="coach-card">
            <div className="section-label">Highest-impact bottleneck · {result.coaching.bottleneck}</div>
            <h2>{result.coaching.title}</h2>
            <ul className="coach-evidence">{result.coaching.evidence.map((item) => <li key={item}>{item}</li>)}</ul>
            <p>{result.coaching.strategy}</p>
          </article>
        </section>
        <section className="drill-card">
          <div className="drill-marker">Next drill</div>
          <div><div className="section-label">Prescribed practice</div><h2>{result.coaching.drill.title}</h2><p>{result.coaching.drill.instructions}</p></div>
          <div className="drill-target"><small>Completion target</small><strong>{result.coaching.drill.target}</strong><Link className="secondary drill-link" href={`/practice?focus=${result.coaching.bottleneck}&new=1`}>Start prescribed drill</Link></div>
        </section>
        <PerformanceDiagnosis diagnosis={result.diagnosis} />
        <QuestionReview reviews={result.reviews} />
        </details>
      </main>
    );
  }

  return (
    <main className="test-shell">
      <header className="test-header">
        <div className="brand compact"><span>AC</span></div>
        <div className="progress-copy">Question <strong>{index + 1}</strong> of {QUESTIONS.length}</div>
        <div className={`timer ${remaining < 60 ? "urgent" : ""}`}><span>Time remaining</span><strong>{formatTime(remaining)}</strong></div>
      </header>
      <div className="progress"><i style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }} /></div>
      <div className="live-checkpoint" aria-live="polite">{checkpointCue(remaining, index + 1)}</div>
      <section className={`question-wrap ${question.category === "Spatial" ? "spatial-question" : ""}`}>
        <div className="question-meta"><span>{question.category}</span><span>Target pace · {question.targetSeconds}s</span></div>
        {question.stimulus && <QuestionStimulus stimulus={question.stimulus} />}
        <h1>{question.prompt}</h1>
        <div className="choices">
          {question.choices.map((choice, choiceIndex) => (
            <button key={choice} className={answers[question.id] === choiceIndex ? "selected" : ""} onClick={() => {
              const previousAnswer = answers[question.id];
              if (firstAnswers[question.id] === undefined) {
                const priorViewing = attempts.find((attempt) => attempt.questionId === question.id)?.elapsedSeconds ?? 0;
                const latency = priorViewing + Math.max(1, Math.round((Date.now() - questionStartedAt.current) / 1000));
                setFirstAnswers((current) => ({ ...current, [question.id]: choiceIndex }));
                setFirstAnswerSeconds((current) => ({ ...current, [question.id]: latency }));
                track("answer_select", { questionId: question.id, payload: { answerIndex: choiceIndex, changed: false, firstSelection: true, latency } });
              }
              if (previousAnswer !== undefined && previousAnswer !== choiceIndex) {
                setAnswerChanges((current) => ({ ...current, [question.id]: (current[question.id] ?? 0) + 1 }));
              }
              setAnswers((current) => ({ ...current, [question.id]: choiceIndex }));
              if (firstAnswers[question.id] !== undefined) track("answer_select", { questionId: question.id, payload: { answerIndex: choiceIndex, changed: previousAnswer !== undefined && previousAnswer !== choiceIndex, firstSelection: false } });
            }}>
              <span>{String.fromCharCode(65 + choiceIndex)}</span>{choice}
            </button>
          ))}
        </div>
        <div className="confidence-row"><span>How confident are you?</span>{([1, 2, 3] as const).map((level) => <button key={level} className={confidence[question.id] === level ? "selected" : ""} onClick={() => { setConfidence((current) => ({ ...current, [question.id]: level })); track("confidence_select", { questionId: question.id, payload: { level } }); }}>{level === 1 ? "Low" : level === 2 ? "Medium" : "High"}</button>)}</div>
        <div className="question-actions">
          <button className="text-button" disabled={index === 0} onClick={() => recordAndMove(index - 1)}>← Previous</button>
          {index < QUESTIONS.length - 1 ? <button className="primary" onClick={() => recordAndMove(index + 1)}>Next question →</button> : <button className="primary" onClick={finish}>Finish diagnostic</button>}
        </div>
      </section>
    </main>
  );
}

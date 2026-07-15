"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Attempt, QUESTIONS, ScoredDiagnosticResult } from "@/lib/diagnostic";
import { appendEvent, createSession, parseSession, serializeSession, SESSION_STORAGE_KEY, StoredDiagnosticSession } from "@/lib/session-store";
import { CloudSyncStatus } from "@/components/cloud-sync-status";
import { QuestionReview } from "@/components/question-review";

type Stage = "welcome" | "test" | "results";

const TEST_SECONDS = 6 * 60;

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export function DiagnosticExperience() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(TEST_SECONDS);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [confidence, setConfidence] = useState<Record<string, 1 | 2 | 3>>({});
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [result, setResult] = useState<ScoredDiagnosticResult | null>(null);
  const [scoreError, setScoreError] = useState(false);
  const [storedSession, setStoredSession] = useState<StoredDiagnosticSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const questionStartedAt = useRef(Date.now());

  const question = QUESTIONS[index];
  useEffect(() => {
    const restored = parseSession(window.localStorage.getItem(SESSION_STORAGE_KEY));
    if (restored) {
      setStoredSession(restored);
      setIndex(Math.min(restored.currentIndex, QUESTIONS.length - 1));
      setRemaining(restored.remainingSeconds);
      setAnswers(restored.answers);
      setConfidence(restored.confidence);
      setAttempts(restored.attempts);
      setStage(restored.status === "completed" ? "results" : "test");
      questionStartedAt.current = Date.now();
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !storedSession) return;
    const nextSession: StoredDiagnosticSession = {
      ...storedSession,
      currentIndex: index,
      remainingSeconds: remaining,
      answers,
      confidence,
      attempts,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(SESSION_STORAGE_KEY, serializeSession(nextSession));
  }, [answers, attempts, confidence, hydrated, index, remaining, storedSession]);

  useEffect(() => {
    if (stage !== "results") return;
    const controller = new AbortController();
    setScoreError(false);
    fetch("/api/diagnostic/score", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ attempts }),
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Scoring failed");
        return response.json() as Promise<ScoredDiagnosticResult>;
      })
      .then(setResult)
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setScoreError(true);
      });
    return () => controller.abort();
  }, [attempts, stage]);

  useEffect(() => {
    if (stage !== "test") return;
    if (remaining <= 0) {
      const elapsedSeconds = Math.max(1, Math.round((Date.now() - questionStartedAt.current) / 1000));
      const timedAttempt: Attempt = {
        questionId: question.id,
        answerIndex: answers[question.id] ?? null,
        confidence: confidence[question.id] ?? null,
        elapsedSeconds,
      };
      setAttempts((current) => [...current.filter((attempt) => attempt.questionId !== question.id), timedAttempt]);
      setStoredSession((current) => current ? {
        ...appendEvent(appendEvent(current, "question_submit", { questionId: question.id, payload: { elapsedSeconds, timedOut: true } }), "session_complete", { payload: { timedOut: true } }),
        status: "completed",
      } : current);
      setStage("results");
      return;
    }
    const timer = window.setInterval(() => setRemaining((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [answers, confidence, question, remaining, stage]);

  function start() {
    const session = appendEvent(createSession(), "session_start");
    const withQuestionView = appendEvent(session, "question_view", { questionId: QUESTIONS[0].id });
    setStoredSession(withQuestionView);
    window.localStorage.setItem(SESSION_STORAGE_KEY, serializeSession(withQuestionView));
    setStage("test");
    questionStartedAt.current = Date.now();
  }

  function track(name: Parameters<typeof appendEvent>[1], details: Parameters<typeof appendEvent>[2]) {
    setStoredSession((current) => current ? appendEvent(current, name, details) : current);
  }

  function recordAndMove(nextIndex: number) {
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - questionStartedAt.current) / 1000));
    setAttempts((current) => {
      const withoutCurrent = current.filter((attempt) => attempt.questionId !== question.id);
      return [...withoutCurrent, {
        questionId: question.id,
        answerIndex: answers[question.id] ?? null,
        confidence: confidence[question.id] ?? null,
        elapsedSeconds,
      }];
    });
    setIndex(nextIndex);
    track("question_submit", { questionId: question.id, payload: { elapsedSeconds } });
    track("question_view", { questionId: QUESTIONS[nextIndex].id });
    questionStartedAt.current = Date.now();
  }

  function finish() {
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - questionStartedAt.current) / 1000));
    const finalAttempts = attempts.filter((attempt) => attempt.questionId !== question.id);
    finalAttempts.push({
      questionId: question.id,
      answerIndex: answers[question.id] ?? null,
      confidence: confidence[question.id] ?? null,
      elapsedSeconds,
    });
    setAttempts(finalAttempts);
    setStoredSession((current) => {
      if (!current) return current;
      const submitted = appendEvent(current, "question_submit", { questionId: question.id, payload: { elapsedSeconds } });
      return { ...appendEvent(submitted, "session_complete", { payload: { answered: Object.keys(answers).length } }), status: "completed" };
    });
    setStage("results");
  }

  function restart() {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.location.reload();
  }

  if (stage === "welcome") {
    return (
      <main className="shell welcome-shell">
        <nav className="nav"><div className="brand"><span>AC</span>Aptitude Coach</div><Link className="nav-link" href="/auth">Sign in</Link></nav>
        <section className="hero">
          <div className="eyebrow">Diagnostic session · 6 minutes</div>
          <h1>Find the points you’re <em>leaving on the clock.</em></h1>
          <p className="hero-copy">This short diagnostic measures more than right and wrong. It looks at your pace, confidence, and decision patterns to identify the most useful next drill.</p>
          <div className="hero-actions">
            <button className="primary" onClick={start}>Begin diagnostic <span>→</span></button>
            <span className="quiet">8 original practice questions</span>
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
        <nav className="nav"><div className="brand"><span>AC</span>Aptitude Coach</div><Link className="nav-link" href="/auth">Save progress</Link></nav>
        <section className="results-head">
          <div><div className="eyebrow">Your starting point</div><h1>{result.correct} of {result.total} correct</h1><p>Your highest-impact next move is to <strong>{result.priority.toLowerCase()}</strong>.</p><CloudSyncStatus session={storedSession} /></div>
          <div className="score-ring"><strong>{Math.round(result.accuracy * 100)}</strong><span>% accuracy</span></div>
        </section>
        <section className="metric-grid">
          <article><span>Average pace</span><strong>{result.averageSeconds}s</strong><small>per question</small></article>
          <article><span>On-target pace</span><strong>{Math.round(result.paceScore * 100)}%</strong><small>within target time</small></article>
          <article><span>Confidence fit</span><strong>{Math.round(result.confidenceScore * 100)}%</strong><small>calibrated decisions</small></article>
        </section>
        <section className="report-grid">
          <article className="category-card"><div className="section-label">Category performance</div>{result.categoryResults.filter((item) => item.total).map((item) => <div className="category-row" key={item.category}><span>{item.category}</span><div className="bar"><i style={{ width: `${(item.correct / item.total) * 100}%` }} /></div><b>{item.correct}/{item.total}</b></div>)}</article>
          <article className="coach-card"><div className="section-label">Coach recommendation</div><h2>{result.priority}</h2><p>Run a focused set at a fixed pace, then review only the questions where your answer or confidence changed. The goal is a consistent decision rhythm—not rushing.</p><button className="secondary" onClick={restart}>Retake preview</button></article>
        </section>
        <QuestionReview reviews={result.reviews} />
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
      <section className="question-wrap">
        <div className="question-meta"><span>{question.category}</span><span>Target pace · {question.targetSeconds}s</span></div>
        <h1>{question.prompt}</h1>
        <div className="choices">
          {question.choices.map((choice, choiceIndex) => (
            <button key={choice} className={answers[question.id] === choiceIndex ? "selected" : ""} onClick={() => { setAnswers((current) => ({ ...current, [question.id]: choiceIndex })); track("answer_select", { questionId: question.id, payload: { answerIndex: choiceIndex } }); }}>
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

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PerformanceDiagnosis } from "@/components/performance-diagnosis";
import { QuestionReview } from "@/components/question-review";
import type { Attempt, ScoredDiagnosticResult } from "@/lib/diagnostic";
import { PRACTICE_TEST_QUESTIONS, PRACTICE_TEST_SECONDS } from "@/lib/practice-test";

type Stage = "intro" | "test" | "scoring" | "results";
const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

export function PracticeTestExperience() {
  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(PRACTICE_TEST_SECONDS);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [confidence, setConfidence] = useState<Record<string, 1 | 2 | 3>>({});
  const [changes, setChanges] = useState<Record<string, number>>({});
  const [firstAnswers, setFirstAnswers] = useState<Record<string, number>>({});
  const [firstTimes, setFirstTimes] = useState<Record<string, number>>({});
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [result, setResult] = useState<ScoredDiagnosticResult | null>(null);
  const startedAt = useRef(Date.now());
  const deadlineAt = useRef(Date.now() + PRACTICE_TEST_SECONDS * 1000);
  const submitTestRef = useRef<() => void>(() => {});
  const question = PRACTICE_TEST_QUESTIONS[index];

  useEffect(() => {
    if (stage !== "test") return;
    const timer = window.setInterval(() => setRemaining(Math.max(0, Math.ceil((deadlineAt.current - Date.now()) / 1000))), 250);
    return () => window.clearInterval(timer);
  }, [stage]);

  useEffect(() => { if (stage === "test" && remaining === 0) submitTestRef.current(); }, [remaining, stage]);

  function currentAttempt(): Attempt {
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    return { questionId: question.id, answerIndex: answers[question.id] ?? null, elapsedSeconds, confidence: confidence[question.id] ?? null, answerChanges: changes[question.id] ?? 0, firstAnswerIndex: firstAnswers[question.id] ?? null, firstAnswerSeconds: firstTimes[question.id] ?? null, viewCount: 1 };
  }

  function next() {
    setAttempts((current) => [...current.filter((attempt) => attempt.questionId !== question.id), currentAttempt()]);
    setIndex((value) => value + 1);
    startedAt.current = Date.now();
  }

  function selectAnswer(choiceIndex: number) {
    const previous = answers[question.id];
    if (firstAnswers[question.id] === undefined) {
      setFirstAnswers((current) => ({ ...current, [question.id]: choiceIndex }));
      setFirstTimes((current) => ({ ...current, [question.id]: Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)) }));
    }
    if (previous !== undefined && previous !== choiceIndex) setChanges((current) => ({ ...current, [question.id]: (current[question.id] ?? 0) + 1 }));
    setAnswers((current) => ({ ...current, [question.id]: choiceIndex }));
  }

  function submitTest() {
    if (stage !== "test") return;
    const captured = [...attempts.filter((attempt) => attempt.questionId !== question.id), currentAttempt()];
    const byId = new Map(captured.map((attempt) => [attempt.questionId, attempt]));
    const completed = PRACTICE_TEST_QUESTIONS.map((item) => byId.get(item.id) ?? { questionId: item.id, answerIndex: null, elapsedSeconds: 0, confidence: null, answerChanges: 0 });
    setStage("scoring");
    fetch("/api/practice-test/score", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ attempts: completed }) })
      .then((response) => { if (!response.ok) throw new Error("Scoring failed"); return response.json() as Promise<ScoredDiagnosticResult>; })
      .then((value) => { setResult(value); setStage("results"); })
      .catch(() => setStage("intro"));
  }
  submitTestRef.current = submitTest;

  if (stage === "intro") return <main className="shell welcome-shell"><Nav /><section className="hero practice-test-hero"><div className="eyebrow">Practice test · Form B</div><h1>A fresh mixed test. <em>Six minutes.</em></h1><p className="hero-copy">Twenty original questions using a representative mix of verbal, numerical, logic, and spatial reasoning. Answers remain hidden until completion.</p><div className="hero-actions"><button className="primary" onClick={() => { setStage("test"); deadlineAt.current = Date.now() + PRACTICE_TEST_SECONDS * 1000; startedAt.current = Date.now(); }}>Begin 20-question test →</button><Link className="secondary link-button" href="/?new=1">Take full 50-question diagnostic</Link></div></section></main>;
  if (stage === "scoring") return <main className="shell results-shell"><Nav /><section className="analysis-state"><div className="eyebrow">Secure scoring</div><h1>Building your review…</h1></section></main>;
  if (stage === "results" && result) return <main className="shell results-shell"><Nav /><section className="results-head"><div><div className="eyebrow">Practice test complete</div><h1>{result.correct} of {result.total} correct</h1><p>Use this form to verify whether prescribed training transfers to unseen questions.</p></div><div className="score-ring"><strong>{Math.round(result.accuracy * 100)}</strong><span>% accuracy</span></div></section><section className="metric-grid"><article><span>Average pace</span><strong>{result.averageSeconds}s</strong><small>per question</small></article><article><span>On-target pace</span><strong>{Math.round(result.paceScore * 100)}%</strong><small>within 18 seconds</small></article><article><span>Confidence fit</span><strong>{Math.round(result.confidenceScore * 100)}%</strong><small>calibrated decisions</small></article></section><PerformanceDiagnosis diagnosis={result.diagnosis} /><QuestionReview reviews={result.reviews} /></main>;

  return <main className="test-shell"><header className="test-header"><div className="brand compact"><span>AC</span></div><div className="progress-copy">Practice test · <strong>{index + 1}</strong> of {PRACTICE_TEST_QUESTIONS.length}</div><div className={`timer ${remaining < 45 ? "urgent" : ""}`}><span>Time remaining</span><strong>{formatTime(remaining)}</strong></div></header><div className="progress"><i style={{ width: `${((index + 1) / PRACTICE_TEST_QUESTIONS.length) * 100}%` }} /></div><section className="question-wrap"><div className="question-meta"><span>{question.category}</span><span>Target pace · 18s</span></div><h1>{question.prompt}</h1><div className="choices">{question.choices.map((choice, choiceIndex) => <button key={choice} className={answers[question.id] === choiceIndex ? "selected" : ""} onClick={() => selectAnswer(choiceIndex)}><span>{String.fromCharCode(65 + choiceIndex)}</span>{choice}</button>)}</div><div className="confidence-row"><span>How confident are you?</span>{([1, 2, 3] as const).map((level) => <button key={level} className={confidence[question.id] === level ? "selected" : ""} onClick={() => setConfidence((current) => ({ ...current, [question.id]: level }))}>{level === 1 ? "Low" : level === 2 ? "Medium" : "High"}</button>)}</div><div className="question-actions"><span />{index < PRACTICE_TEST_QUESTIONS.length - 1 ? <button className="primary" onClick={next}>Next question →</button> : <button className="primary" onClick={submitTest}>Finish test</button>}</div></section></main>;
}

function Nav() { return <nav className="nav"><Link className="brand brand-link" href="/"><span>AC</span>Aptitude Coach</Link><div className="nav-actions"><Link className="nav-text-link" href="/practice">Drills</Link><Link className="nav-link" href="/progress">Progress</Link></div></nav>; }

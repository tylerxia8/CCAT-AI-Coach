"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PerformanceDiagnosis } from "@/components/performance-diagnosis";
import { QuestionReview } from "@/components/question-review";
import { QuestionStimulus } from "@/components/question-stimulus";
import type { Attempt, ScoredDiagnosticResult } from "@/lib/diagnostic";
import {
  PRACTICE_TEST_QUESTIONS,
  PRACTICE_TEST_SECONDS,
} from "@/lib/practice-test";

type Stage = "intro" | "test" | "scoring" | "results";
type TestMode = "timed" | "guided";
const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

export function PracticeTestExperience() {
  const [stage, setStage] = useState<Stage>("intro");
  const [mode, setMode] = useState<TestMode>("timed");
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(PRACTICE_TEST_SECONDS);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [confidence, setConfidence] = useState<Record<string, 1 | 2 | 3>>({});
  const [changes, setChanges] = useState<Record<string, number>>({});
  const [firstAnswers, setFirstAnswers] = useState<Record<string, number>>({});
  const [firstTimes, setFirstTimes] = useState<Record<string, number>>({});
  const [eliminated, setEliminated] = useState<Record<string, number[]>>({});
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [result, setResult] = useState<ScoredDiagnosticResult | null>(null);
  const startedAt = useRef(Date.now());
  const deadlineAt = useRef(Date.now() + PRACTICE_TEST_SECONDS * 1000);
  const submitTestRef = useRef<() => void>(() => {});
  const question = PRACTICE_TEST_QUESTIONS[index];

  useEffect(() => {
    if (stage !== "test" || mode !== "timed") return;
    const timer = window.setInterval(
      () =>
        setRemaining(
          Math.max(0, Math.ceil((deadlineAt.current - Date.now()) / 1000)),
        ),
      250,
    );
    return () => window.clearInterval(timer);
  }, [mode, stage]);

  useEffect(() => {
    if (stage === "test" && mode === "timed" && remaining === 0)
      submitTestRef.current();
  }, [mode, remaining, stage]);

  function currentAttempt(): Attempt {
    const elapsedSeconds = Math.max(
      1,
      Math.round((Date.now() - startedAt.current) / 1000),
    );
    return {
      questionId: question.id,
      answerIndex: answers[question.id] ?? null,
      elapsedSeconds,
      confidence: confidence[question.id] ?? null,
      answerChanges: changes[question.id] ?? 0,
      firstAnswerIndex: firstAnswers[question.id] ?? null,
      firstAnswerSeconds: firstTimes[question.id] ?? null,
      viewCount: 1,
    };
  }

  function next() {
    setAttempts((current) => [
      ...current.filter((attempt) => attempt.questionId !== question.id),
      currentAttempt(),
    ]);
    setIndex((value) => value + 1);
    startedAt.current = Date.now();
  }

  function selectAnswer(choiceIndex: number) {
    if (eliminated[question.id]?.includes(choiceIndex)) return;
    const previous = answers[question.id];
    if (firstAnswers[question.id] === undefined) {
      setFirstAnswers((current) => ({
        ...current,
        [question.id]: choiceIndex,
      }));
      setFirstTimes((current) => ({
        ...current,
        [question.id]: Math.max(
          1,
          Math.round((Date.now() - startedAt.current) / 1000),
        ),
      }));
    }
    if (previous !== undefined && previous !== choiceIndex)
      setChanges((current) => ({
        ...current,
        [question.id]: (current[question.id] ?? 0) + 1,
      }));
    setAnswers((current) => ({ ...current, [question.id]: choiceIndex }));
  }

  function toggleElimination(choiceIndex: number) {
    if (!eliminated[question.id]?.includes(choiceIndex) && answers[question.id] === choiceIndex) {
      setAnswers((current) => { const next = { ...current }; delete next[question.id]; return next; });
    }
    setEliminated((current) => {
      const values = current[question.id] ?? [];
      return { ...current, [question.id]: values.includes(choiceIndex) ? values.filter((value) => value !== choiceIndex) : [...values, choiceIndex] };
    });
  }

  function submitTest() {
    if (stage !== "test") return;
    const captured = [
      ...attempts.filter((attempt) => attempt.questionId !== question.id),
      currentAttempt(),
    ];
    const byId = new Map(
      captured.map((attempt) => [attempt.questionId, attempt]),
    );
    const completed = PRACTICE_TEST_QUESTIONS.map(
      (item) =>
        byId.get(item.id) ?? {
          questionId: item.id,
          answerIndex: null,
          elapsedSeconds: 0,
          confidence: null,
          answerChanges: 0,
        },
    );
    setStage("scoring");
    fetch("/api/practice-test/score", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ attempts: completed }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Scoring failed");
        return response.json() as Promise<ScoredDiagnosticResult>;
      })
      .then((value) => {
        setResult(value);
        setStage("results");
      })
      .catch(() => setStage("intro"));
  }
  submitTestRef.current = submitTest;

  if (stage === "intro")
    return (
      <main className="shell welcome-shell">
        <Nav />
        <section className="hero practice-test-hero">
          <div className="eyebrow">Practice test · Form B</div>
          <h1>
            A fresh mixed test. <em>Six minutes.</em>
          </h1>
          <p className="hero-copy">
            Choose realistic time pressure or a self-paced walkthrough with a
            strategy cue for each question family. Answers remain hidden until
            completion.
          </p>
          <div className="hero-actions">
            <button
              className="primary"
              onClick={() => {
                setMode("timed");
                setStage("test");
                deadlineAt.current = Date.now() + PRACTICE_TEST_SECONDS * 1000;
                startedAt.current = Date.now();
              }}
            >
              Timed mode · 6 minutes →
            </button>
            <button className="secondary" onClick={() => { setMode("guided"); setStage("test"); startedAt.current = Date.now(); }}>
              Guided mode · self-paced
            </button>
            <Link className="secondary link-button" href="/?new=1">
              Take full 50-question diagnostic
            </Link>
          </div>
        </section>
      </main>
    );
  if (stage === "scoring")
    return (
      <main className="shell results-shell">
        <Nav />
        <section className="analysis-state">
          <div className="eyebrow">Secure scoring</div>
          <h1>Building your review…</h1>
        </section>
      </main>
    );
  if (stage === "results" && result)
    return (
      <main className="shell results-shell">
        <Nav />
        <section className="results-head">
          <div>
            <div className="eyebrow">Practice test complete</div>
            <h1>
              {result.correct} of {result.total} correct
            </h1>
            <p>
              Use this form to verify whether prescribed training transfers to
              unseen questions.
            </p>
          </div>
          <div className="score-ring">
            <strong>{Math.round(result.accuracy * 100)}</strong>
            <span>% accuracy</span>
          </div>
        </section>
        {mode === "timed" ? <section className="metric-grid">
          <article>
            <span>Average pace</span>
            <strong>{result.averageSeconds}s</strong>
            <small>per question</small>
          </article>
          <article>
            <span>On-target pace</span>
            <strong>{Math.round(result.paceScore * 100)}%</strong>
            <small>within 18 seconds</small>
          </article>
          <article>
            <span>Confidence fit</span>
            <strong>{Math.round(result.confidenceScore * 100)}%</strong>
            <small>calibrated decisions</small>
          </article>
        </section> : <p className="guided-result-note">Guided mode emphasizes method and review, so its timing is not used for behavioral diagnosis. Use timed mode when you want a pace or rushing assessment.</p>}
        {mode === "timed" && <PerformanceDiagnosis diagnosis={result.diagnosis} />}
        <QuestionReview reviews={result.reviews} />
      </main>
    );

  return (
    <main className="test-shell">
      <header className="test-header">
        <div className="brand compact">
          <span>AC</span>
        </div>
        <div className="progress-copy">
          Practice test · <strong>{index + 1}</strong> of{" "}
          {PRACTICE_TEST_QUESTIONS.length}
        </div>
        {mode === "timed" ? <div className={`timer ${remaining < 45 ? "urgent" : ""}`}><span>Time remaining</span><strong>{formatTime(remaining)}</strong></div> : <div className="timer guided"><span>Mode</span><strong>Self-paced</strong></div>}
      </header>
      <div className="progress">
        <i
          style={{
            width: `${((index + 1) / PRACTICE_TEST_QUESTIONS.length) * 100}%`,
          }}
        />
      </div>
      <section className="question-wrap">
        <div className="question-meta">
          <span>{question.category}</span>
          <span>Target pace · 18s</span>
        </div>
        {mode === "timed" && <div className="phase-cue"><strong>{phaseGuidance(index).title}</strong><span>{phaseGuidance(index).instruction}</span></div>}
        {mode === "guided" && <div className="strategy-cue"><strong>Strategy cue</strong><span>{strategyFor(question.itemFamily, question.prompt)}</span></div>}
        {question.stimulus && <QuestionStimulus stimulus={question.stimulus} />}
        <h1>{question.prompt}</h1>
        {mode === "guided" && <div className="elimination-toolbar"><span>Eliminate choices</span>{question.choices.map((_, choiceIndex) => <button key={choiceIndex} className={eliminated[question.id]?.includes(choiceIndex) ? "active" : ""} onClick={() => toggleElimination(choiceIndex)}>{String.fromCharCode(65 + choiceIndex)}</button>)}</div>}
        <div className="choices">
          {question.choices.map((choice, choiceIndex) => (
            <button
              key={choice}
              disabled={eliminated[question.id]?.includes(choiceIndex)}
              className={`${answers[question.id] === choiceIndex ? "selected" : ""} ${eliminated[question.id]?.includes(choiceIndex) ? "eliminated" : ""}`}
              onClick={() => selectAnswer(choiceIndex)}
            >
              <span>{String.fromCharCode(65 + choiceIndex)}</span>
              {choice}
            </button>
          ))}
        </div>
        <div className="confidence-row">
          <span>How confident are you?</span>
          {([1, 2, 3] as const).map((level) => (
            <button
              key={level}
              className={confidence[question.id] === level ? "selected" : ""}
              onClick={() =>
                setConfidence((current) => ({
                  ...current,
                  [question.id]: level,
                }))
              }
            >
              {level === 1 ? "Low" : level === 2 ? "Medium" : "High"}
            </button>
          ))}
        </div>
        <div className="question-actions">
          <span />
          {index < PRACTICE_TEST_QUESTIONS.length - 1 ? (
            <button className="primary" onClick={next}>
              Next question →
            </button>
          ) : (
            <button className="primary" onClick={submitTest}>
              Finish test
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

function Nav() {
  return (
    <nav className="nav">
      <Link className="brand brand-link" href="/">
        <span>AC</span>Aptitude Coach
      </Link>
      <div className="nav-actions">
        <Link className="nav-text-link" href="/practice">
          Drills
        </Link>
        <Link className="nav-link" href="/progress">
          Progress
        </Link>
      </div>
    </nav>
  );
}

function strategyFor(family?: string, prompt = "") {
  if (family === "percentages") return "Estimate first using 10%, 25%, or 50% anchors. Calculate exactly only if more than one choice survives.";
  if (prompt.includes("greatest") || prompt.includes("smallest")) return "Align place values and compare digits from left to right until one differs.";
  if (family === "verbal analogies") return "State the relationship as a short sentence, then test that same sentence against each option.";
  if (family === "sentence completion") return "Use contrast and cause words to predict the missing meaning before reading the choices.";
  if (family === "attention to detail") return "Compare in fixed chunks from left to right; do not judge the whole line by its overall appearance.";
  if (family === "number sequences" || family === "letter series") return "Check first differences before testing more complicated alternating rules.";
  if (family?.includes("figure") || family === "mental rotation" || family === "visual sequences") return "Hypothesize from 2–3 frames, verify the rule across every frame, then eliminate options that violate one feature.";
  if (family === "syllogisms" || family === "ordering logic") return "Write only what must follow; do not add relationships the statements never establish.";
  return "Identify the governing operation, estimate the result, and then calculate only what the prompt requests.";
}

function phaseGuidance(index: number) {
  if (index < 5) return { title: "Phase 1 · bank quick points", instruction: "Aim for 10–15 seconds, but take one verification beat before submitting." };
  if (index < 15) return { title: "Phase 2 · hold your rhythm", instruction: "Stay near 18 seconds. If the method is not emerging, make the best choice and move." };
  return { title: "Phase 3 · invest selectively", instruction: "Expect harder items. Protect completed points instead of letting one question consume the finish." };
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PRACTICE_QUESTIONS, type PracticeFeedback } from "@/lib/practice";

type PracticeRecord = PracticeFeedback & { elapsedSeconds: number; targetSeconds: number };

export function PracticeExperience() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null);
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [focus, setFocus] = useState("focused practice");
  const startedAt = useRef(Date.now());
  const question = PRACTICE_QUESTIONS[index];

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("focus");
    if (requested && /^[a-z]+$/.test(requested)) setFocus(`${requested} practice`);
  }, []);

  async function checkAnswer() {
    if (selected === null || submitting) return;
    setSubmitting(true);
    setError(false);
    try {
      const response = await fetch("/api/practice/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questionId: question.id, answerIndex: selected }),
      });
      if (!response.ok) throw new Error("Check failed");
      const result = await response.json() as PracticeFeedback;
      const elapsedSeconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
      setFeedback(result);
      setRecords((current) => [...current, { ...result, elapsedSeconds, targetSeconds: question.targetSeconds }]);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    setIndex((current) => current + 1);
    setSelected(null);
    setFeedback(null);
    startedAt.current = Date.now();
  }

  if (index >= PRACTICE_QUESTIONS.length) {
    const correct = records.filter((record) => record.isCorrect).length;
    const onPace = records.filter((record) => record.elapsedSeconds <= record.targetSeconds).length;
    return (
      <main className="practice-shell">
        <PracticeNav />
        <section className="practice-complete"><div className="eyebrow">Drill complete</div><h1>{correct} of {records.length} correct</h1><p>{onPace} decisions landed within target pace. Use the review below to decide whether to repeat the drill or return to a full diagnostic.</p><div className="practice-complete-actions"><button className="primary" onClick={() => window.location.reload()}>Repeat drill</button><Link className="secondary link-button" href="/">Take diagnostic</Link></div></section>
        <section className="practice-recap">{records.map((record, recordIndex) => <article key={record.questionId}><span>{String(recordIndex + 1).padStart(2, "0")}</span><strong>{record.isCorrect ? "Correct" : "Review"}</strong><small>{record.elapsedSeconds}s · {record.elapsedSeconds <= record.targetSeconds ? "on pace" : "slow"}</small></article>)}</section>
      </main>
    );
  }

  return (
    <main className="practice-shell">
      <PracticeNav />
      <div className="practice-progress"><i style={{ width: `${((index + (feedback ? 1 : 0)) / PRACTICE_QUESTIONS.length) * 100}%` }} /></div>
      <section className="practice-card">
        <div className="question-meta"><span>{focus} · {question.category}</span><span>Target · {question.targetSeconds}s</span></div>
        <h1>{question.prompt}</h1>
        <div className="choices">
          {question.choices.map((choice, choiceIndex) => <button key={choice} disabled={Boolean(feedback)} className={selected === choiceIndex ? "selected" : ""} onClick={() => setSelected(choiceIndex)}><span>{String.fromCharCode(65 + choiceIndex)}</span>{choice}</button>)}
        </div>
        {feedback && <div className={`feedback-card ${feedback.isCorrect ? "correct" : "incorrect"}`}><div className="feedback-label">{feedback.isCorrect ? "Correct" : `Correct answer · ${feedback.correctAnswer}`}</div><p>{feedback.explanation}</p></div>}
        {error && <p className="practice-error">We couldn’t check that answer. Your selection is still here—please try again.</p>}
        <div className="practice-actions"><span>Question {index + 1} of {PRACTICE_QUESTIONS.length}</span>{feedback ? <button className="primary" onClick={next}>{index === PRACTICE_QUESTIONS.length - 1 ? "See drill results" : "Next question →"}</button> : <button className="primary" disabled={selected === null || submitting} onClick={checkAnswer}>{submitting ? "Checking…" : "Check answer"}</button>}</div>
      </section>
    </main>
  );
}

function PracticeNav() {
  return <nav className="nav"><Link className="brand brand-link" href="/"><span>AC</span>Aptitude Coach</Link><div className="nav-actions"><Link className="nav-text-link" href="/progress">Progress</Link><span className="nav-note">Practice mode</span></div></nav>;
}

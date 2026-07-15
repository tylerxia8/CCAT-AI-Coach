"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PRACTICE_QUESTIONS, type PracticeFeedback } from "@/lib/practice";
import { addPracticeHistory, completePracticeSession, createPracticeSession, parsePracticeHistory, parsePracticeSession, PRACTICE_HISTORY_KEY, PRACTICE_SESSION_KEY, type PracticeRecord } from "@/lib/practice-store";

export function PracticeExperience() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null);
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [focus, setFocus] = useState("focused practice");
  const [sessionId, setSessionId] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [selectionChanges, setSelectionChanges] = useState(0);
  const startedAt = useRef(Date.now());
  const question = PRACTICE_QUESTIONS[index];
  const training = trainingConfig(focus, question?.targetSeconds ?? 18);

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    if (parameters.get("new") === "1") window.localStorage.removeItem(PRACTICE_SESSION_KEY);
    const restored = parsePracticeSession(window.localStorage.getItem(PRACTICE_SESSION_KEY));
    if (restored) {
      setSessionId(restored.id);
      setFocus(restored.focus);
      setIndex(restored.currentIndex);
      setSelected(restored.selected);
      setFeedback(restored.feedback);
      setRecords(restored.records);
      startedAt.current = restored.questionStartedAt;
      setHydrated(true);
      return;
    }
    const requested = parameters.get("focus");
    const selectedFocus = requested && /^[a-z]+$/.test(requested) ? `${requested} practice` : "focused practice";
    const session = createPracticeSession(selectedFocus);
    setSessionId(session.id);
    setFocus(session.focus);
    startedAt.current = session.questionStartedAt;
    window.localStorage.setItem(PRACTICE_SESSION_KEY, JSON.stringify(session));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !sessionId || index >= PRACTICE_QUESTIONS.length) return;
    window.localStorage.setItem(PRACTICE_SESSION_KEY, JSON.stringify({
      version: 1,
      id: sessionId,
      status: "active",
      focus,
      currentIndex: index,
      selected,
      feedback,
      records,
      questionStartedAt: startedAt.current,
      updatedAt: new Date().toISOString(),
    }));
  }, [feedback, focus, hydrated, index, records, selected, sessionId]);

  useEffect(() => {
    if (!hydrated || !sessionId || index < PRACTICE_QUESTIONS.length) return;
    const session = createPracticeSession(focus);
    const completed = completePracticeSession({ ...session, id: sessionId, currentIndex: index, records, status: "active", questionStartedAt: startedAt.current });
    window.localStorage.setItem(PRACTICE_SESSION_KEY, JSON.stringify(completed.session));
    const history = parsePracticeHistory(window.localStorage.getItem(PRACTICE_HISTORY_KEY));
    window.localStorage.setItem(PRACTICE_HISTORY_KEY, JSON.stringify(addPracticeHistory(history, completed.entry)));
  }, [focus, hydrated, index, records, sessionId]);

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
      setRecords((current) => [...current, { ...result, elapsedSeconds, targetSeconds: training.targetSeconds }]);
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
    setSelectionChanges(0);
    startedAt.current = Date.now();
  }

  function repeat() {
    window.localStorage.removeItem(PRACTICE_SESSION_KEY);
    window.location.reload();
  }

  if (index >= PRACTICE_QUESTIONS.length) {
    const correct = records.filter((record) => record.isCorrect).length;
    const onPace = records.filter((record) => record.elapsedSeconds <= record.targetSeconds).length;
    return (
      <main className="practice-shell">
        <PracticeNav />
        <section className="practice-complete"><div className="eyebrow">Drill complete</div><h1>{correct} of {records.length} correct</h1><p>{onPace} decisions landed within target pace. Use the review below to decide whether to repeat the drill or return to a full diagnostic.</p><div className="practice-complete-actions"><button className="primary" onClick={repeat}>Repeat drill</button><Link className="secondary link-button" href="/">Take diagnostic</Link></div></section>
        <section className="practice-recap">{records.map((record, recordIndex) => <article key={record.questionId}><span>{String(recordIndex + 1).padStart(2, "0")}</span><strong>{record.isCorrect ? "Correct" : "Review"}</strong><small>{record.elapsedSeconds}s · {record.elapsedSeconds <= record.targetSeconds ? "on pace" : "slow"}</small></article>)}</section>
      </main>
    );
  }

  return (
    <main className="practice-shell">
      <PracticeNav />
      <div className="practice-progress"><i style={{ width: `${((index + (feedback ? 1 : 0)) / PRACTICE_QUESTIONS.length) * 100}%` }} /></div>
      <section className="practice-card">
        <div className="training-directive"><strong>{training.title}</strong><span>{training.instruction}{focus.startsWith("second_guessing") && selectionChanges > 0 ? ` · ${selectionChanges} answer change${selectionChanges === 1 ? "" : "s"} so far` : ""}</span></div>
        <div className="question-meta"><span>{focus} · {question.category}</span><span>Target · {question.targetSeconds}s</span></div>
        <h1>{question.prompt}</h1>
        <div className="choices">
          {question.choices.map((choice, choiceIndex) => <button key={choice} disabled={Boolean(feedback)} className={selected === choiceIndex ? "selected" : ""} onClick={() => { if (selected !== null && selected !== choiceIndex) setSelectionChanges((value) => value + 1); setSelected(choiceIndex); }}><span>{String.fromCharCode(65 + choiceIndex)}</span>{choice}</button>)}
        </div>
        {feedback && <div className={`feedback-card ${feedback.isCorrect ? "correct" : "incorrect"}`}><div className="feedback-label">{feedback.isCorrect ? "Correct" : `Correct answer · ${feedback.correctAnswer}`}</div><p>{feedback.explanation}</p></div>}
        {error && <p className="practice-error">We couldn’t check that answer. Your selection is still here—please try again.</p>}
        <div className="practice-actions"><span>Question {index + 1} of {PRACTICE_QUESTIONS.length}</span>{feedback ? <button className="primary" onClick={next}>{index === PRACTICE_QUESTIONS.length - 1 ? "See drill results" : "Next question →"}</button> : <button className="primary" disabled={selected === null || submitting} onClick={checkAnswer}>{submitting ? "Checking…" : "Check answer"}</button>}</div>
      </section>
    </main>
  );
}

function trainingConfig(focus: string, baseTarget: number) {
  if (focus.startsWith("knowledge")) return { title: "Accuracy first · no time pressure", instruction: "Name the pattern before solving. Study the feedback before moving on.", targetSeconds: 120 };
  if (focus.startsWith("speed")) { const targetSeconds = Math.max(12, Math.round(baseTarget * 0.7)); return { title: `Fluency target · ${targetSeconds} seconds`, instruction: "Use the shortest reliable method and commit when the pattern is clear.", targetSeconds }; }
  if (focus.startsWith("rhythm")) return { title: "Cadence target · 18 seconds per decision", instruction: "Treat every three questions as one block. Do not let one hard item delay the next.", targetSeconds: 18 };
  if (focus.startsWith("second_guessing")) return { title: "Commitment target · no unsupported changes", instruction: "Change your first choice only when you can name a specific contradiction.", targetSeconds: 18 };
  return { title: "Mixed transfer practice", instruction: "Recognize the question family, choose a method, and execute at pace.", targetSeconds: baseTarget };
}

function PracticeNav() {
  return <nav className="nav"><Link className="brand brand-link" href="/"><span>AC</span>Aptitude Coach</Link><div className="nav-actions"><Link className="nav-text-link" href="/progress">Progress</Link><span className="nav-note">Practice mode</span></div></nav>;
}

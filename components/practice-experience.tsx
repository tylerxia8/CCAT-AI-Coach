"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PRACTICE_QUESTIONS, type PracticeFeedback } from "@/lib/practice";
import { addPracticeHistory, completePracticeSession, createPracticeSession, parsePracticeHistory, parsePracticeSession, PRACTICE_HISTORY_KEY, PRACTICE_SESSION_KEY, type PracticeRecord } from "@/lib/practice-store";
import { drillProgression, meetsStageGate, targetForStage, type DrillProgression } from "@/lib/adaptive-practice";
import { estimateAbility, selectAdaptiveSequence, type AbilityEstimate } from "@/lib/adaptive-question-selection";
import { HISTORY_STORAGE_KEY, parseHistory } from "@/lib/history-store";
import { questionExposureCounts, recommendPracticeSkill } from "@/lib/practice-curriculum";
import { QuestionStimulus } from "@/components/question-stimulus";
import { clockState, timeConstraintFor } from "@/lib/time-constraint-drills";
import { recommendedLearnerTarget } from "@/lib/learner-profile";
import { nextRepairSkill, parseRepairQueue, recordRepairEvidence, REPAIR_QUEUE_KEY } from "@/lib/repair-queue";
import { SkillLesson } from "@/components/skill-lesson";
import { ITEM_CALIBRATION_KEY, parseItemCalibration, recordItemOutcome } from "@/lib/item-calibration";
import { parseTransferQueue, TRANSFER_QUEUE_KEY } from "@/lib/transfer-store";
import { topicQuestionPool } from "@/lib/practice-topics";

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
  const [practiceConfidence, setPracticeConfidence] = useState<1 | 2 | 3 | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [deadlineTriggered, setDeadlineTriggered] = useState(false);
  const [progression, setProgression] = useState<DrillProgression>(() => drillProgression("focused practice", { version: 1, entries: [] }));
  const [ability, setAbility] = useState<AbilityEstimate>(() => estimateAbility("focused practice", 1, { version: 1, entries: [] }));
  const [questionIds, setQuestionIds] = useState(() => PRACTICE_QUESTIONS.map((item) => item.id));
  const startedAt = useRef(Date.now());
  const adaptiveQuestions = questionIds.map((id) => PRACTICE_QUESTIONS.find((item) => item.id === id)).filter((item): item is (typeof PRACTICE_QUESTIONS)[number] => Boolean(item));
  const question = adaptiveQuestions[index];
  const training = trainingConfig(focus, question?.targetSeconds ?? 18, progression);
  const timeConstraint = timeConstraintFor(focus, progression.stage);

  useEffect(() => {
    setSecondsRemaining(training.targetSeconds);
    setDeadlineTriggered(false);
    if (!timeConstraint.enabled || feedback || index >= adaptiveQuestions.length) return;
    const deadline = startedAt.current + training.targetSeconds * 1000;
    const updateClock = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining === 0 && timeConstraint.hardStop) setDeadlineTriggered(true);
    };
    updateClock();
    const timer = window.setInterval(updateClock, 250);
    return () => window.clearInterval(timer);
  }, [adaptiveQuestions.length, feedback, index, question?.id, timeConstraint.enabled, timeConstraint.hardStop, training.targetSeconds]);

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    if (parameters.get("new") === "1") window.localStorage.removeItem(PRACTICE_SESSION_KEY);
    const restored = parsePracticeSession(window.localStorage.getItem(PRACTICE_SESSION_KEY));
    const practiceHistory = parsePracticeHistory(window.localStorage.getItem(PRACTICE_HISTORY_KEY));
    const diagnosticHistory = parseHistory(window.localStorage.getItem(HISTORY_STORAGE_KEY));
    if (restored) {
      const restoredProgression = drillProgression(restored.focus, practiceHistory);
      const restoredAbility = estimateAbility(restored.focus, restoredProgression.stage, practiceHistory);
      const stableIds = restored.questionIds?.filter((id) => PRACTICE_QUESTIONS.some((item) => item.id === id));
      setSessionId(restored.id);
      setFocus(restored.focus);
      setIndex(restored.currentIndex);
      setSelected(restored.selected);
      setFeedback(restored.feedback);
      setRecords(restored.records);
      setProgression(restoredProgression);
      setAbility(restored.targetDifficulty ? { ...restoredAbility, targetDifficulty: restored.targetDifficulty } : restoredAbility);
      if (stableIds?.length) setQuestionIds(stableIds);
      startedAt.current = restored.questionStartedAt;
      setHydrated(true);
      return;
    }
    const requested = parameters.get("focus");
    const intervention = parameters.get("intervention");
    const requestedSkill = parameters.get("skill");
    const topicMode = parameters.get("mode") === "topic";
    const repairSkill = nextRepairSkill(parseRepairQueue(window.localStorage.getItem(REPAIR_QUEUE_KEY)));
    const learnerTarget = requestedSkill ? null : recommendedLearnerTarget(diagnosticHistory, practiceHistory);
    const inferredSkill = recommendPracticeSkill(diagnosticHistory, practiceHistory);
    const selectedSkill = requestedSkill ?? repairSkill ?? inferredSkill;
    const validSkill = selectedSkill && /^[a-z0-9 &-]{2,40}$/i.test(selectedSkill) ? selectedSkill : null;
    const skillLabel = validSkill ? ` · ${validSkill}` : "";
    const inferredCause = learnerTarget?.cause ?? diagnosticHistory.entries.at(-1)?.primaryCause ?? "refinement";
    const selectedCause = requested && /^[a-z_]+$/.test(requested) ? requested : inferredCause;
    const experimentLabel = intervention && /^(worked_then_problem|predict_then_explain)$/.test(intervention) ? ` · experiment:${intervention}` : "";
    const selectedFocus = `${selectedCause} practice${skillLabel}${experimentLabel}`;
    const session = createPracticeSession(selectedFocus);
    const selectedProgression = drillProgression(selectedFocus, practiceHistory);
    const baseAbility = estimateAbility(selectedFocus, selectedProgression.stage, practiceHistory);
    const selectedAbility = learnerTarget && baseAbility.observations === 0 ? { ...baseAbility, targetDifficulty: learnerTarget.targetDifficulty, reason: `${learnerTarget.message} This set starts at level ${learnerTarget.targetDifficulty}.` } : baseAbility;
    const availableQuestions = topicQuestionPool(PRACTICE_QUESTIONS, validSkill, topicMode);
    const selectedQuestionIds = selectAdaptiveSequence(availableQuestions, selectedAbility.targetDifficulty, topicMode ? null : validSkill, questionExposureCounts(practiceHistory), 10).map((item) => item.id);
    setSessionId(session.id);
    setFocus(session.focus);
    setProgression(selectedProgression);
    setAbility(selectedAbility);
    setQuestionIds(selectedQuestionIds);
    startedAt.current = session.questionStartedAt;
    window.localStorage.setItem(PRACTICE_SESSION_KEY, JSON.stringify({ ...session, questionIds: selectedQuestionIds, targetDifficulty: selectedAbility.targetDifficulty }));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !sessionId || index >= adaptiveQuestions.length) return;
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
      questionIds,
      targetDifficulty: ability.targetDifficulty,
    }));
  }, [ability.targetDifficulty, adaptiveQuestions.length, feedback, focus, hydrated, index, questionIds, records, selected, sessionId]);

  useEffect(() => {
    if (!hydrated || !sessionId || index < adaptiveQuestions.length) return;
    const session = createPracticeSession(focus);
    const completed = completePracticeSession({ ...session, id: sessionId, currentIndex: index, records, status: "active", questionStartedAt: startedAt.current });
    window.localStorage.setItem(PRACTICE_SESSION_KEY, JSON.stringify(completed.session));
    const history = parsePracticeHistory(window.localStorage.getItem(PRACTICE_HISTORY_KEY));
    window.localStorage.setItem(PRACTICE_HISTORY_KEY, JSON.stringify(addPracticeHistory(history, completed.entry)));
    if (focus.startsWith("refinement")) {
      const practicedSkill = records.find((record) => record.skill)?.skill;
      if (practicedSkill) {
        const transfers = parseTransferQueue(window.localStorage.getItem(TRANSFER_QUEUE_KEY));
        window.localStorage.setItem(TRANSFER_QUEUE_KEY, JSON.stringify(transfers.map((item) => item.skill === practicedSkill && !item.completedAt ? { ...item, completedAt: new Date().toISOString() } : item)));
      }
    }
  }, [adaptiveQuestions.length, focus, hydrated, index, records, sessionId]);

  const checkAnswer = useCallback(async (timedOut = false) => {
    if ((!timedOut && selected === null) || submitting || !question) return;
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
      setRecords((current) => [...current, { ...result, elapsedSeconds, targetSeconds: training.targetSeconds, difficulty: question.difficulty, skill: question.skill, timedOut, confidence: practiceConfidence }]);
      const repairQueue = parseRepairQueue(window.localStorage.getItem(REPAIR_QUEUE_KEY));
      window.localStorage.setItem(REPAIR_QUEUE_KEY, JSON.stringify(recordRepairEvidence(repairQueue, { key: question.id, skill: question.skill, category: question.category, isCorrect: result.isCorrect })));
      const calibration = parseItemCalibration(window.localStorage.getItem(ITEM_CALIBRATION_KEY));
      window.localStorage.setItem(ITEM_CALIBRATION_KEY, JSON.stringify(recordItemOutcome(calibration, { questionId: question.id, isCorrect: result.isCorrect, elapsedSeconds, targetSeconds: training.targetSeconds })));
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }, [practiceConfidence, question, selected, submitting, training.targetSeconds]);

  useEffect(() => {
    if (deadlineTriggered && !feedback && !submitting) void checkAnswer(true);
  }, [checkAnswer, deadlineTriggered, feedback, submitting]);

  function next() {
    setIndex((current) => current + 1);
    setSelected(null);
    setFeedback(null);
    setSelectionChanges(0);
    setPracticeConfidence(null);
    startedAt.current = Date.now();
  }

  function repeat() {
    window.localStorage.removeItem(PRACTICE_SESSION_KEY);
    window.location.reload();
  }

  if (index >= adaptiveQuestions.length) {
    const correct = records.filter((record) => record.isCorrect).length;
    const onPace = records.filter((record) => record.elapsedSeconds <= record.targetSeconds).length;
    const timedOut = records.filter((record) => record.timedOut).length;
    const gateMet = meetsStageGate({ sessionId, completedAt: new Date().toISOString(), focus, correct, total: records.length, onPace }, progression.stage);
    return (
      <main className="practice-shell">
        <PracticeNav />
        <section className="practice-complete"><div className="eyebrow">{progression.label} stage · level {ability.targetDifficulty}/5</div><h1>{correct} of {records.length} correct</h1><p>{onPace} decisions landed within target pace.{timedOut ? ` ${timedOut} reached the hard deadline.` : ""} {gateMet ? progression.stage === 3 ? "Transfer gate met—verify the gain on a full diagnostic." : "Gate met—your next set adds more time pressure." : `Stay at this stage until you ${progression.gate.toLowerCase()}`}</p><div className="practice-complete-actions"><button className="primary" onClick={repeat}>{gateMet && progression.stage < 3 ? "Continue to next stage" : "Repeat stage"}</button><Link className="secondary link-button" href="/?new=1">Reassess</Link></div></section>
        <section className="practice-recap">{records.map((record, recordIndex) => <article key={record.questionId}><span>{String(recordIndex + 1).padStart(2, "0")}</span><strong>{record.isCorrect ? "Correct" : record.timedOut ? "Time" : "Review"}</strong><small>{record.elapsedSeconds}s · {record.timedOut ? "deadline" : record.elapsedSeconds <= record.targetSeconds ? "on pace" : "slow"}</small></article>)}</section>
      </main>
    );
  }

  return (
    <main className="practice-shell">
      <PracticeNav />
      <div className="practice-progress"><i style={{ width: `${((index + (feedback ? 1 : 0)) / adaptiveQuestions.length) * 100}%` }} /></div>
      <section className="practice-card">
        <div className="training-directive"><strong>Stage {progression.stage} · {progression.label} · Level {ability.targetDifficulty}/5 · {training.title}</strong><span>{progression.purpose} {training.instruction}{focus.startsWith("second_guessing") && selectionChanges > 0 ? ` · ${selectionChanges} answer change${selectionChanges === 1 ? "" : "s"} so far` : ""}</span><small>{adaptiveQuestions.length}-question set from {PRACTICE_QUESTIONS.length} rotating items · {ability.confidence} evidence · {ability.reason} Advance when: {progression.gate}</small></div>
        <div className="question-meta"><span>{question.category} · {question.skill}</span><span>Difficulty {question.difficulty}/5 · Target {training.targetSeconds}s</span></div>
        {(progression.stage === 1 || focus.startsWith("knowledge")) && <SkillLesson skill={question.skill} category={question.category} />}
        {timeConstraint.enabled && <div className={`pace-clock ${clockState(secondsRemaining)}`} aria-live="polite"><span>{timeConstraint.label}</span><strong>{secondsRemaining}s</strong><small>{secondsRemaining > 0 ? "Decide, verify, commit" : timeConstraint.hardStop ? "Answer committed at deadline" : "Over target—finish cleanly"}</small></div>}
        {question.stimulus && <QuestionStimulus stimulus={question.stimulus} />}
        <h1>{question.prompt}</h1>
        <div className="choices">
          {question.choices.map((choice, choiceIndex) => <button key={choice} disabled={Boolean(feedback)} className={selected === choiceIndex ? "selected" : ""} onClick={() => { if (selected !== null && selected !== choiceIndex) setSelectionChanges((value) => value + 1); setSelected(choiceIndex); }}><span>{String.fromCharCode(65 + choiceIndex)}</span>{choice}</button>)}
        </div>
        {!feedback && <div className="confidence-row"><span>How certain is your method?</span>{([1, 2, 3] as const).map((level) => <button className={practiceConfidence === level ? "selected" : ""} onClick={() => setPracticeConfidence(level)} key={level}>{level === 1 ? "Guessing" : level === 2 ? "Likely" : "Certain"}</button>)}</div>}
        {feedback && <div className={`feedback-card ${feedback.isCorrect ? "correct" : "incorrect"}`}><div className="feedback-label">{feedback.isCorrect ? "Correct" : `Correct answer · ${feedback.correctAnswer}`}</div><p>{feedback.explanation}</p>{practiceConfidence === 3 && !feedback.isCorrect && <small>Calibration signal: the method felt certain but produced a miss. Reconstruct the rule before continuing.</small>}{practiceConfidence === 1 && feedback.isCorrect && <small>Calibration signal: you may know more than you trusted. Name the evidence that made this answer correct.</small>}</div>}
        {error && <p className="practice-error">We couldn’t check that answer. Your selection is still here—please try again.</p>}
        <div className="practice-actions"><span>Question {index + 1} of {adaptiveQuestions.length}</span>{feedback ? <button className="primary" onClick={next}>{index === adaptiveQuestions.length - 1 ? "See drill results" : "Next question →"}</button> : <button className="primary" disabled={selected === null || submitting} onClick={() => void checkAnswer()}>{submitting ? "Checking…" : "Check answer"}</button>}</div>
      </section>
    </main>
  );
}

function trainingConfig(focus: string, baseTarget: number, progression: DrillProgression) {
  const targetSeconds = targetForStage(baseTarget, progression.stage, focus);
  if (focus.startsWith("knowledge")) return { title: `Accuracy target · ${targetSeconds} seconds`, instruction: "Name the pattern before solving. Study the feedback before moving on.", targetSeconds };
  if (focus.startsWith("rushing")) return { title: "Fast-but-clean · verify before committing", instruction: "Name the rule, then check the exact value, direction, or character being asked for.", targetSeconds };
  if (focus.startsWith("speed")) return { title: `Fluency target · ${targetSeconds} seconds`, instruction: "Use the shortest reliable method and commit when the pattern is clear.", targetSeconds };
  if (focus.startsWith("rhythm")) return { title: `Cadence target · ${targetSeconds} seconds`, instruction: "Treat every three questions as one block. Do not let one hard item delay the next.", targetSeconds };
  if (focus.startsWith("second_guessing")) return { title: "Commitment target · no unsupported changes", instruction: "Change your first choice only when you can name a specific contradiction.", targetSeconds };
  return { title: "Mixed transfer practice", instruction: "Recognize the question family, choose a method, and execute at pace.", targetSeconds };
}

function PracticeNav() {
  return <nav className="nav"><Link className="brand brand-link" href="/"><span>AC</span>Aptitude Coach</Link><div className="nav-actions"><Link className="nav-text-link" href="/practice/topics">Choose topic</Link><Link className="nav-text-link" href="/practice?focus=speed&new=1">Timed drills</Link><Link className="nav-text-link" href="/progress">Progress</Link><span className="nav-note">Practice mode</span></div></nav>;
}

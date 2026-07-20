"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LESSON_PROGRESS_KEY, remediationLessonFor } from "@/lib/remediation-lessons";

type Progress = Record<string, number[]>;

export function RemediationLessonExperience() {
  const [skill, setSkill] = useState("deductive reasoning");
  const [progress, setProgress] = useState<Progress>({});
  const [answers, setAnswers] = useState<Record<number, number>>({});
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("skill");
    if (requested && /^[a-z0-9 &-]{2,40}$/i.test(requested)) setSkill(requested);
    try { setProgress(JSON.parse(window.localStorage.getItem(LESSON_PROGRESS_KEY) ?? "{}") as Progress); } catch { setProgress({}); }
  }, []);
  const lesson = useMemo(() => remediationLessonFor(skill), [skill]);
  const completed = progress[skill] ?? [];
  const nextModule = lesson.modules.findIndex((_, index) => !completed.includes(index));

  function answer(moduleIndex: number, choiceIndex: number) {
    setAnswers((current) => ({ ...current, [moduleIndex]: choiceIndex }));
    const item = lesson.modules[moduleIndex];
    if (choiceIndex !== item.check.correctIndex || completed.includes(moduleIndex)) return;
    const next = { ...progress, [skill]: [...completed, moduleIndex].sort() };
    setProgress(next);
    window.localStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(next));
  }

  return <main className="lesson-shell">
    <nav className="nav"><Link className="brand brand-link" href="/"><span>AC</span>Aptitude Coach</Link><div className="nav-actions"><Link className="nav-text-link" href="/progress">My coaching</Link><span className="nav-note">Guided lesson</span></div></nav>
    <header className="lesson-head"><div><div className="eyebrow">Knowledge repair · {lesson.domain}</div><h1>{lesson.title}</h1><p>{lesson.outcome}</p></div><div className="lesson-progress"><strong>{completed.length}/{lesson.modules.length}</strong><span>checks passed</span></div></header>
    <section className="lesson-path" aria-label="Lesson progress">{lesson.modules.map((item, index) => <div className={completed.includes(index) ? "complete" : index === nextModule ? "current" : ""} key={item.title}><span>{completed.includes(index) ? "✓" : index + 1}</span><small>{item.title.replace(/^\d+\. /, "")}</small></div>)}</section>
    <section className="lesson-modules">{lesson.modules.map((item, moduleIndex) => { const selected = answers[moduleIndex]; const checked = selected !== undefined; const correct = selected === item.check.correctIndex; return <details open={moduleIndex === Math.max(0, nextModule) || completed.includes(moduleIndex)} key={item.title}><summary><span>{completed.includes(moduleIndex) ? "✓" : moduleIndex + 1}</span><div><strong>{item.title}</strong><small>{item.objective}</small></div></summary><div className="lesson-module-body"><section><h2>Learn the method</h2><ol>{item.instruction.map((step) => <li key={step}>{step}</li>)}</ol></section><aside><div><small>Worked example</small><p>{item.workedExample}</p></div><div className="lesson-trap"><small>Common trap</small><p>{item.trap}</p></div></aside><section className="lesson-check"><div className="section-label">Check your understanding</div><h2>{item.check.prompt}</h2><div>{item.check.choices.map((choice, choiceIndex) => <button className={selected === choiceIndex ? correct ? "correct" : "incorrect" : ""} disabled={correct} onClick={() => answer(moduleIndex, choiceIndex)} key={choice}>{String.fromCharCode(65 + choiceIndex)}. {choice}</button>)}</div>{checked && <p className={correct ? "correct-copy" : "retry-copy"}><strong>{correct ? "Correct." : "Not yet."}</strong> {correct ? item.check.explanation : "Review the method above and try another choice."}</p>}</section></div></details>; })}</section>
    <section className={`lesson-transfer ${completed.length === lesson.modules.length ? "ready" : ""}`}><div><div className="section-label">Final step</div><h2>{completed.length === lesson.modules.length ? "Now apply the method under time pressure." : "Pass each check before timed practice."}</h2><p>{completed.length === lesson.modules.length ? "Your next adaptive set will start at a foundation level and increase difficulty only when accuracy is stable." : `${lesson.modules.length - completed.length} lesson check${lesson.modules.length - completed.length === 1 ? " remains" : "s remain"}.`}</p></div>{completed.length === lesson.modules.length && <Link className="primary link-button" href={`/practice?focus=knowledge&skill=${encodeURIComponent(skill)}&new=1`}>Start transfer drill →</Link>}</section>
  </main>;
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PRACTICE_QUESTIONS } from "@/lib/practice";

export function MethodRecognitionExperience() {
  const [skill, setSkill] = useState("deductive reasoning");
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => { const value = new URLSearchParams(window.location.search).get("skill"); if (value && /^[a-z0-9 &-]{2,40}$/i.test(value)) setSkill(value); }, []);
  const questions = useMemo(() => {
    const anchor = PRACTICE_QUESTIONS.find((item) => item.skill === skill);
    const category = anchor?.category ?? "Logic";
    const pool = PRACTICE_QUESTIONS.filter((item) => item.category === category);
    const varied = [...pool.filter((item) => item.skill === skill).slice(0, 4), ...pool.filter((item) => item.skill !== skill)];
    return [...new Map(varied.map((item) => [item.id, item])).values()].slice(0, 10);
  }, [skill]);
  const question = questions[index];
  const methods = useMemo(() => {
    if (!question) return [];
    const candidates = [question.skill, ...PRACTICE_QUESTIONS.filter((item) => item.category === question.category && item.skill !== question.skill).map((item) => item.skill)];
    return [...new Set(candidates)].slice(0, 4).sort((a, b) => (a.charCodeAt(0) + index) % 7 - (b.charCodeAt(0) + index) % 7);
  }, [index, question]);
  if (!question || index >= questions.length) return <main className="recognition-shell"><Nav /><section className="recognition-complete"><div className="eyebrow">Method recognition complete</div><h1>{correct} of {questions.length}</h1><p>{correct >= 8 ? "You are recognizing the method quickly enough to begin execution practice." : "Repeat this sprint until you identify at least 8 of 10 methods."}</p><div>{correct >= 8 && <Link className="primary link-button" href={`/practice?focus=speed&skill=${encodeURIComponent(skill)}&new=1`}>Build automaticity →</Link>}<button className="secondary" onClick={() => { setIndex(0); setCorrect(0); setSelected(null); }}>Repeat recognition</button></div></section></main>;
  const isCorrect = selected === question.skill;
  return <main className="recognition-shell"><Nav /><div className="recognition-progress"><i style={{ width: `${index / questions.length * 100}%` }} /></div><section className="recognition-card"><div className="eyebrow">Method recognition · do not solve</div><div className="question-meta"><span>{question.category}</span><span>{index + 1} of {questions.length}</span></div><h1>{question.prompt}</h1>{question.stimulus && <p className="recognition-stimulus-note">The full item includes a {question.stimulus.kind} display. Identify the governing method from the stem.</p>}<h2>Which method should you use first?</h2><div className="recognition-choices">{methods.map((method) => <button disabled={selected !== null} onClick={() => { setSelected(method); if (method === question.skill) setCorrect((value) => value + 1); }} key={method}>{method}</button>)}</div>{selected && <div className={`recognition-feedback ${isCorrect ? "correct" : "incorrect"}`}><strong>{isCorrect ? "Correct." : `Use ${question.skill}.`}</strong><p>{firstStep(question.skill)}</p><button className="primary" onClick={() => { setIndex((value) => value + 1); setSelected(null); }}>{index === questions.length - 1 ? "See results" : "Next item →"}</button></div>}</section></main>;
}

function firstStep(skill: string) {
  const value = skill.toLowerCase();
  if (/syllog|deductive/.test(value)) return "Translate each premise, then test what must follow.";
  if (/ordering/.test(value)) return "Build one chain from the stated before/after relationships.";
  if (/percent/.test(value)) return "Identify the base quantity before calculating.";
  if (/sequence|series/.test(value)) return "Check differences, ratios, alternation, then interleaving.";
  if (/sentence|vocab|antonym/.test(value)) return "Predict the needed meaning from context before reading choices.";
  if (/analogy/.test(value)) return "State the exact relationship in a short sentence.";
  if (/matrix|visual|rotation|spatial/.test(value)) return "Track one feature and name the transformation.";
  if (/attention/.test(value)) return "Compare fixed character chunks from left to right.";
  return "Translate the question into its simplest governing relationship.";
}

function Nav() { return <nav className="nav"><Link className="brand brand-link" href="/"><span>AC</span>Aptitude Coach</Link><div className="nav-actions"><Link className="nav-text-link" href="/practice/topics">Choose topics</Link><Link className="nav-text-link" href="/progress">My coaching</Link></div></nav>; }

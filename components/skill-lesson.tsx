import { lessonFor } from "@/lib/skill-lessons";

export function SkillLesson({ skill, category }: { skill: string; category?: string }) {
  const lesson = lessonFor(skill, category);
  return <details className="skill-lesson" open><summary>60-second method · {lesson.title}</summary><ol>{lesson.method.map((step) => <li key={step}>{step}</li>)}</ol><p><strong>Worked example:</strong> {lesson.example}</p><small>{lesson.checkpoint}</small></details>;
}

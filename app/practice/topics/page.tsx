import Link from "next/link";
import { PRACTICE_TOPICS } from "@/lib/practice-topics";

export default function PracticeTopicsPage() {
  return (
    <main className="topic-shell">
      <nav className="nav">
        <Link className="brand brand-link" href="/"><span>AC</span>Aptitude Coach</Link>
        <div className="nav-actions"><Link className="nav-text-link" href="/practice?new=1">Mixed practice</Link><Link className="nav-text-link" href="/progress">Progress</Link></div>
      </nav>
      <section className="topic-intro">
        <div className="eyebrow">Practice by topic</div>
        <h1>Choose one skill to train.</h1>
        <p>Each drill contains 10 questions from the selected family. Difficulty adapts to your performance and completed questions rotate out.</p>
      </section>
      <section className="topic-grid">
        {PRACTICE_TOPICS.map((topic) => (
          <article className="topic-card" key={topic.skill}>
            <small>{topic.group}</small>
            <h2>{topic.title}</h2>
            <p>{topic.description}</p>
            <Link className="primary link-button" href={`/practice?focus=refinement&skill=${encodeURIComponent(topic.skill)}&mode=topic&new=1`}>Start 10 questions →</Link>
          </article>
        ))}
      </section>
    </main>
  );
}

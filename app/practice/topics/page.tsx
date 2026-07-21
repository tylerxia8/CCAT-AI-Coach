import Link from "next/link";
import type { Category } from "@/lib/diagnostic";
import { PRACTICE_QUESTIONS } from "@/lib/practice";
import { practiceTopicCatalog } from "@/lib/practice-topics";

const CATEGORY_COPY: Record<Category, string> = {
  Verbal: "Reading and vocabulary",
  Numerical: "Mathematics and quantitative reasoning",
  Logic: "Logic and pattern-related questions",
  Spatial: "Spatial and visual reasoning",
};

export default function PracticeTopicsPage() {
  const topics = practiceTopicCatalog(PRACTICE_QUESTIONS);
  const categories = [...new Set(topics.map((topic) => topic.category))];
  return (
    <main className="topic-shell">
      <nav className="nav">
        <Link className="brand brand-link" href="/"><span>AC</span>Aptitude Coach</Link>
        <div className="nav-actions"><Link className="nav-text-link" href="/practice?new=1">Mixed practice</Link><Link className="nav-text-link" href="/progress">Progress</Link></div>
      </nav>
      <section className="topic-intro">
        <div className="eyebrow">Practice by topic</div>
        <h1>Choose one skill to train.</h1>
        <p>Choose from every question family in the practice bank. Each drill uses up to 10 unique questions, adapts difficulty, and rotates completed items.</p>
      </section>
      <div className="topic-sections">
        {categories.map((category) => (
          <section className="topic-section" key={category}>
            <div className="topic-section-heading"><div><small>{category}</small><h2>{CATEGORY_COPY[category]}</h2></div><span>{topics.filter((topic) => topic.category === category).length} skills</span></div>
            <div className="topic-grid">
              {topics.filter((topic) => topic.category === category).map((topic) => (
                <article className="topic-card" key={topic.skill}>
                  <small>{topic.count} question{topic.count === 1 ? "" : "s"} available</small>
                  <h3>{titleCase(topic.skill)}</h3>
                  <Link className="primary link-button" href={`/practice?focus=refinement&skill=${encodeURIComponent(topic.skill)}&mode=topic&new=1`}>Start {Math.min(10, topic.count)} question{topic.count === 1 ? "" : "s"} →</Link>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

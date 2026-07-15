import Link from "next/link";
import { causeLabel, type PerformanceDiagnosis as Diagnosis } from "@/lib/performance-diagnosis";

export function PerformanceDiagnosis({ diagnosis }: { diagnosis: Diagnosis }) {
  return (
    <section className="diagnosis-section">
      <div className="diagnosis-heading">
        <div><div className="section-label">Why points were lost</div><h2>{diagnosis.summary}</h2></div>
        <p>These are behavioral inferences, not certainties. Confidence rises as the app observes more relevant decisions.</p>
      </div>
      <div className="adaptive-next">
        <div><div className="section-label">Best next activity</div><h3>{diagnosis.nextActivity.title}</h3><p>{diagnosis.nextActivity.reason}</p></div>
        <div><small>Advance when</small><strong>{diagnosis.nextActivity.target}</strong><Link className="primary link-button" href={diagnosis.nextActivity.href}>Start activity →</Link></div>
      </div>
      <details className="diagnostic-details">
        <summary>View diagnostic evidence and all skill estimates</summary>
        <div className="cause-grid">
          {diagnosis.causes.map((cause) => <article className={cause.cause === diagnosis.primaryCause ? "primary-cause" : ""} key={cause.cause}><div className="cause-title"><strong>{causeLabel(cause.cause)}</strong><span>{cause.confidence} evidence</span></div><div className="cause-meter"><i style={{ width: `${Math.round(cause.score * 100)}%` }} /></div><ul>{cause.evidence.map((evidence) => <li key={evidence}>{evidence}</li>)}</ul></article>)}
        </div>
        <div className="skill-diagnostics">
          <div><div className="section-label">Skill-level evidence</div><h3>Where points and seconds were lost.</h3></div>
          <div className="skill-diagnostic-list">{diagnosis.skillBreakdown.map((item) => <div key={item.skill}><strong>{item.skill}</strong><span>{item.mastery}% estimate</span><span>{item.correct}/{item.total} correct</span><span>{item.averageSeconds || "—"}s avg</span><span>{item.slow} slow</span></div>)}</div>
        </div>
      </details>
    </section>
  );
}

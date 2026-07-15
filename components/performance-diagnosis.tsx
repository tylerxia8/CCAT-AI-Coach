import { causeLabel, type PerformanceDiagnosis as Diagnosis } from "@/lib/performance-diagnosis";

export function PerformanceDiagnosis({ diagnosis }: { diagnosis: Diagnosis }) {
  return (
    <section className="diagnosis-section">
      <div className="diagnosis-heading">
        <div><div className="section-label">Why points were lost</div><h2>{diagnosis.summary}</h2></div>
        <p>These are behavioral inferences, not certainties. Confidence rises as the app observes more relevant decisions.</p>
      </div>
      <div className="cause-grid">
        {diagnosis.causes.map((cause) => (
          <article className={cause.cause === diagnosis.primaryCause ? "primary-cause" : ""} key={cause.cause}>
            <div className="cause-title"><strong>{causeLabel(cause.cause)}</strong><span>{cause.confidence} evidence</span></div>
            <div className="cause-meter"><i style={{ width: `${Math.round(cause.score * 100)}%` }} /></div>
            <ul>{cause.evidence.map((evidence) => <li key={evidence}>{evidence}</li>)}</ul>
          </article>
        ))}
      </div>
      <div className="prescription-grid">
        {diagnosis.prescriptions.map((prescription) => (
          <article key={prescription.title}>
            <div className="section-label">{prescription.mode} training</div>
            <h3>{prescription.title}</h3>
            <p>{prescription.instructions}</p>
            <strong>{prescription.target}</strong>
          </article>
        ))}
      </div>
      <div className="skill-diagnostics">
        <div><div className="section-label">Skill-level evidence</div><h3>Where points and seconds were lost.</h3></div>
        <div className="skill-diagnostic-list">
          {diagnosis.skillBreakdown.map((item) => (
            <div key={item.skill}><strong>{item.skill}</strong><span>{item.correct}/{item.total} correct</span><span>{item.averageSeconds || "—"}s avg</span><span>{item.slow} slow</span><span>{item.changed} changed</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}

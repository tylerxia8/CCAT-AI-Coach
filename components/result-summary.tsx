import Link from "next/link";
import { causeLabel } from "@/lib/performance-diagnosis";
import type { ScoredDiagnosticResult } from "@/lib/diagnostic";

export function ResultSummary({ result }: { result: ScoredDiagnosticResult }) {
  const weakest = result.diagnosis.skillBreakdown[0];
  const lost = weakest ? `${weakest.skill}: ${weakest.total - weakest.correct} of ${weakest.total} points missed` : `${result.total - result.correct} points were left unclaimed`;
  return (
    <section className="result-summary" aria-label="Your three-part result summary">
      <article><span>Where points were lost</span><strong>{lost}</strong><p>{weakest ? `${weakest.averageSeconds || "—"}s average with ${weakest.slow} slow decisions.` : "Complete another form to build skill-level evidence."}</p></article>
      <article><span>Most likely reason</span><strong>{causeLabel(result.diagnosis.primaryCause)}</strong><p>{result.diagnosis.summary}</p></article>
      <article className="result-summary-next"><span>Do this next</span><strong>{result.diagnosis.nextActivity.title}</strong><p>{result.diagnosis.nextActivity.target}</p><Link className="primary" href={result.diagnosis.nextActivity.href}>Start training →</Link></article>
    </section>
  );
}

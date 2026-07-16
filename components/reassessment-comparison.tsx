import type { ReassessmentComparison as Comparison } from "@/lib/reassessment";

function points(value: number) { return `${value >= 0 ? "+" : ""}${Math.round(value * 100)} pts`; }

export function ReassessmentComparison({ comparison }: { comparison: Comparison | null }) {
  if (!comparison) return null;
  return (
    <section className="reassessment-card">
      <div><div className="section-label">Compared with your first diagnostic</div><h2>{comparison.summary}</h2><p>Full diagnostic #{comparison.sessions} versus baseline.</p></div>
      <div className="reassessment-metrics">
        <span><small>Raw score</small><strong>{comparison.scoreDelta >= 0 ? "+" : ""}{comparison.scoreDelta}</strong></span>
        <span><small>Accuracy</small><strong>{points(comparison.accuracyDelta)}</strong></span>
        <span><small>On-pace</small><strong>{points(comparison.paceDelta)}</strong></span>
        <span><small>Confidence</small><strong>{points(comparison.confidenceDelta)}</strong></span>
      </div>
    </section>
  );
}

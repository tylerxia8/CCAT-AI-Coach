import type { DiagnosticResult } from "@/lib/diagnostic";
import { assessSimulationReadiness } from "@/lib/simulation-readiness";

export function SimulationReadiness({ result, observations }: { result: DiagnosticResult; observations: number }) {
  const readiness = assessSimulationReadiness(result, observations);
  return <section className={`readiness-strip ${readiness.tier}`}><div><div className="section-label">Practice readiness · {readiness.score}/100</div><h2>{readiness.label}</h2><p>{readiness.summary}</p></div><div><small>Next evidence gate</small><strong>{readiness.nextGate}</strong></div></section>;
}

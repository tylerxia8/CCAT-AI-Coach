import { describe, expect, it } from "vitest";
import { assessLongitudinalReadiness, assessSimulationReadiness } from "./simulation-readiness";

describe("simulation readiness", () => {
  it("requires both accuracy and pace for the top tier", () => {
    expect(assessSimulationReadiness({ accuracy: 0.86, paceScore: 0.8, confidenceScore: 0.8 }, 50).tier).toBe("simulation_ready");
    expect(assessSimulationReadiness({ accuracy: 0.9, paceScore: 0.4, confidenceScore: 0.8 }, 50).tier).not.toBe("simulation_ready");
  });

  it("does not overstate readiness from a tiny sample", () => {
    expect(assessSimulationReadiness({ accuracy: 1, paceScore: 1, confidenceScore: 1 }, 8).tier).not.toBe("simulation_ready");
  });
});

describe("longitudinal readiness", () => {
  it("requires two stable forms", () => {
    const entry = (id: string) => ({ sessionId: id, completedAt: `2026-07-${id}T12:00:00Z`, correct: 40, total: 50, accuracy: .8, averageSeconds: 17, paceScore: .72, confidenceScore: .7, categoryResults: [], bottleneck: "refinement" as const, coachingTitle: "Ready" });
    expect(assessLongitudinalReadiness({ version: 1, entries: [entry("20")] }).ready).toBe(false);
    expect(assessLongitudinalReadiness({ version: 1, entries: [entry("20"), entry("21")] }).ready).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { assessSimulationReadiness } from "./simulation-readiness";

describe("simulation readiness", () => {
  it("requires both accuracy and pace for the top tier", () => {
    expect(assessSimulationReadiness({ accuracy: 0.86, paceScore: 0.8, confidenceScore: 0.8 }, 50).tier).toBe("simulation_ready");
    expect(assessSimulationReadiness({ accuracy: 0.9, paceScore: 0.4, confidenceScore: 0.8 }, 50).tier).not.toBe("simulation_ready");
  });

  it("does not overstate readiness from a tiny sample", () => {
    expect(assessSimulationReadiness({ accuracy: 1, paceScore: 1, confidenceScore: 1 }, 8).tier).not.toBe("simulation_ready");
  });
});

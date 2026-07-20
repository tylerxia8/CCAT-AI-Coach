import { describe, expect, it } from "vitest";
import { treatmentFor } from "./intervention-experiments";

describe("instruction experiments", () => {
  it("alternates safe treatments within a skill", () => {
    expect(treatmentFor("logic", [])).toBe("worked_then_problem");
    expect(treatmentFor("logic", [{ skill: "logic", treatment: "worked_then_problem", completedAt: "2026-07-20" }])).toBe("predict_then_explain");
  });
});

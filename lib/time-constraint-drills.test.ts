import { describe, expect, it } from "vitest";
import { clockState, timeConstraintFor } from "./time-constraint-drills";

describe("time constraint drills", () => {
  it("progresses from a visible clock to a hard deadline", () => {
    expect(timeConstraintFor("speed practice", 1)).toMatchObject({ enabled: true, hardStop: false, label: "Visible clock" });
    expect(timeConstraintFor("rhythm practice", 2)).toMatchObject({ enabled: true, hardStop: false, label: "Pace warning" });
    expect(timeConstraintFor("rushing practice", 3)).toMatchObject({ enabled: true, hardStop: true, label: "Hard deadline" });
  });

  it("keeps knowledge drills free of forced timing", () => {
    expect(timeConstraintFor("knowledge practice", 3)).toMatchObject({ enabled: false, hardStop: false });
  });

  it("marks the final five seconds and expiration", () => {
    expect(clockState(12)).toBe("steady");
    expect(clockState(5)).toBe("urgent");
    expect(clockState(0)).toBe("expired");
  });
});

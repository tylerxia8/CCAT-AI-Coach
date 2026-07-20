import { describe, expect, it } from "vitest";
import { calibrationSummary, parseItemCalibration, recordItemOutcome } from "./item-calibration";

describe("item calibration", () => {
  it("aggregates repeat outcomes and flags extreme items", () => {
    let data = parseItemCalibration(null);
    data = recordItemOutcome(data, { questionId: "q1", isCorrect: false, elapsedSeconds: 4, targetSeconds: 20 });
    data = recordItemOutcome(data, { questionId: "q1", isCorrect: false, elapsedSeconds: 5, targetSeconds: 20 });
    expect(calibrationSummary(data)).toMatchObject({ observedItems: 1, repeatedItems: 1, suspectItems: ["q1"], unstableItems: ["q1"] });
  });
});

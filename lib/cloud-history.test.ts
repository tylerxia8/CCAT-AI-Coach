import { describe, expect, it } from "vitest";
import { mapCloudHistory, type CloudDiagnosticRow } from "./cloud-history";

const validRow: CloudDiagnosticRow = {
  session_id: "12345678-1234-4123-8123-123456789abc",
  completed_at: "2026-07-15T12:00:00.000Z",
  correct: 6,
  total: 8,
  accuracy: 0.75,
  average_seconds: 29,
  pace_score: 0.75,
  confidence_score: 0.8,
  category_results: [{ category: "Numerical", correct: 2, total: 3 }],
  bottleneck: "pacing",
  coaching_title: "Build a faster decision rhythm",
};

describe("cloud history mapping", () => {
  it("maps validated cloud rows into local history entries", () => {
    expect(mapCloudHistory([validRow])).toEqual([expect.objectContaining({ sessionId: validRow.session_id, paceScore: 0.75, bottleneck: "pacing" })]);
  });

  it("drops rows with invalid ratios, IDs, or categories", () => {
    expect(mapCloudHistory([{ ...validRow, accuracy: 1.2 }])).toEqual([]);
    expect(mapCloudHistory([{ ...validRow, session_id: "not-a-uuid" }])).toEqual([]);
    expect(mapCloudHistory([{ ...validRow, category_results: [{ category: "Unknown", correct: 1, total: 1 }] }])).toEqual([]);
  });

  it("does not accept impossible scores", () => {
    expect(mapCloudHistory([{ ...validRow, correct: 9, total: 8 }])).toEqual([]);
  });
});

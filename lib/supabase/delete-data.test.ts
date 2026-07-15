import { describe, expect, it } from "vitest";
import { safeCount } from "./delete-data";

describe("cloud deletion result parsing", () => {
  it("accepts non-negative integer deletion counts", () => {
    expect(safeCount(0)).toBe(0);
    expect(safeCount(12)).toBe(12);
  });

  it("converts malformed counts to zero", () => {
    expect(safeCount(-1)).toBe(0);
    expect(safeCount(1.5)).toBe(0);
    expect(safeCount("3")).toBe(0);
    expect(safeCount(null)).toBe(0);
  });
});

import { describe, expect, it } from "vitest";
import { buildTestProgram } from "./test-program";

describe("test-date program", () => {
  const now = new Date("2026-07-20T12:00:00");
  it("changes training phases with time remaining", () => {
    expect(buildTestProgram("2026-07-21", now)?.phase).toBe("urgent");
    expect(buildTestProgram("2026-07-27", now)?.phase).toBe("one_week");
    expect(buildTestProgram("2026-08-20", now)?.phase).toBe("build");
  });
});

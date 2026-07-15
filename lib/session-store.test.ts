import { describe, expect, it } from "vitest";
import { appendEvent, createSession, parseSession, restoreRemainingSeconds, serializeSession } from "./session-store";

describe("session store", () => {
  it("round-trips a valid diagnostic session", () => {
    const session = createSession(new Date("2026-01-01T00:00:00.000Z"));
    const restored = parseSession(serializeSession(session));
    expect(restored?.id).toBe(session.id);
    expect(restored?.status).toBe("active");
    expect(restored?.remainingSeconds).toBe(900);
  });

  it("rejects malformed or incompatible data", () => {
    expect(parseSession("not-json")).toBeNull();
    expect(parseSession(JSON.stringify({ version: 2 }))).toBeNull();
  });

  it("appends versioned telemetry without mutating the original session", () => {
    const session = createSession(new Date("2026-01-01T00:00:00.000Z"));
    const updated = appendEvent(session, "question_view", { questionId: "num-01" }, new Date("2026-01-01T00:00:01.000Z"));
    expect(session.events).toHaveLength(0);
    expect(updated.events).toHaveLength(1);
    expect(updated.events[0]).toMatchObject({ name: "question_view", questionId: "num-01" });
  });

  it("continues counting down while the page is closed or suspended", () => {
    const session = createSession(new Date("2026-07-15T12:00:00Z"));
    expect(restoreRemainingSeconds(session, new Date("2026-07-15T12:02:30Z"))).toBe(750);
    expect(restoreRemainingSeconds(session, new Date("2026-07-15T12:20:00Z"))).toBe(0);
  });
});

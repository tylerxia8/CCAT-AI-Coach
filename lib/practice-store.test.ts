import { describe, expect, it } from "vitest";
import { addPracticeHistory, completePracticeSession, createPracticeSession, parsePracticeHistory, parsePracticeSession } from "./practice-store";

describe("practice persistence", () => {
  it("round-trips a valid active session", () => {
    const session = createPracticeSession("pacing practice", new Date("2026-07-15T12:00:00Z"));
    expect(parsePracticeSession(JSON.stringify(session))).toMatchObject({ id: session.id, focus: "pacing practice", currentIndex: 0 });
  });

  it("creates completion metrics from committed records", () => {
    const session = createPracticeSession();
    session.records = [
      { questionId: "one", isCorrect: true, correctAnswer: "A", explanation: "Why", elapsedSeconds: 20, targetSeconds: 30 },
      { questionId: "two", isCorrect: false, correctAnswer: "B", explanation: "Why", elapsedSeconds: 40, targetSeconds: 30 },
    ];
    const completed = completePracticeSession(session, new Date("2026-07-15T12:10:00Z"));
    expect(completed.entry).toMatchObject({ correct: 1, total: 2, onPace: 1 });
    expect(completed.session.status).toBe("completed");
  });

  it("stores a completed drill only once", () => {
    const entry = { sessionId: "session", completedAt: "2026-07-15T12:00:00Z", focus: "pacing", correct: 6, total: 8, onPace: 7 };
    const once = addPracticeHistory({ version: 1, entries: [] }, entry);
    const twice = addPracticeHistory(once, { ...entry, correct: 7 });
    expect(twice.entries).toHaveLength(1);
    expect(twice.entries[0].correct).toBe(7);
    expect(parsePracticeHistory("bad-json").entries).toEqual([]);
  });
});

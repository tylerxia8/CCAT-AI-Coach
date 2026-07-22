import { describe, expect, it } from "vitest";
import { POST } from "./route";
import { normalizeCompletedAttempts, QUESTIONS } from "@/lib/diagnostic";
import { DIAGNOSTIC_ANSWER_KEY } from "@/lib/question-bank.server";

function request(body: unknown) {
  return new Request("http://localhost/api/diagnostic/score", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("diagnostic scoring API", () => {
  it("scores valid unique attempts on the server", async () => {
    const attempts = QUESTIONS.map((question) => ({
      questionId: question.id,
      answerIndex: DIAGNOSTIC_ANSWER_KEY[question.id].correctIndex,
      elapsedSeconds: question.targetSeconds,
      confidence: 3,
      firstAnswerIndex: DIAGNOSTIC_ANSWER_KEY[question.id].correctIndex,
      firstAnswerSeconds: question.targetSeconds - 2,
      viewCount: 1,
    }));
    const response = await POST(request({ attempts }));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    const result = await response.json();
    expect(result).toMatchObject({ correct: QUESTIONS.length, accuracy: 1 });
    expect(result.reviews).toHaveLength(QUESTIONS.length);
    expect(result.reviews[0]).toMatchObject({ isCorrect: true, firstAnswerCorrect: true, firstAnswerSeconds: 16, viewCount: 1, pace: "on_target", answerChanges: 0, skill: "rates and arithmetic" });
    expect(result.reviews[0].choices).toEqual(QUESTIONS[0].choices);
    expect(result.reviews[0].explanation).toContain("five 8-hour blocks");
    expect(result.coaching).toMatchObject({ bottleneck: "refinement" });
    expect(result.diagnosis).toMatchObject({ primaryCause: "refinement", weakestSkill: null });
  });

  it("rejects duplicate question attempts", async () => {
    const attempts = normalizeCompletedAttempts(QUESTIONS, []);
    attempts[attempts.length - 1] = { ...attempts[0] };
    const response = await POST(request({ attempts }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Duplicate attempts" });
  });

  it("rejects unknown questions and unreasonable timings", async () => {
    const unknown = await POST(request({ attempts: [{ questionId: "unknown", answerIndex: 0, elapsedSeconds: 10, confidence: 2 }] }));
    const unreasonable = await POST(request({ attempts: [{ questionId: QUESTIONS[0].id, answerIndex: 0, elapsedSeconds: 999, confidence: 2 }] }));
    expect(unknown.status).toBe(400);
    expect(unreasonable.status).toBe(400);
  });

  it("marks omitted questions without inventing timing or confidence", async () => {
    const response = await POST(request({ attempts: normalizeCompletedAttempts(QUESTIONS, []) }));
    const result = await response.json();
    expect(result.reviews[0]).toMatchObject({ selectedAnswer: null, isCorrect: false, pace: "unanswered", elapsedSeconds: 0, confidence: null });
  });

  it("refuses to release scoring or explanations for a partial form", async () => {
    const partial = [{ questionId: QUESTIONS[0].id, answerIndex: null, elapsedSeconds: 0, confidence: null }];
    const response = await POST(request({ attempts: partial }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid attempts" });
  });
});

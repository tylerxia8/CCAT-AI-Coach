import { describe, expect, it } from "vitest";
import { POST } from "./route";
import { QUESTIONS } from "@/lib/diagnostic";
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
    }));
    const response = await POST(request({ attempts }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ correct: QUESTIONS.length, accuracy: 1 });
  });

  it("rejects duplicate question attempts", async () => {
    const attempt = { questionId: QUESTIONS[0].id, answerIndex: 0, elapsedSeconds: 10, confidence: 2 };
    const response = await POST(request({ attempts: [attempt, attempt] }));
    expect(response.status).toBe(400);
  });

  it("rejects unknown questions and unreasonable timings", async () => {
    const unknown = await POST(request({ attempts: [{ questionId: "unknown", answerIndex: 0, elapsedSeconds: 10, confidence: 2 }] }));
    const unreasonable = await POST(request({ attempts: [{ questionId: QUESTIONS[0].id, answerIndex: 0, elapsedSeconds: 999, confidence: 2 }] }));
    expect(unknown.status).toBe(400);
    expect(unreasonable.status).toBe(400);
  });
});

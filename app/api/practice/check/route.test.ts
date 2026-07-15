import { describe, expect, it } from "vitest";
import { POST } from "./route";
import { PRACTICE_QUESTIONS } from "@/lib/practice";
import { PRACTICE_ANSWER_KEY } from "@/lib/practice-bank.server";

function request(body: unknown) {
  return new Request("http://localhost/api/practice/check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}

describe("practice answer API", () => {
  it("releases verified feedback after a valid committed answer", async () => {
    const question = PRACTICE_QUESTIONS[0];
    const response = await POST(request({ questionId: question.id, answerIndex: PRACTICE_ANSWER_KEY[question.id].correctIndex }));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(await response.json()).toMatchObject({ questionId: question.id, isCorrect: true, correctAnswer: "400" });
  });

  it("returns corrective feedback for a wrong answer", async () => {
    const response = await POST(request({ questionId: PRACTICE_QUESTIONS[0].id, answerIndex: 0 }));
    expect(await response.json()).toMatchObject({ isCorrect: false, correctAnswer: "400" });
  });

  it("rejects unknown questions and out-of-range answers", async () => {
    expect((await POST(request({ questionId: "unknown", answerIndex: 0 }))).status).toBe(400);
    expect((await POST(request({ questionId: PRACTICE_QUESTIONS[0].id, answerIndex: 99 }))).status).toBe(400);
  });
});

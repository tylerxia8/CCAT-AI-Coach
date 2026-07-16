import { describe, expect, it } from "vitest";
import { POST } from "./route";
import { PRACTICE_TEST_ANSWER_KEY } from "@/lib/practice-test-bank.server";
import { PRACTICE_TEST_QUESTIONS } from "@/lib/practice-test";

function request(attempts: unknown) { return new Request("http://localhost/api/practice-test/score", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ attempts }) }); }

describe("practice test scoring API", () => {
  it("scores a complete form and releases review only afterward", async () => {
    const attempts = PRACTICE_TEST_QUESTIONS.map((question) => ({ questionId: question.id, answerIndex: PRACTICE_TEST_ANSWER_KEY[question.id].correctIndex, elapsedSeconds: 18, confidence: 3, answerChanges: 0 }));
    const response = await POST(request(attempts));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    const result = await response.json();
    expect(result).toMatchObject({ correct: 20, total: 20, accuracy: 1 });
    expect(result.reviews).toHaveLength(20);
  });

  it("rejects partial forms", async () => {
    const response = await POST(request([{ questionId: "pt-ver-01", answerIndex: 1, elapsedSeconds: 10, confidence: 2 }]));
    expect(response.status).toBe(400);
  });
});

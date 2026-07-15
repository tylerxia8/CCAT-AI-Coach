import { NextResponse } from "next/server";
import { QUESTIONS, scoreDiagnostic, type Attempt } from "@/lib/diagnostic";
import { DIAGNOSTIC_ANSWER_KEY } from "@/lib/question-bank.server";

const questionIds = new Set(QUESTIONS.map((question) => question.id));

function isAttempt(value: unknown): value is Attempt {
  if (!value || typeof value !== "object") return false;
  const attempt = value as Partial<Attempt>;
  return typeof attempt.questionId === "string"
    && questionIds.has(attempt.questionId)
    && (attempt.answerIndex === null || (Number.isInteger(attempt.answerIndex) && Number(attempt.answerIndex) >= 0 && Number(attempt.answerIndex) < 5))
    && typeof attempt.elapsedSeconds === "number"
    && Number.isFinite(attempt.elapsedSeconds)
    && attempt.elapsedSeconds >= 0
    && attempt.elapsedSeconds <= 360
    && (attempt.confidence === null || attempt.confidence === 1 || attempt.confidence === 2 || attempt.confidence === 3);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const attempts = (body as { attempts?: unknown })?.attempts;
  if (!Array.isArray(attempts) || attempts.length > QUESTIONS.length || !attempts.every(isAttempt)) {
    return NextResponse.json({ error: "Invalid attempts" }, { status: 400 });
  }
  if (new Set(attempts.map((attempt) => attempt.questionId)).size !== attempts.length) {
    return NextResponse.json({ error: "Duplicate attempts" }, { status: 400 });
  }
  return NextResponse.json(scoreDiagnostic(QUESTIONS, attempts, DIAGNOSTIC_ANSWER_KEY));
}

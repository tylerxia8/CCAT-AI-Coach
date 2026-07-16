import { NextResponse } from "next/server";
import { PRACTICE_QUESTIONS } from "@/lib/practice";
import { PRACTICE_ANSWER_KEY } from "@/lib/practice-bank.server";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  const { questionId, answerIndex } = body as { questionId?: unknown; answerIndex?: unknown };
  if (typeof questionId !== "string" || (answerIndex !== null && !Number.isInteger(answerIndex))) return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  const question = PRACTICE_QUESTIONS.find((item) => item.id === questionId);
  const answer = PRACTICE_ANSWER_KEY[questionId];
  if (!question || !answer || (answerIndex !== null && (Number(answerIndex) < 0 || Number(answerIndex) >= question.choices.length))) return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  return NextResponse.json({
    questionId,
    isCorrect: answer.correctIndex === answerIndex,
    correctAnswer: question.choices[answer.correctIndex],
    explanation: answer.explanation,
  }, { headers: { "cache-control": "private, no-store, max-age=0", pragma: "no-cache" } });
}

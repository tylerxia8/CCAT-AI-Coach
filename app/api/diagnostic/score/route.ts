import { NextResponse } from "next/server";
import { DIAGNOSTIC_SECONDS, QUESTIONS, scoreDiagnostic, type Attempt, type ScoredDiagnosticResult } from "@/lib/diagnostic";
import { DIAGNOSTIC_ANSWER_KEY } from "@/lib/question-bank.server";
import { buildCoachingPlan } from "@/lib/coaching";
import { diagnosePerformance, inferQuestionSkill } from "@/lib/performance-diagnosis";

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
    && attempt.elapsedSeconds <= DIAGNOSTIC_SECONDS
    && (attempt.answerChanges === undefined || (Number.isInteger(attempt.answerChanges) && attempt.answerChanges >= 0 && attempt.answerChanges <= 20))
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
  if (!Array.isArray(attempts) || attempts.length !== QUESTIONS.length || !attempts.every(isAttempt)) {
    return NextResponse.json({ error: "Invalid attempts" }, { status: 400 });
  }
  if (new Set(attempts.map((attempt) => attempt.questionId)).size !== attempts.length) {
    return NextResponse.json({ error: "Duplicate attempts" }, { status: 400 });
  }
  const score = scoreDiagnostic(QUESTIONS, attempts, DIAGNOSTIC_ANSWER_KEY);
  const attemptById = new Map(attempts.map((attempt) => [attempt.questionId, attempt]));
  const reviews = QUESTIONS.map((question) => {
    const attempt = attemptById.get(question.id);
    const answer = DIAGNOSTIC_ANSWER_KEY[question.id];
    return {
      questionId: question.id,
      category: question.category,
      prompt: question.prompt,
      selectedAnswer: attempt?.answerIndex == null ? null : question.choices[attempt.answerIndex] ?? null,
      correctAnswer: question.choices[answer.correctIndex],
      isCorrect: attempt?.answerIndex === answer.correctIndex,
      pace: !attempt || attempt.answerIndex === null ? "unanswered" as const : attempt.elapsedSeconds <= question.targetSeconds ? "on_target" as const : "slow" as const,
      elapsedSeconds: attempt?.elapsedSeconds ?? 0,
      targetSeconds: question.targetSeconds,
      confidence: attempt?.confidence ?? null,
      answerChanges: attempt?.answerChanges ?? 0,
      skill: inferQuestionSkill(question),
      explanation: answer.explanation,
    };
  });
  const result: ScoredDiagnosticResult = { ...score, reviews, coaching: buildCoachingPlan(score, reviews), diagnosis: diagnosePerformance(reviews) };
  return NextResponse.json(result, { headers: { "cache-control": "private, no-store, max-age=0", pragma: "no-cache" } });
}

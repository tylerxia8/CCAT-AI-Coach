import { NextResponse } from "next/server";
import { buildCoachingPlan } from "@/lib/coaching";
import { scoreDiagnostic, type Attempt } from "@/lib/diagnostic";
import {
  diagnosePerformance,
  inferQuestionSkill,
} from "@/lib/performance-diagnosis";
import { PRACTICE_TEST_ANSWER_KEY } from "@/lib/practice-test-bank.server";
import {
  PRACTICE_TEST_QUESTIONS,
  PRACTICE_TEST_SECONDS,
} from "@/lib/practice-test";

const ids = new Set(PRACTICE_TEST_QUESTIONS.map((question) => question.id));

export async function POST(request: Request) {
  let attempts: Attempt[];
  try {
    attempts = ((await request.json()) as { attempts: Attempt[] }).attempts;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (
    !Array.isArray(attempts) ||
    attempts.length !== PRACTICE_TEST_QUESTIONS.length ||
    new Set(attempts.map((attempt) => attempt.questionId)).size !==
      attempts.length ||
    attempts.some(
      (attempt) =>
        !ids.has(attempt.questionId) ||
        (attempt.answerIndex !== null &&
          (!Number.isInteger(attempt.answerIndex) ||
            attempt.answerIndex < 0 ||
            attempt.answerIndex > 4)) ||
        !Number.isFinite(attempt.elapsedSeconds) ||
        attempt.elapsedSeconds < 0 ||
        attempt.elapsedSeconds > PRACTICE_TEST_SECONDS,
    )
  )
    return NextResponse.json({ error: "Invalid attempts" }, { status: 400 });
  const byId = new Map(
    attempts.map((attempt) => [attempt.questionId, attempt]),
  );
  const score = scoreDiagnostic(
    PRACTICE_TEST_QUESTIONS,
    attempts,
    PRACTICE_TEST_ANSWER_KEY,
  );
  const reviews = PRACTICE_TEST_QUESTIONS.map((question) => {
    const attempt = byId.get(question.id)!;
    const answer = PRACTICE_TEST_ANSWER_KEY[question.id];
    return {
      questionId: question.id,
      category: question.category,
      prompt: question.prompt,
      selectedAnswer:
        attempt.answerIndex === null
          ? null
          : question.choices[attempt.answerIndex],
      correctAnswer: question.choices[answer.correctIndex],
      isCorrect: attempt.answerIndex === answer.correctIndex,
      pace:
        attempt.answerIndex === null
          ? ("unanswered" as const)
          : attempt.elapsedSeconds <= question.targetSeconds
            ? ("on_target" as const)
            : ("slow" as const),
      elapsedSeconds: attempt.elapsedSeconds,
      targetSeconds: question.targetSeconds,
      confidence: attempt.confidence ?? null,
      answerChanges: attempt.answerChanges ?? 0,
      firstAnswerCorrect:
        attempt.firstAnswerIndex == null
          ? null
          : attempt.firstAnswerIndex === answer.correctIndex,
      firstAnswerSeconds: attempt.firstAnswerSeconds ?? null,
      viewCount: attempt.viewCount ?? 1,
      skill: inferQuestionSkill(question),
      explanation: answer.explanation,
    };
  });
  return NextResponse.json(
    {
      ...score,
      reviews,
      coaching: buildCoachingPlan(score, reviews),
      diagnosis: diagnosePerformance(reviews),
    },
    { headers: { "cache-control": "private, no-store" } },
  );
}

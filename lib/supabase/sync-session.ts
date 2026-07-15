import type { StoredDiagnosticSession } from "@/lib/session-store";
import { DIAGNOSTIC_SECONDS, type ScoredDiagnosticResult } from "@/lib/diagnostic";
import { getQuestionVersionId } from "@/lib/question-version-ids";
import { createClient } from "./client";

export type SyncResult =
  | { status: "local" }
  | { status: "signed_out" }
  | { status: "synced" }
  | { status: "error"; message: string };

export async function syncCompletedSession(session: StoredDiagnosticSession, result: ScoredDiagnosticResult): Promise<SyncResult> {
  const supabase = createClient();
  if (!supabase) return { status: "local" };
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) return { status: "error", message: userError.message };
  if (!user) return { status: "signed_out" };

  const durationSeconds = Math.max(0, DIAGNOSTIC_SECONDS - session.remainingSeconds);
  const { error: sessionError } = await supabase.from("sessions").upsert({
    id: session.id,
    user_id: user.id,
    form_id: "20000000-0000-4000-8000-000000000001",
    mode: "diagnostic",
    status: "active",
    started_at: session.startedAt,
    completed_at: session.updatedAt,
    duration_seconds: durationSeconds,
    scoring_version: "v1",
  });
  if (sessionError) return { status: "error", message: sessionError.message };

  const synchronizedAttempts = session.attempts.flatMap((attempt) => {
    const questionVersionId = getQuestionVersionId(attempt.questionId);
    return questionVersionId ? [{
      session_id: session.id,
      question_version_id: questionVersionId,
      answer_index: attempt.answerIndex,
      elapsed_seconds: attempt.elapsedSeconds,
      confidence: attempt.confidence,
      answer_changes: attempt.answerChanges ?? 0,
      first_answer_index: attempt.firstAnswerIndex ?? null,
      first_answer_seconds: attempt.firstAnswerSeconds ?? null,
      view_count: attempt.viewCount ?? 1,
    }] : [];
  });
  if (synchronizedAttempts.length) {
    const { error: attemptError } = await supabase
      .from("attempts")
      .upsert(synchronizedAttempts, { onConflict: "session_id,question_version_id" });
    if (attemptError) return { status: "error", message: attemptError.message };
  }

  if (session.events.length) {
    const { error: eventError } = await supabase.from("telemetry_events").upsert(
      session.events.map((event) => ({
        id: event.id,
        user_id: user.id,
        session_id: session.id,
        event_name: event.name,
        event_version: 1,
        payload: { questionId: event.questionId ?? null, ...event.payload },
        occurred_at: event.occurredAt,
      })),
    );
    if (eventError) return { status: "error", message: eventError.message };
  }

  const { error: finalizeError } = await supabase.rpc("finalize_session", { target_session_id: session.id });
  if (finalizeError) return { status: "error", message: finalizeError.message };

  const { error: resultError } = await supabase.from("diagnostic_results").upsert({
    session_id: session.id,
    user_id: user.id,
    correct: result.correct,
    total: result.total,
    accuracy: result.accuracy,
    average_seconds: result.averageSeconds,
    pace_score: result.paceScore,
    confidence_score: result.confidenceScore,
    category_results: result.categoryResults,
    bottleneck: result.coaching.bottleneck,
    coaching_title: result.coaching.title,
    primary_cause: result.diagnosis.primaryCause,
    weakest_skill: result.diagnosis.weakestSkill,
    diagnosis: result.diagnosis,
    completed_at: session.updatedAt,
    updated_at: new Date().toISOString(),
  });
  if (resultError) return { status: "error", message: resultError.message };
  return { status: "synced" };
}

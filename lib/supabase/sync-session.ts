import type { StoredDiagnosticSession } from "@/lib/session-store";
import { getQuestionVersionId } from "@/lib/question-version-ids";
import { createClient } from "./client";

export type SyncResult =
  | { status: "local" }
  | { status: "signed_out" }
  | { status: "synced" }
  | { status: "error"; message: string };

export async function syncCompletedSession(session: StoredDiagnosticSession): Promise<SyncResult> {
  const supabase = createClient();
  if (!supabase) return { status: "local" };
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) return { status: "error", message: userError.message };
  if (!user) return { status: "signed_out" };

  const durationSeconds = Math.max(0, 360 - session.remainingSeconds);
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
  return { status: "synced" };
}

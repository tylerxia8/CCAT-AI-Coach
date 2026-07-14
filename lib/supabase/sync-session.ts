import { QUESTIONS, scoreDiagnostic } from "@/lib/diagnostic";
import type { StoredDiagnosticSession } from "@/lib/session-store";
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

  const result = scoreDiagnostic(QUESTIONS, session.attempts);
  const durationSeconds = Math.max(0, 360 - session.remainingSeconds);
  const { error: sessionError } = await supabase.from("sessions").upsert({
    id: session.id,
    user_id: user.id,
    mode: "diagnostic",
    status: "completed",
    started_at: session.startedAt,
    completed_at: session.updatedAt,
    duration_seconds: durationSeconds,
    raw_score: result.correct,
    total_questions: result.total,
    scoring_version: "v1",
  });
  if (sessionError) return { status: "error", message: sessionError.message };

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
  return { status: "synced" };
}

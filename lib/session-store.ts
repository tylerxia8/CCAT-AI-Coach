import type { Attempt } from "./diagnostic";
import { DIAGNOSTIC_SECONDS } from "./diagnostic";

export const SESSION_STORAGE_KEY = "aptitude-coach:diagnostic:v2";
export const LEGACY_SESSION_STORAGE_KEY = "aptitude-coach:diagnostic:v1";

export type TelemetryEventName =
  | "session_start"
  | "question_view"
  | "answer_select"
  | "confidence_select"
  | "question_submit"
  | "session_complete";

export type TelemetryEvent = {
  id: string;
  name: TelemetryEventName;
  occurredAt: string;
  questionId?: string;
  payload?: Record<string, string | number | boolean | null>;
};

export type StoredDiagnosticSession = {
  version: 2;
  id: string;
  status: "active" | "completed";
  startedAt: string;
  updatedAt: string;
  currentIndex: number;
  remainingSeconds: number;
  answers: Record<string, number>;
  confidence: Record<string, 1 | 2 | 3>;
  answerChanges: Record<string, number>;
  attempts: Attempt[];
  events: TelemetryEvent[];
};

export function createSession(now = new Date()): StoredDiagnosticSession {
  const timestamp = now.toISOString();
  return {
    version: 2,
    id: globalThis.crypto?.randomUUID?.() ?? `${now.getTime()}-${Math.random().toString(16).slice(2)}`,
    status: "active",
    startedAt: timestamp,
    updatedAt: timestamp,
    currentIndex: 0,
    remainingSeconds: DIAGNOSTIC_SECONDS,
    answers: {},
    confidence: {},
    answerChanges: {},
    attempts: [],
    events: [],
  };
}

export function appendEvent(
  session: StoredDiagnosticSession,
  name: TelemetryEventName,
  details: Pick<TelemetryEvent, "questionId" | "payload"> = {},
  now = new Date(),
): StoredDiagnosticSession {
  const occurredAt = now.toISOString();
  return {
    ...session,
    updatedAt: occurredAt,
    events: [...session.events, {
      id: globalThis.crypto?.randomUUID?.() ?? `${now.getTime()}-${session.events.length}`,
      name,
      occurredAt,
      ...details,
    }],
  };
}

export function serializeSession(session: StoredDiagnosticSession) {
  return JSON.stringify(session);
}

export function restoreRemainingSeconds(session: StoredDiagnosticSession, now = new Date()) {
  const inactiveSeconds = Math.max(0, Math.floor((now.getTime() - new Date(session.updatedAt).getTime()) / 1000));
  return Math.max(0, Math.min(DIAGNOSTIC_SECONDS, session.remainingSeconds - inactiveSeconds));
}

export function parseSession(value: string | null): StoredDiagnosticSession | null {
  if (!value) return null;
  try {
    const candidate = JSON.parse(value) as Partial<StoredDiagnosticSession>;
    if (
      candidate.version !== 2 ||
      typeof candidate.id !== "string" ||
      (candidate.status !== "active" && candidate.status !== "completed") ||
      typeof candidate.currentIndex !== "number" ||
      typeof candidate.remainingSeconds !== "number" ||
      !candidate.answers ||
      !candidate.confidence ||
      !Array.isArray(candidate.attempts) ||
      !Array.isArray(candidate.events)
    ) return null;
    return { ...candidate, answerChanges: candidate.answerChanges ?? {} } as StoredDiagnosticSession;
  } catch {
    return null;
  }
}

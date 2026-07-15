import type { PracticeFeedback } from "./practice";

export const PRACTICE_SESSION_KEY = "aptitude-coach:practice-session:v1";
export const PRACTICE_HISTORY_KEY = "aptitude-coach:practice-history:v1";

export type PracticeRecord = PracticeFeedback & { elapsedSeconds: number; targetSeconds: number };

export type StoredPracticeSession = {
  version: 1;
  id: string;
  status: "active" | "completed";
  focus: string;
  currentIndex: number;
  selected: number | null;
  feedback: PracticeFeedback | null;
  records: PracticeRecord[];
  questionStartedAt: number;
  updatedAt: string;
};

export type PracticeHistoryEntry = {
  sessionId: string;
  completedAt: string;
  focus: string;
  correct: number;
  total: number;
  onPace: number;
};

export type PracticeHistory = { version: 1; entries: PracticeHistoryEntry[] };

export function createPracticeSession(focus = "focused practice", now = new Date()): StoredPracticeSession {
  return {
    version: 1,
    id: globalThis.crypto?.randomUUID?.() ?? `${now.getTime()}-${Math.random().toString(16).slice(2)}`,
    status: "active",
    focus,
    currentIndex: 0,
    selected: null,
    feedback: null,
    records: [],
    questionStartedAt: now.getTime(),
    updatedAt: now.toISOString(),
  };
}

export function parsePracticeSession(value: string | null): StoredPracticeSession | null {
  if (!value) return null;
  try {
    const session = JSON.parse(value) as Partial<StoredPracticeSession>;
    if (session.version !== 1
      || typeof session.id !== "string"
      || (session.status !== "active" && session.status !== "completed")
      || typeof session.focus !== "string"
      || !Number.isInteger(session.currentIndex)
      || !Array.isArray(session.records)
      || typeof session.questionStartedAt !== "number") return null;
    return session as StoredPracticeSession;
  } catch { return null; }
}

export function parsePracticeHistory(value: string | null): PracticeHistory {
  if (!value) return { version: 1, entries: [] };
  try {
    const history = JSON.parse(value) as Partial<PracticeHistory>;
    if (history.version !== 1 || !Array.isArray(history.entries)) return { version: 1, entries: [] };
    return { version: 1, entries: history.entries.filter(isHistoryEntry) };
  } catch { return { version: 1, entries: [] }; }
}

export function completePracticeSession(session: StoredPracticeSession, completedAt = new Date()): { session: StoredPracticeSession; entry: PracticeHistoryEntry } {
  const finished = { ...session, status: "completed" as const, updatedAt: completedAt.toISOString() };
  return {
    session: finished,
    entry: {
      sessionId: session.id,
      completedAt: completedAt.toISOString(),
      focus: session.focus,
      correct: session.records.filter((record) => record.isCorrect).length,
      total: session.records.length,
      onPace: session.records.filter((record) => record.elapsedSeconds <= record.targetSeconds).length,
    },
  };
}

export function addPracticeHistory(history: PracticeHistory, entry: PracticeHistoryEntry): PracticeHistory {
  return {
    version: 1,
    entries: [...history.entries.filter((existing) => existing.sessionId !== entry.sessionId), entry]
      .sort((a, b) => a.completedAt.localeCompare(b.completedAt)),
  };
}

function isHistoryEntry(value: unknown): value is PracticeHistoryEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<PracticeHistoryEntry>;
  return typeof entry.sessionId === "string" && typeof entry.completedAt === "string" && typeof entry.focus === "string"
    && Number.isInteger(entry.correct) && Number.isInteger(entry.total) && Number.isInteger(entry.onPace)
    && Number(entry.correct) >= 0 && Number(entry.total) > 0 && Number(entry.correct) <= Number(entry.total)
    && Number(entry.onPace) >= 0 && Number(entry.onPace) <= Number(entry.total);
}

import type { PracticeFeedback } from "./practice";

export const PRACTICE_SESSION_KEY = "aptitude-coach:practice-session:v1";
export const PRACTICE_HISTORY_KEY = "aptitude-coach:practice-history:v1";

export type PracticeRecord = PracticeFeedback & { elapsedSeconds: number; targetSeconds: number; difficulty?: 1 | 2 | 3 | 4 | 5; skill?: string };

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
  questionIds?: string[];
  targetDifficulty?: 1 | 2 | 3 | 4 | 5;
};

export type PracticeHistoryEntry = {
  sessionId: string;
  completedAt: string;
  focus: string;
  correct: number;
  total: number;
  onPace: number;
  averageDifficulty?: number;
  questionIds?: string[];
  skillResults?: Array<{ skill: string; correct: number; total: number }>;
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
      || typeof session.questionStartedAt !== "number"
      || (session.questionIds !== undefined && (!Array.isArray(session.questionIds) || !session.questionIds.every((id) => typeof id === "string")))
      || (session.targetDifficulty !== undefined && (!Number.isInteger(session.targetDifficulty) || session.targetDifficulty < 1 || session.targetDifficulty > 5))) return null;
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
      averageDifficulty: average(session.records.flatMap((record) => record.difficulty ?? [])),
      questionIds: session.records.map((record) => record.questionId),
      skillResults: summarizeSkills(session.records),
    },
  };
}

function average(values: number[]) { return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 100) / 100 : undefined; }
function summarizeSkills(records: PracticeRecord[]) {
  const skills = new Map<string, { correct: number; total: number }>();
  for (const record of records) {
    if (!record.skill) continue;
    const current = skills.get(record.skill) ?? { correct: 0, total: 0 };
    skills.set(record.skill, { correct: current.correct + Number(record.isCorrect), total: current.total + 1 });
  }
  return [...skills.entries()].map(([skill, result]) => ({ skill, ...result }));
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
    && Number(entry.onPace) >= 0 && Number(entry.onPace) <= Number(entry.total)
    && (entry.averageDifficulty === undefined || (typeof entry.averageDifficulty === "number" && entry.averageDifficulty >= 1 && entry.averageDifficulty <= 5))
    && (entry.questionIds === undefined || (Array.isArray(entry.questionIds) && entry.questionIds.every((id) => typeof id === "string")))
    && (entry.skillResults === undefined || Array.isArray(entry.skillResults));
}

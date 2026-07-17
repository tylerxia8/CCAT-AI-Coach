export const REPAIR_QUEUE_KEY = "aptitude-coach:repair-queue:v1";

export type RepairItem = {
  key: string;
  skill: string;
  category?: string;
  dueAt: string;
  intervalDays: number;
  attempts: number;
  correctStreak: number;
  lastCorrect: boolean;
};

export type RepairQueue = { version: 1; items: RepairItem[] };
export type RepairEvidence = { key: string; skill: string; category?: string; isCorrect: boolean };

const intervals = [1, 3, 7, 14, 30];

export function parseRepairQueue(value: string | null): RepairQueue {
  if (!value) return { version: 1, items: [] };
  try {
    const parsed = JSON.parse(value) as Partial<RepairQueue>;
    if (parsed.version !== 1 || !Array.isArray(parsed.items)) return { version: 1, items: [] };
    return { version: 1, items: parsed.items.filter(isRepairItem) };
  } catch { return { version: 1, items: [] }; }
}

export function recordRepairEvidence(queue: RepairQueue, evidence: RepairEvidence, now = new Date()): RepairQueue {
  const previous = queue.items.find((item) => item.key === evidence.key);
  if (evidence.isCorrect && !previous) return queue;
  const streak = evidence.isCorrect ? (previous?.correctStreak ?? 0) + 1 : 0;
  const intervalDays = evidence.isCorrect ? intervals[Math.min(streak - 1, intervals.length - 1)] : 0;
  const due = new Date(now);
  due.setDate(due.getDate() + intervalDays);
  const item: RepairItem = {
    key: evidence.key,
    skill: evidence.skill,
    category: evidence.category ?? previous?.category,
    dueAt: due.toISOString(),
    intervalDays,
    attempts: (previous?.attempts ?? 0) + 1,
    correctStreak: streak,
    lastCorrect: evidence.isCorrect,
  };
  return { version: 1, items: [...queue.items.filter((entry) => entry.key !== evidence.key), item] };
}

export function dueRepairs(queue: RepairQueue, now = new Date()) {
  return queue.items.filter((item) => new Date(item.dueAt).getTime() <= now.getTime())
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}

export function nextRepairSkill(queue: RepairQueue, now = new Date()) {
  const due = dueRepairs(queue, now);
  if (!due.length) return null;
  const counts = new Map<string, number>();
  for (const item of due) counts.set(item.skill, (counts.get(item.skill) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function isRepairItem(value: unknown): value is RepairItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<RepairItem>;
  return typeof item.key === "string" && typeof item.skill === "string" && typeof item.dueAt === "string"
    && typeof item.intervalDays === "number" && typeof item.attempts === "number"
    && typeof item.correctStreak === "number" && typeof item.lastCorrect === "boolean";
}

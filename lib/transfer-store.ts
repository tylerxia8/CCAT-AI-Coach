export const TRANSFER_QUEUE_KEY = "aptitude-coach:transfer-queue:v1";
export type TransferItem = { skill: string; learnedAt: string; dueAt: string; completedAt?: string };

export function parseTransferQueue(value: string | null): TransferItem[] {
  if (!value) return [];
  try { const items = JSON.parse(value) as TransferItem[]; return Array.isArray(items) ? items.filter((item) => item && typeof item.skill === "string" && typeof item.dueAt === "string") : []; } catch { return []; }
}

export function scheduleTransfer(items: TransferItem[], skill: string, now = new Date()) {
  if (items.some((item) => item.skill === skill && !item.completedAt)) return items;
  const due = new Date(now); due.setDate(due.getDate() + 3);
  return [...items, { skill, learnedAt: now.toISOString(), dueAt: due.toISOString() }];
}

export function dueTransfers(items: TransferItem[], now = new Date()) { return items.filter((item) => !item.completedAt && new Date(item.dueAt) <= now); }

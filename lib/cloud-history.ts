import type { Bottleneck } from "./coaching";
import type { Category } from "./diagnostic";
import type { DiagnosticHistoryEntry } from "./history-store";

export type CloudDiagnosticRow = {
  session_id: string;
  completed_at: string;
  correct: number;
  total: number;
  accuracy: number;
  average_seconds: number;
  pace_score: number;
  confidence_score: number;
  category_results: unknown;
  bottleneck: string;
  coaching_title: string;
};

const categories = new Set<Category>(["Numerical", "Verbal", "Logic", "Spatial"]);
const bottlenecks = new Set<Bottleneck>(["pacing", "confidence", "category", "endurance", "refinement"]);

export function mapCloudHistory(rows: CloudDiagnosticRow[]): DiagnosticHistoryEntry[] {
  return rows.flatMap((row) => {
    if (!isUuid(row.session_id)
      || !Number.isInteger(row.correct)
      || !Number.isInteger(row.total)
      || row.total <= 0
      || row.correct < 0
      || row.correct > row.total
      || !isRatio(row.accuracy)
      || !isRatio(row.pace_score)
      || !isRatio(row.confidence_score)
      || !Number.isFinite(row.average_seconds)
      || row.average_seconds < 0
      || !bottlenecks.has(row.bottleneck as Bottleneck)
      || typeof row.coaching_title !== "string"
      || Number.isNaN(Date.parse(row.completed_at))) return [];
    const categoryResults = parseCategories(row.category_results);
    if (!categoryResults) return [];
    return [{
      sessionId: row.session_id,
      completedAt: row.completed_at,
      correct: row.correct,
      total: row.total,
      accuracy: row.accuracy,
      averageSeconds: row.average_seconds,
      paceScore: row.pace_score,
      confidenceScore: row.confidence_score,
      categoryResults,
      bottleneck: row.bottleneck as Bottleneck,
      coachingTitle: row.coaching_title,
    }];
  });
}

function parseCategories(value: unknown): DiagnosticHistoryEntry["categoryResults"] | null {
  if (!Array.isArray(value)) return null;
  const parsed = value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as { category?: unknown; correct?: unknown; total?: unknown };
    if (typeof candidate.category !== "string"
      || !categories.has(candidate.category as Category)
      || !Number.isInteger(candidate.correct)
      || !Number.isInteger(candidate.total)
      || Number(candidate.total) < 0
      || Number(candidate.correct) < 0
      || Number(candidate.correct) > Number(candidate.total)) return [];
    return [{ category: candidate.category as Category, correct: Number(candidate.correct), total: Number(candidate.total) }];
  });
  return parsed.length === value.length ? parsed : null;
}

function isRatio(value: number) { return Number.isFinite(value) && value >= 0 && value <= 1; }
function isUuid(value: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }

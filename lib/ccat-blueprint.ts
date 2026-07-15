import type { Category, Question } from "./diagnostic";
import { inferQuestionSkill } from "./performance-diagnosis";

export type CcatDomain = "Verbal" | "Math & Logic" | "Spatial";

export const CCAT_FORM_BLUEPRINT: Record<CcatDomain, number> = {
  Verbal: 15,
  "Math & Logic": 25,
  Spatial: 10,
};

export const DIFFICULTY_BLUEPRINT = { 1: 8, 2: 28, 3: 14 } as const;

export const REQUIRED_ITEM_FAMILIES = [
  "number sequences", "percentages", "averages", "fractions and proportions", "basic algebra", "rates and arithmetic",
  "antonyms", "word classification", "verbal analogies", "vocabulary",
  "syllogisms", "ordering logic", "deductive reasoning",
  "figure matrices", "figure classification", "mental rotation", "visual sequences",
] as const;

export function ccatDomainFor(category: Category): CcatDomain {
  if (category === "Verbal") return "Verbal";
  if (category === "Spatial") return "Spatial";
  return "Math & Logic";
}

export function validateCcatForm(questions: Question[]) {
  const errors: string[] = [];
  if (questions.length !== 50) errors.push(`Expected 50 questions; received ${questions.length}.`);
  const counts = new Map<CcatDomain, number>();
  const familyCounts = new Map<string, number>();
  const difficultyCounts = new Map<number, number>();
  for (const question of questions) {
    const domain = ccatDomainFor(question.category);
    counts.set(domain, (counts.get(domain) ?? 0) + 1);
    const family = inferQuestionSkill(question);
    familyCounts.set(family, (familyCounts.get(family) ?? 0) + 1);
    difficultyCounts.set(question.difficulty, (difficultyCounts.get(question.difficulty) ?? 0) + 1);
    if (!(REQUIRED_ITEM_FAMILIES as readonly string[]).includes(family)) errors.push(`${question.id} uses unsupported item family ${family}.`);
    if (question.choices.length !== 5) errors.push(`${question.id} must have exactly five choices.`);
    if (question.targetSeconds !== 18) errors.push(`${question.id} must use the 18-second form pace.`);
  }
  for (const [difficulty, expected] of Object.entries(DIFFICULTY_BLUEPRINT)) {
    const actual = difficultyCounts.get(Number(difficulty)) ?? 0;
    if (actual !== expected) errors.push(`Difficulty ${difficulty} requires ${expected} items; received ${actual}.`);
  }
  for (const family of REQUIRED_ITEM_FAMILIES) {
    if (!familyCounts.get(family)) errors.push(`Form is missing required item family ${family}.`);
  }
  for (const [domain, expected] of Object.entries(CCAT_FORM_BLUEPRINT) as Array<[CcatDomain, number]>) {
    if ((counts.get(domain) ?? 0) !== expected) errors.push(`${domain} requires ${expected} items; received ${counts.get(domain) ?? 0}.`);
  }
  return errors;
}

import type { Category } from "./diagnostic";
import type { PracticeQuestion } from "./practice";

export type PracticeTopic = {
  skill: string;
  category: Category;
  count: number;
};

const CATEGORY_ORDER: Category[] = ["Verbal", "Numerical", "Logic", "Spatial"];

export function practiceTopicCatalog(questions: PracticeQuestion[]): PracticeTopic[] {
  const topics = new Map<string, PracticeTopic>();
  for (const question of questions) {
    const existing = topics.get(question.skill);
    if (existing) existing.count += 1;
    else topics.set(question.skill, { skill: question.skill, category: question.category, count: 1 });
  }
  return [...topics.values()].sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.skill.localeCompare(b.skill));
}

export function isSelectablePracticeTopic(questions: PracticeQuestion[], skill: string | null) {
  return Boolean(skill && questions.some((question) => question.skill === skill));
}

export function topicQuestionPool(questions: PracticeQuestion[], skill: string | null, topicMode: boolean) {
  if (!topicMode || !isSelectablePracticeTopic(questions, skill)) return questions;
  return questions.filter((question) => question.skill === skill);
}

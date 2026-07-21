import type { PracticeQuestion } from "./practice";

export const PRACTICE_TOPICS = [
  {
    skill: "verbal analogies",
    group: "Reading and vocabulary",
    title: "Verbal analogies",
    description: "Identify the relationship between one word pair and transfer it to another.",
  },
  {
    skill: "number sequences",
    group: "Pattern-related questions",
    title: "Number sequences",
    description: "Recognize arithmetic, alternating, and multi-step number patterns.",
  },
  {
    skill: "antonyms",
    group: "Reading and vocabulary",
    title: "Antonyms",
    description: "Choose the word with the most nearly opposite meaning.",
  },
] as const;

export function isSelectablePracticeTopic(skill: string | null) {
  return PRACTICE_TOPICS.some((topic) => topic.skill === skill);
}

export function topicQuestionPool(questions: PracticeQuestion[], skill: string | null, topicMode: boolean) {
  if (!topicMode || !isSelectablePracticeTopic(skill)) return questions;
  return questions.filter((question) => question.skill === skill);
}

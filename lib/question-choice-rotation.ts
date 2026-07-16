import type { PracticeQuestion } from "./practice";

export function rotateQuestionChoices(question: PracticeQuestion): PracticeQuestion {
  const shift = choiceRotation(question.id);
  return { ...question, choices: [...question.choices.slice(-shift), ...question.choices.slice(0, -shift)] };
}

export function rotatedCorrectIndex(id: string, originalIndex: number) {
  return (originalIndex + choiceRotation(id)) % 5;
}

function choiceRotation(id: string) {
  const suffix = Number(id.match(/(\d+)$/)?.[1] ?? 0);
  return suffix % 5;
}

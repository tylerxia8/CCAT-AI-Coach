import type { AnswerKey, Question } from "./diagnostic";

export type QuestionBankIssue = { questionId: string; code: string; message: string };

export function validateQuestionBank(questions: Question[], answerKey: AnswerKey): QuestionBankIssue[] {
  const issues: QuestionBankIssue[] = [];
  const ids = new Set<string>();
  const prompts = new Map<string, string>();

  for (const question of questions) {
    if (ids.has(question.id)) issues.push(issue(question.id, "duplicate_id", "Question ID is duplicated."));
    ids.add(question.id);
    const normalizedPrompt = normalize(question.prompt);
    const priorPrompt = prompts.get(normalizedPrompt);
    if (priorPrompt) issues.push(issue(question.id, "duplicate_prompt", `Prompt duplicates ${priorPrompt}.`));
    prompts.set(normalizedPrompt, question.id);
    if (question.choices.length !== 5) issues.push(issue(question.id, "choice_count", "Question must have five choices."));
    if (new Set(question.choices.map(normalize)).size !== question.choices.length) issues.push(issue(question.id, "duplicate_choice", "Choices must be unique."));
    if (question.choices.some((choice) => !choice.trim())) issues.push(issue(question.id, "blank_choice", "Choices cannot be blank."));
    if (question.prompt.includes("___") && question.itemFamily !== "sentence completion") issues.push(issue(question.id, "missing_family", "Blank prompts must be tagged sentence completion."));

    const answer = answerKey[question.id];
    if (!answer) {
      issues.push(issue(question.id, "missing_answer", "Answer key entry is missing."));
    } else {
      if (!Number.isInteger(answer.correctIndex) || answer.correctIndex < 0 || answer.correctIndex >= question.choices.length) issues.push(issue(question.id, "answer_range", "Correct answer index is outside the choices."));
      if (answer.explanation.trim().length < 20) issues.push(issue(question.id, "weak_explanation", "Explanation is too short to teach or audit."));
    }
  }

  for (const id of Object.keys(answerKey)) if (!ids.has(id)) issues.push(issue(id, "orphan_answer", "Answer key has no matching public question."));
  return issues;
}

function normalize(value: string) { return value.trim().toLowerCase().replace(/\s+/g, " "); }
function issue(questionId: string, code: string, message: string): QuestionBankIssue { return { questionId, code, message }; }

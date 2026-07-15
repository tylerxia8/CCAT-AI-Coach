export type Category = "Numerical" | "Verbal" | "Logic" | "Spatial";

export type Question = {
  id: string;
  category: Category;
  prompt: string;
  choices: string[];
  difficulty: 1 | 2 | 3;
  targetSeconds: number;
};

export type AnswerKey = Record<string, { correctIndex: number; explanation: string }>;

export type Attempt = {
  questionId: string;
  answerIndex: number | null;
  elapsedSeconds: number;
  confidence: 1 | 2 | 3 | null;
};

export type DiagnosticResult = {
  correct: number;
  total: number;
  accuracy: number;
  averageSeconds: number;
  paceScore: number;
  confidenceScore: number;
  categoryResults: Array<{ category: Category; correct: number; total: number }>;
  priority: string;
};

export type QuestionReview = {
  questionId: string;
  category: Category;
  prompt: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  pace: "on_target" | "slow" | "unanswered";
  elapsedSeconds: number;
  targetSeconds: number;
  confidence: 1 | 2 | 3 | null;
  explanation: string;
};

export type ScoredDiagnosticResult = DiagnosticResult & {
  reviews: QuestionReview[];
  coaching: import("./coaching").CoachingPlan;
};

export const QUESTIONS: Question[] = [
  {
    id: "num-01",
    category: "Numerical",
    prompt: "A team completes 3 reports every 8 hours. At the same rate, how many reports will it complete in 40 hours?",
    choices: ["10", "12", "15", "18", "24"],
    difficulty: 1,
    targetSeconds: 36,
  },
  {
    id: "ver-01",
    category: "Verbal",
    prompt: "FRAIL is to STURDY as SCARCE is to:",
    choices: ["Rare", "Plentiful", "Costly", "Hidden", "Fragile"],
    difficulty: 1,
    targetSeconds: 24,
  },
  {
    id: "log-01",
    category: "Logic",
    prompt: "All Kems are Rals. No Rals are Tovs. Which statement must be true?",
    choices: ["No Kems are Tovs", "Some Kems are Tovs", "All Tovs are Kems", "No Kems are Rals", "Some Rals are not Kems"],
    difficulty: 2,
    targetSeconds: 38,
  },
  {
    id: "num-02",
    category: "Numerical",
    prompt: "What number comes next? 4, 7, 13, 25, 49, ?",
    choices: ["73", "81", "89", "97", "101"],
    difficulty: 2,
    targetSeconds: 34,
  },
  {
    id: "spa-01",
    category: "Spatial",
    prompt: "An arrow points north. It rotates 90° clockwise, then 180° counterclockwise. Which direction does it point?",
    choices: ["North", "Northeast", "East", "South", "West"],
    difficulty: 1,
    targetSeconds: 26,
  },
  {
    id: "ver-02",
    category: "Verbal",
    prompt: "Choose the word that does not belong with the others.",
    choices: ["Conclude", "Infer", "Deduce", "Observe", "Reason"],
    difficulty: 2,
    targetSeconds: 28,
  },
  {
    id: "log-02",
    category: "Logic",
    prompt: "If the first two statements are true, is the final statement true? Liam is older than Noor. Noor is older than Priya. Priya is older than Liam.",
    choices: ["True", "False", "Uncertain", "Only sometimes", "Not enough information"],
    difficulty: 1,
    targetSeconds: 25,
  },
  {
    id: "num-03",
    category: "Numerical",
    prompt: "A jacket priced at $80 is discounted by 25%, then the sale price is increased by 10%. What is the final price?",
    choices: ["$60", "$64", "$66", "$68", "$70"],
    difficulty: 3,
    targetSeconds: 42,
  },
];

export function scoreDiagnostic(questions: Question[], attempts: Attempt[], answerKey: AnswerKey): DiagnosticResult {
  const attemptById = new Map(attempts.map((attempt) => [attempt.questionId, attempt]));
  let correct = 0;
  let totalSeconds = 0;
  let paceHits = 0;
  let calibrated = 0;
  let confidenceCount = 0;

  const categories: Category[] = ["Numerical", "Verbal", "Logic", "Spatial"];
  const categoryResults = categories.map((category) => {
    const categoryQuestions = questions.filter((question) => question.category === category);
    const categoryCorrect = categoryQuestions.filter((question) => attemptById.get(question.id)?.answerIndex === answerKey[question.id]?.correctIndex).length;
    return { category, correct: categoryCorrect, total: categoryQuestions.length };
  });

  for (const question of questions) {
    const attempt = attemptById.get(question.id);
    const isCorrect = attempt?.answerIndex === answerKey[question.id]?.correctIndex;
    if (isCorrect) correct += 1;
    totalSeconds += attempt?.elapsedSeconds ?? 0;
    if ((attempt?.elapsedSeconds ?? Infinity) <= question.targetSeconds) paceHits += 1;
    if (attempt?.confidence) {
      confidenceCount += 1;
      if ((attempt.confidence === 3 && isCorrect) || (attempt.confidence === 1 && !isCorrect) || attempt.confidence === 2) calibrated += 1;
    }
  }

  const weakest = categoryResults
    .filter((item) => item.total > 0)
    .sort((a, b) => a.correct / a.total - b.correct / b.total)[0];
  const accuracy = questions.length ? correct / questions.length : 0;
  const paceScore = questions.length ? paceHits / questions.length : 0;
  const priority = paceScore < 0.6
    ? "Build a faster decision rhythm"
    : weakest && weakest.correct / weakest.total < 0.7
      ? `Strengthen ${weakest.category.toLowerCase()} reasoning`
      : "Practice under sustained time pressure";

  return {
    correct,
    total: questions.length,
    accuracy,
    averageSeconds: questions.length ? Math.round(totalSeconds / questions.length) : 0,
    paceScore,
    confidenceScore: confidenceCount ? calibrated / confidenceCount : 0,
    categoryResults,
    priority,
  };
}

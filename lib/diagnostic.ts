export type Category = "Numerical" | "Verbal" | "Logic" | "Spatial";

export type Question = {
  id: string;
  category: Category;
  prompt: string;
  choices: string[];
  correctIndex: number;
  difficulty: 1 | 2 | 3;
  targetSeconds: number;
  explanation: string;
};

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

export const QUESTIONS: Question[] = [
  {
    id: "num-01",
    category: "Numerical",
    prompt: "A team completes 3 reports every 8 hours. At the same rate, how many reports will it complete in 40 hours?",
    choices: ["10", "12", "15", "18", "24"],
    correctIndex: 2,
    difficulty: 1,
    targetSeconds: 36,
    explanation: "Forty hours contains five 8-hour blocks. Five blocks multiplied by 3 reports equals 15.",
  },
  {
    id: "ver-01",
    category: "Verbal",
    prompt: "FRAIL is to STURDY as SCARCE is to:",
    choices: ["Rare", "Plentiful", "Costly", "Hidden", "Fragile"],
    correctIndex: 1,
    difficulty: 1,
    targetSeconds: 24,
    explanation: "Frail and sturdy are opposites. Scarce and plentiful have the same opposite relationship.",
  },
  {
    id: "log-01",
    category: "Logic",
    prompt: "All Kems are Rals. No Rals are Tovs. Which statement must be true?",
    choices: ["No Kems are Tovs", "Some Kems are Tovs", "All Tovs are Kems", "No Kems are Rals", "Some Rals are not Kems"],
    correctIndex: 0,
    difficulty: 2,
    targetSeconds: 38,
    explanation: "Because every Kem is a Ral and no Ral can be a Tov, no Kem can be a Tov.",
  },
  {
    id: "num-02",
    category: "Numerical",
    prompt: "What number comes next? 4, 7, 13, 25, 49, ?",
    choices: ["73", "81", "89", "97", "101"],
    correctIndex: 3,
    difficulty: 2,
    targetSeconds: 34,
    explanation: "Each number is the previous number doubled minus 1. Therefore, 49 × 2 − 1 = 97.",
  },
  {
    id: "spa-01",
    category: "Spatial",
    prompt: "An arrow points north. It rotates 90° clockwise, then 180° counterclockwise. Which direction does it point?",
    choices: ["North", "Northeast", "East", "South", "West"],
    correctIndex: 4,
    difficulty: 1,
    targetSeconds: 26,
    explanation: "North rotated clockwise 90° becomes east. East rotated counterclockwise 180° becomes west.",
  },
  {
    id: "ver-02",
    category: "Verbal",
    prompt: "Choose the word that does not belong with the others.",
    choices: ["Conclude", "Infer", "Deduce", "Observe", "Reason"],
    correctIndex: 3,
    difficulty: 2,
    targetSeconds: 28,
    explanation: "Conclude, infer, deduce, and reason involve deriving a judgment. Observe means to notice directly.",
  },
  {
    id: "log-02",
    category: "Logic",
    prompt: "If the first two statements are true, is the final statement true? Liam is older than Noor. Noor is older than Priya. Priya is older than Liam.",
    choices: ["True", "False", "Uncertain", "Only sometimes", "Not enough information"],
    correctIndex: 1,
    difficulty: 1,
    targetSeconds: 25,
    explanation: "The first two statements establish Liam > Noor > Priya, so Priya cannot be older than Liam.",
  },
  {
    id: "num-03",
    category: "Numerical",
    prompt: "A jacket priced at $80 is discounted by 25%, then the sale price is increased by 10%. What is the final price?",
    choices: ["$60", "$64", "$66", "$68", "$70"],
    correctIndex: 2,
    difficulty: 3,
    targetSeconds: 42,
    explanation: "The discounted price is $60. Increasing $60 by 10% adds $6, producing a final price of $66.",
  },
];

export function scoreDiagnostic(questions: Question[], attempts: Attempt[]): DiagnosticResult {
  const attemptById = new Map(attempts.map((attempt) => [attempt.questionId, attempt]));
  let correct = 0;
  let totalSeconds = 0;
  let paceHits = 0;
  let calibrated = 0;
  let confidenceCount = 0;

  const categories: Category[] = ["Numerical", "Verbal", "Logic", "Spatial"];
  const categoryResults = categories.map((category) => {
    const categoryQuestions = questions.filter((question) => question.category === category);
    const categoryCorrect = categoryQuestions.filter((question) => attemptById.get(question.id)?.answerIndex === question.correctIndex).length;
    return { category, correct: categoryCorrect, total: categoryQuestions.length };
  });

  for (const question of questions) {
    const attempt = attemptById.get(question.id);
    const isCorrect = attempt?.answerIndex === question.correctIndex;
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

export type Category = "Numerical" | "Verbal" | "Logic" | "Spatial";

export const DIAGNOSTIC_SECONDS = 15 * 60;

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
  answerChanges?: number;
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
  answerChanges: number;
  skill: string;
  explanation: string;
};

export type ScoredDiagnosticResult = DiagnosticResult & {
  reviews: QuestionReview[];
  coaching: import("./coaching").CoachingPlan;
  diagnosis: import("./performance-diagnosis").PerformanceDiagnosis;
};

export const QUESTIONS: Question[] = [
  {
    id: "num-01",
    category: "Numerical",
    prompt: "A team completes 3 reports every 8 hours. At the same rate, how many reports will it complete in 40 hours?",
    choices: ["10", "12", "15", "18", "24"],
    difficulty: 1,
    targetSeconds: 18,
  },
  {
    id: "ver-01",
    category: "Verbal",
    prompt: "FRAIL is to STURDY as SCARCE is to:",
    choices: ["Rare", "Plentiful", "Costly", "Hidden", "Fragile"],
    difficulty: 1,
    targetSeconds: 18,
  },
  {
    id: "log-01",
    category: "Logic",
    prompt: "All Kems are Rals. No Rals are Tovs. Which statement must be true?",
    choices: ["No Kems are Tovs", "Some Kems are Tovs", "All Tovs are Kems", "No Kems are Rals", "Some Rals are not Kems"],
    difficulty: 2,
    targetSeconds: 18,
  },
  {
    id: "num-02",
    category: "Numerical",
    prompt: "What number comes next? 4, 7, 13, 25, 49, ?",
    choices: ["73", "81", "89", "97", "101"],
    difficulty: 2,
    targetSeconds: 18,
  },
  {
    id: "spa-01",
    category: "Spatial",
    prompt: "Which symbol completes the rotation sequence? ▲  ▶  ▼  ?",
    choices: ["▲", "◀", "▶", "▼", "◆"],
    difficulty: 1,
    targetSeconds: 18,
  },
  {
    id: "ver-02",
    category: "Verbal",
    prompt: "Choose the word that does not belong with the others.",
    choices: ["Conclude", "Infer", "Deduce", "Observe", "Reason"],
    difficulty: 2,
    targetSeconds: 18,
  },
  {
    id: "log-02",
    category: "Logic",
    prompt: "If the first two statements are true, is the final statement true? Liam is older than Noor. Noor is older than Priya. Priya is older than Liam.",
    choices: ["True", "False", "Uncertain", "Only sometimes", "Not enough information"],
    difficulty: 1,
    targetSeconds: 18,
  },
  {
    id: "num-03",
    category: "Numerical",
    prompt: "A jacket priced at $80 is discounted by 25%, then the sale price is increased by 10%. What is the final price?",
    choices: ["$60", "$64", "$66", "$68", "$70"],
    difficulty: 3,
    targetSeconds: 18,
  },
  { id: "ver-03", category: "Verbal", prompt: "BENEVOLENT most nearly means:", choices: ["Kind", "Cautious", "Forceful", "Wealthy", "Uncertain"], difficulty: 1, targetSeconds: 18 },
  { id: "num-04", category: "Numerical", prompt: "What is 35% of 240?", choices: ["72", "78", "84", "88", "96"], difficulty: 1, targetSeconds: 18 },
  { id: "spa-02", category: "Spatial", prompt: "Which figure is different from the other four?", choices: ["▲●", "▶●", "▼●", "◀●", "◆●"], difficulty: 1, targetSeconds: 18 },
  { id: "ver-04", category: "Verbal", prompt: "BIRD is to FLOCK as FISH is to:", choices: ["Nest", "School", "Herd", "Pack", "Swarm"], difficulty: 1, targetSeconds: 18 },
  { id: "num-05", category: "Numerical", prompt: "Which fraction is largest?", choices: ["3/5", "5/8", "7/12", "2/3", "9/16"], difficulty: 2, targetSeconds: 18 },
  { id: "log-03", category: "Logic", prompt: "Some Vens are Lops. All Lops are Mirs. Which statement must be true?", choices: ["All Vens are Mirs", "Some Vens are Mirs", "No Vens are Mirs", "All Mirs are Vens", "Some Mirs are not Lops"], difficulty: 2, targetSeconds: 18 },
  { id: "ver-05", category: "Verbal", prompt: "Choose the word most nearly opposite to EXPAND.", choices: ["Extend", "Contract", "Explain", "Increase", "Explore"], difficulty: 1, targetSeconds: 18 },
  { id: "num-06", category: "Numerical", prompt: "What number comes next? 2, 6, 12, 20, 30, ?", choices: ["36", "40", "42", "44", "48"], difficulty: 2, targetSeconds: 18 },
  { id: "spa-03", category: "Spatial", prompt: "Complete the 2×2 pattern: top row ○, ●; bottom row □, ?", choices: ["○", "●", "□", "■", "△"], difficulty: 1, targetSeconds: 18 },
  { id: "ver-06", category: "Verbal", prompt: "DOCTOR is to HOSPITAL as TEACHER is to:", choices: ["Book", "Student", "School", "Lesson", "Office"], difficulty: 1, targetSeconds: 18 },
  { id: "num-07", category: "Numerical", prompt: "A car travels 150 miles in 3 hours. At the same rate, how far does it travel in 5 hours?", choices: ["200", "225", "250", "275", "300"], difficulty: 1, targetSeconds: 18 },
  { id: "log-04", category: "Logic", prompt: "Ana finishes before Bo. Cal finishes after Bo. Who must finish first?", choices: ["Ana", "Bo", "Cal", "Ana or Cal", "Cannot tell"], difficulty: 1, targetSeconds: 18 },
  { id: "ver-07", category: "Verbal", prompt: "METICULOUS most nearly means:", choices: ["Careless", "Thorough", "Rapid", "Friendly", "Ordinary"], difficulty: 2, targetSeconds: 18 },
  { id: "num-08", category: "Numerical", prompt: "If x + 7 = 19, what is 3x?", choices: ["24", "30", "33", "36", "42"], difficulty: 1, targetSeconds: 18 },
  { id: "spa-04", category: "Spatial", prompt: "Which symbol completes the sequence? ◐  ◓  ◑  ?", choices: ["◐", "◒", "◓", "◑", "●"], difficulty: 2, targetSeconds: 18 },
  { id: "ver-08", category: "Verbal", prompt: "Which word does not belong?", choices: ["Copper", "Iron", "Silver", "Glass", "Gold"], difficulty: 1, targetSeconds: 18 },
  { id: "num-09", category: "Numerical", prompt: "A $60 item is marked down by 15%. What is the sale price?", choices: ["$45", "$48", "$49", "$51", "$54"], difficulty: 2, targetSeconds: 18 },
  { id: "log-05", category: "Logic", prompt: "All Ruds are Pims. Some Ruds are Naks. Which conclusion is certain?", choices: ["Some Pims are Naks", "All Pims are Naks", "No Pims are Naks", "All Naks are Ruds", "Some Naks are not Ruds"], difficulty: 2, targetSeconds: 18 },
  { id: "ver-09", category: "Verbal", prompt: "TEMPORARY is to PERMANENT as SHALLOW is to:", choices: ["Narrow", "Deep", "Brief", "Broad", "Low"], difficulty: 1, targetSeconds: 18 },
  { id: "num-10", category: "Numerical", prompt: "What is the average of 12, 18, 20, and 30?", choices: ["18", "19", "20", "21", "22"], difficulty: 1, targetSeconds: 18 },
  { id: "spa-05", category: "Spatial", prompt: "Which figure continues the alternating pattern? △  ■  ▽  □  △  ?", choices: ["■", "□", "▽", "▲", "○"], difficulty: 2, targetSeconds: 18 },
  { id: "ver-10", category: "Verbal", prompt: "FRUGAL most nearly means:", choices: ["Wasteful", "Economical", "Generous", "Unusual", "Hungry"], difficulty: 2, targetSeconds: 18 },
  { id: "num-11", category: "Numerical", prompt: "What number comes next? 81, 27, 9, 3, ?", choices: ["0", "1", "1.5", "2", "6"], difficulty: 1, targetSeconds: 18 },
  { id: "log-06", category: "Logic", prompt: "No Zets are Fars. Every Kim is a Zet. Which statement is true?", choices: ["Some Kims are Fars", "No Kims are Fars", "All Fars are Kims", "No Kims are Zets", "Some Zets are Kims"], difficulty: 2, targetSeconds: 18 },
  { id: "ver-11", category: "Verbal", prompt: "SEED is to PLANT as EGG is to:", choices: ["Nest", "Bird", "Shell", "Feather", "Wing"], difficulty: 1, targetSeconds: 18 },
  { id: "num-12", category: "Numerical", prompt: "If 4 notebooks cost $10, how much do 10 notebooks cost at the same rate?", choices: ["$20", "$22", "$25", "$28", "$30"], difficulty: 1, targetSeconds: 18 },
  { id: "spa-06", category: "Spatial", prompt: "Complete the matrix: first row ▲, ▲▲, ▲▲▲; second row ●, ●●, ?", choices: ["●", "●●", "●●●", "▲▲▲", "○○○"], difficulty: 1, targetSeconds: 18 },
  { id: "ver-12", category: "Verbal", prompt: "Choose the word most nearly opposite to OBSCURE.", choices: ["Hidden", "Faint", "Clear", "Complex", "Remote"], difficulty: 2, targetSeconds: 18 },
  { id: "num-13", category: "Numerical", prompt: "A box contains 3 red, 5 blue, and 2 green balls. What fraction are blue?", choices: ["1/5", "1/3", "2/5", "1/2", "3/5"], difficulty: 2, targetSeconds: 18 },
  { id: "log-07", category: "Logic", prompt: "Dara is taller than Eli. Finn is shorter than Eli. Who is tallest?", choices: ["Dara", "Eli", "Finn", "Dara or Finn", "Cannot tell"], difficulty: 1, targetSeconds: 18 },
  { id: "ver-13", category: "Spatial", prompt: "Which figure is not a rotation of the same arrangement?", choices: ["▲○", "▶○", "▼○", "◀○", "▲●"], difficulty: 2, targetSeconds: 18 },
  { id: "num-14", category: "Numerical", prompt: "What is 7 squared minus 5 squared?", choices: ["12", "20", "24", "28", "32"], difficulty: 2, targetSeconds: 18 },
  { id: "log-08", category: "Spatial", prompt: "Complete the pattern: ○□, □△, △◇, ?", choices: ["◇○", "○◇", "◇△", "□○", "△□"], difficulty: 2, targetSeconds: 18 },
  { id: "ver-14", category: "Verbal", prompt: "RELUCTANT most nearly means:", choices: ["Unwilling", "Excited", "Prepared", "Certain", "Careless"], difficulty: 1, targetSeconds: 18 },
  { id: "num-15", category: "Spatial", prompt: "Which figure completes the size sequence? ●  ◉  ○  ●  ◉  ?", choices: ["●", "◉", "○", "◎", "■"], difficulty: 2, targetSeconds: 18 },
  { id: "log-09", category: "Logic", prompt: "All Dels are Wiks. Some Wiks are Bors. What can be concluded about Dels and Bors?", choices: ["All Dels are Bors", "Some Dels are Bors", "No Dels are Bors", "Nothing definite", "All Bors are Dels"], difficulty: 2, targetSeconds: 18 },
  { id: "ver-15", category: "Verbal", prompt: "PAINTER is to BRUSH as WRITER is to:", choices: ["Paper", "Book", "Pen", "Reader", "Story"], difficulty: 1, targetSeconds: 18 },
  { id: "num-16", category: "Numerical", prompt: "What number comes next? 5, 10, 8, 16, 14, ?", choices: ["18", "24", "26", "28", "30"], difficulty: 2, targetSeconds: 18 },
  { id: "log-10", category: "Logic", prompt: "Four tasks are ordered J, K, L, M. K must follow J, and M must precede L. Which order is possible?", choices: ["K J M L", "J K L M", "M J K L", "L M J K", "J L M K"], difficulty: 3, targetSeconds: 18 },
  { id: "ver-16", category: "Verbal", prompt: "Choose the word most nearly opposite to VIGOROUS.", choices: ["Active", "Strong", "Frail", "Rapid", "Bold"], difficulty: 1, targetSeconds: 18 },
  { id: "num-17", category: "Spatial", prompt: "Which symbol completes the sequence? ↖  ↗  ↘  ?", choices: ["↖", "↗", "↘", "↙", "↑"], difficulty: 1, targetSeconds: 18 },
  { id: "num-18", category: "Numerical", prompt: "If 3y - 4 = 17, what is y?", choices: ["5", "6", "7", "8", "9"], difficulty: 2, targetSeconds: 18 },
];

export function normalizeCompletedAttempts(questions: Question[], attempts: Attempt[]): Attempt[] {
  const attemptById = new Map(attempts.map((attempt) => [attempt.questionId, attempt]));
  return questions.map((question) => attemptById.get(question.id) ?? {
    questionId: question.id,
    answerIndex: null,
    elapsedSeconds: 0,
    confidence: null,
    answerChanges: 0,
  });
}

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

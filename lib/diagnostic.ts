export type Category = "Numerical" | "Verbal" | "Logic" | "Spatial";

export const DIAGNOSTIC_SECONDS = 15 * 60;

export type Question = {
  id: string;
  category: Category;
  prompt: string;
  choices: string[];
  difficulty: 1 | 2 | 3;
  targetSeconds: number;
  stimulus?: DataStimulus;
  itemFamily?: string;
};

export type DataStimulus =
  | { kind: "bar" | "line"; title: string; labels: string[]; values: number[]; unit?: string }
  | { kind: "table"; title: string; columns: string[]; rows: Array<{ label: string; values: number[] }> };

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
  { id: "ver-03", category: "Verbal", prompt: "EQUIVOCAL most nearly means:", choices: ["Ambiguous", "Hostile", "Generous", "Certain", "Brief"], difficulty: 3, targetSeconds: 18 },
  { id: "num-04", category: "Numerical", prompt: "Six printers produce 840 pages in 14 minutes. At the same rate, how many pages do four printers produce in 10 minutes?", choices: ["360", "400", "420", "480", "560"], difficulty: 3, targetSeconds: 18 },
  { id: "spa-02", category: "Spatial", prompt: "Which figure is different from the other four?", choices: ["▲●", "▶●", "▼●", "◀●", "◆●"], difficulty: 1, targetSeconds: 18 },
  { id: "ver-04", category: "Verbal", prompt: "EPHEMERAL is to DURATION as FRAGILE is to:", choices: ["Weight", "Durability", "Clarity", "Rarity", "Shape"], difficulty: 3, targetSeconds: 18 },
  { id: "num-05", category: "Numerical", prompt: "Which fraction is largest?", choices: ["3/5", "5/8", "7/12", "2/3", "9/16"], difficulty: 2, targetSeconds: 18 },
  { id: "log-03", category: "Logic", prompt: "Some Vens are Lops. All Lops are Mirs. Which statement must be true?", choices: ["All Vens are Mirs", "Some Vens are Mirs", "No Vens are Mirs", "All Mirs are Vens", "Some Mirs are not Lops"], difficulty: 2, targetSeconds: 18 },
  { id: "ver-05", category: "Verbal", prompt: "Choose the word most nearly opposite to MITIGATE.", choices: ["Postpone", "Aggravate", "Measure", "Conceal", "Permit"], difficulty: 3, targetSeconds: 18 },
  { id: "num-06", category: "Numerical", prompt: "What number comes next? 2, 6, 12, 20, 30, ?", choices: ["36", "40", "42", "44", "48"], difficulty: 2, targetSeconds: 18 },
  { id: "spa-03", category: "Spatial", prompt: "Complete the matrix: top row ○, ●, ○●; bottom row □, ■, ?", choices: ["□", "■", "□■", "○●", "■■"], difficulty: 3, targetSeconds: 18 },
  { id: "ver-06", category: "Verbal", prompt: "CONDUCTOR is to ORCHESTRA as DIRECTOR is to:", choices: ["Script", "Audience", "Cast", "Stage", "Camera"], difficulty: 2, targetSeconds: 18 },
  { id: "num-07", category: "Numerical", prompt: "Four pumps fill 3 tanks in 6 hours. At the same rate, how many tanks can 8 pumps fill in 9 hours?", choices: ["6", "8", "9", "10", "12"], difficulty: 3, targetSeconds: 18 },
  { id: "log-04", category: "Logic", prompt: "Rina arrives before Sol but after Tarek. Uma arrives after Sol. Which order must be true?", choices: ["Tarek, Rina, Sol, Uma", "Rina, Tarek, Uma, Sol", "Tarek, Sol, Rina, Uma", "Uma, Sol, Rina, Tarek", "Sol, Tarek, Rina, Uma"], difficulty: 2, targetSeconds: 18 },
  { id: "ver-07", category: "Verbal", prompt: "METICULOUS most nearly means:", choices: ["Careless", "Thorough", "Rapid", "Friendly", "Ordinary"], difficulty: 2, targetSeconds: 18 },
  { id: "num-08", category: "Numerical", prompt: "If 2(x - 3) = 3x - 11, what is 4x?", choices: ["12", "16", "20", "24", "28"], difficulty: 3, targetSeconds: 18 },
  { id: "spa-04", category: "Spatial", prompt: "Which symbol completes the sequence? ◐  ◓  ◑  ?", choices: ["◐", "◒", "◓", "◑", "●"], difficulty: 2, targetSeconds: 18 },
  { id: "ver-08", category: "Verbal", prompt: "Which word does not belong?", choices: ["Taciturn", "Reticent", "Reserved", "Garrulous", "Uncommunicative"], difficulty: 3, targetSeconds: 18 },
  { id: "num-09", category: "Numerical", prompt: "By what percentage did output increase from Q1 to Q4?", choices: ["25%", "33%", "40%", "50%", "60%"], difficulty: 2, targetSeconds: 18, stimulus: { kind: "bar", title: "Quarterly output", labels: ["Q1", "Q2", "Q3", "Q4"], values: [120, 150, 135, 180], unit: "units" } },
  { id: "log-05", category: "Logic", prompt: "All Ruds are Pims. Some Ruds are Naks. Which conclusion is certain?", choices: ["Some Pims are Naks", "All Pims are Naks", "No Pims are Naks", "All Naks are Ruds", "Some Naks are not Ruds"], difficulty: 2, targetSeconds: 18 },
  { id: "ver-09", category: "Verbal", prompt: "TEMPORARY is to PERMANENT as SHALLOW is to:", choices: ["Narrow", "Deep", "Brief", "Broad", "Low"], difficulty: 1, targetSeconds: 18 },
  { id: "num-10", category: "Numerical", prompt: "What is the average response time for Tuesday and Thursday?", choices: ["16", "17", "18", "19", "20"], difficulty: 2, targetSeconds: 18, itemFamily: "averages", stimulus: { kind: "line", title: "Average response time", labels: ["Mon", "Tue", "Wed", "Thu", "Fri"], values: [24, 20, 18, 16, 12], unit: "minutes" } },
  { id: "spa-05", category: "Spatial", prompt: "Which figure continues the alternating pattern? △  ■  ▽  □  △  ?", choices: ["■", "□", "▽", "▲", "○"], difficulty: 2, targetSeconds: 18 },
  { id: "ver-10", category: "Verbal", prompt: "FRUGAL most nearly means:", choices: ["Wasteful", "Economical", "Generous", "Unusual", "Hungry"], difficulty: 2, targetSeconds: 18 },
  { id: "num-11", category: "Numerical", prompt: "What number comes next? 2, 3, 5, 9, 17, ?", choices: ["25", "31", "33", "34", "35"], difficulty: 2, targetSeconds: 18 },
  { id: "log-06", category: "Logic", prompt: "No Zets are Fars. Every Kim is a Zet. Which statement is true?", choices: ["Some Kims are Fars", "No Kims are Fars", "All Fars are Kims", "No Kims are Zets", "Some Zets are Kims"], difficulty: 2, targetSeconds: 18 },
  { id: "ver-11", category: "Verbal", prompt: "SEED is to PLANT as EGG is to:", choices: ["Nest", "Bird", "Shell", "Feather", "Wing"], difficulty: 1, targetSeconds: 18 },
  { id: "num-12", category: "Numerical", prompt: "A price is increased by 20% and then reduced by 20%. The final price is $96. What was the original price?", choices: ["$96", "$98", "$100", "$102", "$104"], difficulty: 3, targetSeconds: 18 },
  { id: "spa-06", category: "Spatial", prompt: "Complete the matrix: top row ▲, ▶, ▼; bottom row ◓, ◑, ?", choices: ["◐", "◓", "◒", "◑", "●"], difficulty: 3, targetSeconds: 18 },
  { id: "ver-12", category: "Verbal", prompt: "Choose the word most nearly opposite to OBSCURE.", choices: ["Hidden", "Faint", "Clear", "Complex", "Remote"], difficulty: 2, targetSeconds: 18 },
  { id: "num-13", category: "Numerical", prompt: "A box contains 3 red, 5 blue, and 2 green balls. What fraction are blue?", choices: ["1/5", "1/3", "2/5", "1/2", "3/5"], difficulty: 2, targetSeconds: 18 },
  { id: "log-07", category: "Logic", prompt: "Jae ranks above Kira. Milo ranks below Nia but above Jae. Who ranks second among the four?", choices: ["Jae", "Kira", "Milo", "Nia", "Cannot tell"], difficulty: 2, targetSeconds: 18 },
  { id: "ver-13", category: "Spatial", prompt: "Which figure is not a rotation of the same arrangement?", choices: ["▲○", "▶○", "▼○", "◀○", "▲●"], difficulty: 2, targetSeconds: 18 },
  { id: "num-14", category: "Numerical", prompt: "Which region had the highest hiring rate?", choices: ["North", "South", "East", "West", "All were equal"], difficulty: 2, targetSeconds: 18, stimulus: { kind: "table", title: "Hiring results", columns: ["Applicants", "Hired"], rows: [{ label: "North", values: [80, 20] }, { label: "South", values: [120, 24] }, { label: "East", values: [90, 27] }, { label: "West", values: [150, 30] }] } },
  { id: "log-08", category: "Spatial", prompt: "Complete the pattern: ○□, □△, △◇, ?", choices: ["◇○", "○◇", "◇△", "□○", "△□"], difficulty: 2, targetSeconds: 18 },
  { id: "ver-14", category: "Verbal", prompt: "LUCID most nearly means:", choices: ["Clear", "Lengthy", "Unusual", "Doubtful", "Forceful"], difficulty: 2, targetSeconds: 18 },
  { id: "num-15", category: "Spatial", prompt: "Which figure completes the size sequence? ●  ◉  ○  ●  ◉  ?", choices: ["●", "◉", "○", "◎", "■"], difficulty: 2, targetSeconds: 18 },
  { id: "log-09", category: "Logic", prompt: "All Dels are Wiks. Some Wiks are Bors. What can be concluded about Dels and Bors?", choices: ["All Dels are Bors", "Some Dels are Bors", "No Dels are Bors", "Nothing definite", "All Bors are Dels"], difficulty: 2, targetSeconds: 18 },
  { id: "ver-15", category: "Verbal", prompt: "BAROMETER is to PRESSURE as SEISMOGRAPH is to:", choices: ["Temperature", "Wind", "Earthquakes", "Altitude", "Distance"], difficulty: 2, targetSeconds: 18 },
  { id: "num-16", category: "Numerical", prompt: "What number comes next? 5, 10, 8, 16, 14, ?", choices: ["18", "24", "26", "28", "30"], difficulty: 2, targetSeconds: 18 },
  { id: "log-10", category: "Logic", prompt: "Four tasks are ordered J, K, L, M. K must follow J, and M must precede L. Which order is possible?", choices: ["K J M L", "J K L M", "M J K L", "L M J K", "J L M K"], difficulty: 3, targetSeconds: 18 },
  { id: "ver-16", category: "Verbal", prompt: "Choose the word most nearly opposite to TRANSIENT.", choices: ["Permanent", "Distant", "Mobile", "Uncertain", "Brief"], difficulty: 3, targetSeconds: 18 },
  { id: "num-17", category: "Spatial", prompt: "Which symbol completes the sequence? ↖  ↗  ↘  ?", choices: ["↖", "↗", "↘", "↙", "↑"], difficulty: 1, targetSeconds: 18 },
  { id: "num-18", category: "Numerical", prompt: "If 3y + 2 = 2(y + 7), what is 5y - 3?", choices: ["42", "47", "52", "57", "62"], difficulty: 3, targetSeconds: 18 },
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

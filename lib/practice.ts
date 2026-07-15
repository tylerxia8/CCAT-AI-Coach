import type { Category } from "./diagnostic";

export type PracticeQuestion = {
  id: string;
  category: Category;
  prompt: string;
  choices: string[];
  targetSeconds: number;
};

export type PracticeFeedback = {
  questionId: string;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
};

export const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  { id: "practice-num-01", category: "Numerical", prompt: "If 5 machines make 200 parts in 4 hours, how many parts will 8 identical machines make in 5 hours?", choices: ["320", "360", "400", "440", "500"], targetSeconds: 38 },
  { id: "practice-ver-01", category: "Verbal", prompt: "TRANSPARENT is to OPAQUE as FLEXIBLE is to:", choices: ["Elastic", "Rigid", "Visible", "Useful", "Fragile"], targetSeconds: 24 },
  { id: "practice-log-01", category: "Logic", prompt: "Every Nib is a Pex. Some Pexes are Jors. Which conclusion is guaranteed?", choices: ["Some Nibs are Jors", "No Nibs are Jors", "Every Nib is a Pex", "Every Jor is a Nib", "No Pex is a Jor"], targetSeconds: 34 },
  { id: "practice-num-02", category: "Numerical", prompt: "What number comes next? 3, 8, 18, 38, 78, ?", choices: ["118", "138", "148", "158", "168"], targetSeconds: 34 },
  { id: "practice-spa-01", category: "Spatial", prompt: "A marker faces west. It turns 270° clockwise, then 90° counterclockwise. Which direction does it face?", choices: ["North", "East", "South", "West", "Northeast"], targetSeconds: 28 },
  { id: "practice-ver-02", category: "Verbal", prompt: "Choose the word that is most nearly opposite in meaning to CONCISE.", choices: ["Brief", "Direct", "Verbose", "Accurate", "Simple"], targetSeconds: 22 },
  { id: "practice-log-02", category: "Logic", prompt: "Mara arrives before Theo. Jin arrives after Theo but before Sal. Who must arrive before Jin?", choices: ["Mara only", "Theo only", "Mara and Theo", "Sal and Theo", "Sal only"], targetSeconds: 32 },
  { id: "practice-num-03", category: "Numerical", prompt: "A value increases from 120 to 150. What is the percentage increase?", choices: ["20%", "25%", "30%", "35%", "40%"], targetSeconds: 30 },
];

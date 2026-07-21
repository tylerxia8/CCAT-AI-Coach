import type { PracticeQuestion } from "./practice";

export const TOPIC_EXPANSION_QUESTIONS: PracticeQuestion[] = [
  { id: "practice-topic-ver-01", category: "Verbal", prompt: "ARCHIVE is to RECORDS as WAREHOUSE is to:", choices: ["Workers", "Goods", "Trucks", "Shelves", "Orders"], targetSeconds: 22, difficulty: 2, skill: "verbal analogies" },
  { id: "practice-topic-ver-02", category: "Verbal", prompt: "VACCINE is to DISEASE as INSULATION is to:", choices: ["Construction", "Electricity", "Heat loss", "Thickness", "Weather"], targetSeconds: 26, difficulty: 4, skill: "verbal analogies" },
  { id: "practice-topic-num-01", category: "Numerical", prompt: "What number comes next? 4, 7, 13, 25, 49, ?", choices: ["73", "81", "95", "97", "99"], targetSeconds: 28, difficulty: 3, skill: "number sequences" },
  { id: "practice-topic-num-02", category: "Numerical", prompt: "What number comes next? 90, 87, 81, 72, 60, ?", choices: ["42", "45", "47", "48", "51"], targetSeconds: 30, difficulty: 4, skill: "number sequences" },
  { id: "practice-topic-ver-03", category: "Verbal", prompt: "Choose the word most nearly opposite in meaning to TACITURN.", choices: ["Reserved", "Cautious", "Garrulous", "Patient", "Solemn"], targetSeconds: 22, difficulty: 4, skill: "antonyms" },
  { id: "practice-topic-ver-04", category: "Verbal", prompt: "Choose the word most nearly opposite in meaning to BOLSTER.", choices: ["Support", "Undermine", "Explain", "Measure", "Restore"], targetSeconds: 20, difficulty: 3, skill: "antonyms" },
  { id: "practice-topic-ver-05", category: "Verbal", prompt: "Choose the word most nearly opposite in meaning to PARSIMONIOUS.", choices: ["Lavish", "Prudent", "Hesitant", "Exacting", "Frugal"], targetSeconds: 24, difficulty: 5, skill: "antonyms" },
];

import type { Category, DataStimulus } from "./diagnostic";
import { PRACTICE_EXPANSION_QUESTIONS } from "./practice-expansion";
import { PRIORITY_EXPANSION_QUESTIONS } from "./practice-expansion-priority";
import { ADVANCED_MATH_QUESTIONS } from "./practice-expansion-math";
import { LOGIC_SPATIAL_EXPANSION_QUESTIONS } from "./practice-expansion-logic-spatial";

export type PracticeQuestion = {
  id: string;
  category: Category;
  prompt: string;
  choices: string[];
  targetSeconds: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  skill: string;
  stimulus?: DataStimulus;
};

export type PracticeFeedback = {
  questionId: string;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
};

export const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  { id: "practice-num-01", category: "Numerical", prompt: "If 5 machines make 200 parts in 4 hours, how many parts will 8 identical machines make in 5 hours?", choices: ["320", "360", "400", "440", "500"], targetSeconds: 38, difficulty: 4, skill: "rates and arithmetic" },
  { id: "practice-ver-01", category: "Verbal", prompt: "TRANSPARENT is to OPAQUE as FLEXIBLE is to:", choices: ["Elastic", "Rigid", "Visible", "Useful", "Fragile"], targetSeconds: 24, difficulty: 2, skill: "verbal analogies" },
  { id: "practice-log-01", category: "Logic", prompt: "Every Nib is a Pex. Some Pexes are Jors. Which conclusion is guaranteed?", choices: ["Some Nibs are Jors", "No Nibs are Jors", "Every Nib is a Pex", "Every Jor is a Nib", "No Pex is a Jor"], targetSeconds: 34, difficulty: 3, skill: "syllogisms" },
  { id: "practice-num-02", category: "Numerical", prompt: "What number comes next? 3, 8, 18, 38, 78, ?", choices: ["118", "138", "148", "158", "168"], targetSeconds: 34, difficulty: 4, skill: "number sequences" },
  { id: "practice-spa-01", category: "Spatial", prompt: "A marker faces west. It turns 270° clockwise, then 90° counterclockwise. Which direction does it face?", choices: ["North", "East", "South", "West", "Northeast"], targetSeconds: 28, difficulty: 3, skill: "mental rotation" },
  { id: "practice-ver-02", category: "Verbal", prompt: "Choose the word that is most nearly opposite in meaning to CONCISE.", choices: ["Brief", "Direct", "Verbose", "Accurate", "Simple"], targetSeconds: 22, difficulty: 1, skill: "antonyms" },
  { id: "practice-log-02", category: "Logic", prompt: "Mara arrives before Theo. Jin arrives after Theo but before Sal. Who must arrive before Jin?", choices: ["Mara only", "Theo only", "Mara and Theo", "Sal and Theo", "Sal only"], targetSeconds: 32, difficulty: 3, skill: "ordering logic" },
  { id: "practice-num-03", category: "Numerical", prompt: "A value increases from 120 to 150. What is the percentage increase?", choices: ["20%", "25%", "30%", "35%", "40%"], targetSeconds: 30, difficulty: 2, skill: "percentages" },
  { id: "practice-ver-03", category: "Verbal", prompt: "Although the initial evidence seemed ___, later findings made the conclusion nearly certain.", choices: ["conclusive", "inconclusive", "irrelevant", "abundant", "consistent"], targetSeconds: 24, difficulty: 3, skill: "sentence completion" },
  { id: "practice-num-04", category: "Numerical", prompt: "Three identical boxes hold 12 files. How many files do five boxes hold?", choices: ["15", "18", "20", "24", "30"], targetSeconds: 22, difficulty: 1, skill: "rates and arithmetic" },
  { id: "practice-num-05", category: "Numerical", prompt: "An item priced at $120 is discounted by 15%. What is the sale price?", choices: ["$96", "$100", "$102", "$105", "$108"], targetSeconds: 28, difficulty: 3, skill: "percentages" },
  { id: "practice-num-06", category: "Numerical", prompt: "A $200 price rises by 20% and is then reduced by 25%. What is the final price?", choices: ["$170", "$175", "$180", "$185", "$190"], targetSeconds: 34, difficulty: 5, skill: "percentages" },
  { id: "practice-num-07", category: "Numerical", prompt: "What number comes next? 5, 9, 13, 17, ?", choices: ["19", "20", "21", "22", "23"], targetSeconds: 20, difficulty: 1, skill: "number sequences" },
  { id: "practice-num-08", category: "Numerical", prompt: "What number comes next? 3, 7, 15, 31, ?", choices: ["47", "55", "61", "63", "65"], targetSeconds: 28, difficulty: 3, skill: "number sequences" },
  { id: "practice-num-09", category: "Numerical", prompt: "What number comes next? 2, 5, 11, 23, 47, ?", choices: ["71", "83", "91", "95", "97"], targetSeconds: 34, difficulty: 5, skill: "number sequences" },
  { id: "practice-num-10", category: "Numerical", prompt: "If 3x + 5 = 20, what is x?", choices: ["3", "4", "5", "6", "7"], targetSeconds: 22, difficulty: 2, skill: "basic algebra" },
  { id: "practice-num-11", category: "Numerical", prompt: "If 2(x + 4) = 3x - 2, what is x?", choices: ["6", "8", "10", "12", "14"], targetSeconds: 32, difficulty: 4, skill: "basic algebra" },
  { id: "practice-num-12", category: "Numerical", prompt: "Five numbers have an average of 18. Four of them total 68. What is the fifth number?", choices: ["18", "20", "22", "24", "26"], targetSeconds: 28, difficulty: 3, skill: "averages" },
  { id: "practice-num-13", category: "Numerical", prompt: "The ratio of red to blue markers is 3:5. If there are 64 markers, how many are blue?", choices: ["24", "32", "36", "40", "48"], targetSeconds: 34, difficulty: 4, skill: "fractions and proportions" },
  { id: "practice-ver-04", category: "Verbal", prompt: "BIRD is to NEST as BEE is to:", choices: ["Hive", "Honey", "Wing", "Flower", "Swarm"], targetSeconds: 18, difficulty: 1, skill: "verbal analogies" },
  { id: "practice-ver-05", category: "Verbal", prompt: "SCALPEL is to SURGEON as GAVEL is to:", choices: ["Carpenter", "Judge", "Writer", "Pilot", "Architect"], targetSeconds: 22, difficulty: 3, skill: "verbal analogies" },
  { id: "practice-ver-06", category: "Verbal", prompt: "OPAQUE is to LIGHT as IMPERMEABLE is to:", choices: ["Heat", "Sound", "Water", "Pressure", "Weight"], targetSeconds: 26, difficulty: 5, skill: "verbal analogies" },
  { id: "practice-ver-07", category: "Verbal", prompt: "Choose the word most nearly opposite to ABUNDANT.", choices: ["Useful", "Scarce", "Heavy", "Natural", "Visible"], targetSeconds: 18, difficulty: 1, skill: "antonyms" },
  { id: "practice-ver-08", category: "Verbal", prompt: "Choose the word most nearly opposite to METICULOUS.", choices: ["Careless", "Patient", "Detailed", "Methodical", "Cautious"], targetSeconds: 22, difficulty: 3, skill: "antonyms" },
  { id: "practice-ver-09", category: "Verbal", prompt: "Choose the word most nearly opposite to ACQUIESCE.", choices: ["Consent", "Delay", "Resist", "Explain", "Observe"], targetSeconds: 24, difficulty: 5, skill: "antonyms" },
  { id: "practice-ver-10", category: "Verbal", prompt: "Because the weather was ___, the outdoor picnic was canceled.", choices: ["mild", "inclement", "pleasant", "seasonal", "predictable"], targetSeconds: 20, difficulty: 1, skill: "sentence completion" },
  { id: "practice-ver-11", category: "Verbal", prompt: "Despite the ___ evidence, the jury remained skeptical of the claim.", choices: ["compelling", "irrelevant", "missing", "fabricated", "confusing"], targetSeconds: 22, difficulty: 2, skill: "sentence completion" },
  { id: "practice-ver-12", category: "Verbal", prompt: "Far from being ___, the editor's criticism was intended to help the author improve the manuscript.", choices: ["constructive", "malicious", "specific", "measured", "timely"], targetSeconds: 26, difficulty: 4, skill: "sentence completion" },
  { id: "practice-ver-13", category: "Verbal", prompt: "Which word does not belong?", choices: ["Apple", "Pear", "Plum", "Carrot", "Peach"], targetSeconds: 18, difficulty: 2, skill: "word classification" },
  { id: "practice-ver-14", category: "Verbal", prompt: "PRAGMATIC most nearly means:", choices: ["Idealistic", "Practical", "Secretive", "Uncertain", "Careless"], targetSeconds: 22, difficulty: 4, skill: "vocabulary" },
  { id: "practice-ver-15", category: "Verbal", prompt: "OBDURATE most nearly means:", choices: ["Flexible", "Stubborn", "Joyful", "Transparent", "Temporary"], targetSeconds: 24, difficulty: 5, skill: "vocabulary" },
  { id: "practice-log-03", category: "Logic", prompt: "All Fens are Gars. No Gars are Tigs. Which statement must be true?", choices: ["No Fens are Tigs", "Some Fens are Tigs", "All Tigs are Fens", "No Fens are Gars", "Some Gars are Tigs"], targetSeconds: 24, difficulty: 1, skill: "syllogisms" },
  { id: "practice-log-04", category: "Logic", prompt: "Some Lems are Pors. All Pors are Veks. No Veks are Dars. Which conclusion must be true?", choices: ["All Lems are Veks", "Some Lems are not Dars", "No Lems are Dars", "Some Dars are Pors", "All Veks are Lems"], targetSeconds: 34, difficulty: 4, skill: "syllogisms" },
  { id: "practice-log-05", category: "Logic", prompt: "Ava arrives before Ben. Ben arrives before Cara. Who must arrive last?", choices: ["Ava", "Ben", "Cara", "Ava or Ben", "Cannot tell"], targetSeconds: 18, difficulty: 1, skill: "ordering logic" },
  { id: "practice-log-06", category: "Logic", prompt: "P is before Q. R is after Q. S is before P. Which order is required?", choices: ["P, S, Q, R", "S, P, Q, R", "S, Q, P, R", "R, Q, P, S", "Q, P, S, R"], targetSeconds: 30, difficulty: 4, skill: "ordering logic" },
  { id: "practice-log-07", category: "Logic", prompt: "If the alarm sounds, the warning light turns on. The warning light is off. What follows?", choices: ["The alarm sounded", "The alarm did not sound", "The light is broken", "The alarm is broken", "Nothing follows"], targetSeconds: 26, difficulty: 3, skill: "deductive reasoning" },
  { id: "practice-log-08", category: "Logic", prompt: "Which letter comes next? B, D, G, K, P, ?", choices: ["T", "U", "V", "W", "X"], targetSeconds: 28, difficulty: 2, skill: "letter series" },
  { id: "practice-log-09", category: "Logic", prompt: "Exactly one of L or M is selected. If L is selected, N must be selected. N is not selected. What must be true?", choices: ["L is selected", "M is selected", "Both are selected", "Neither is selected", "N is selected"], targetSeconds: 34, difficulty: 5, skill: "deductive reasoning" },
  { id: "practice-spa-02", category: "Spatial", prompt: "An arrow points north. After a quarter-turn clockwise, where does it point?", choices: ["North", "East", "South", "West", "Northeast"], targetSeconds: 18, difficulty: 1, skill: "mental rotation" },
  { id: "practice-spa-03", category: "Spatial", prompt: "Which arrow continues the sequence? ↑  →  ↓  ?", choices: ["↑", "↗", "→", "←", "↙"], targetSeconds: 20, difficulty: 2, skill: "visual sequences" },
  { id: "practice-spa-04", category: "Spatial", prompt: "A vertical mirror is placed to the right of ↗. Which arrow appears in the mirror?", choices: ["↗", "↘", "↙", "↖", "↑"], targetSeconds: 24, difficulty: 4, skill: "reflection" },
  { id: "practice-spa-05", category: "Spatial", prompt: "Which shape continues the repeating pattern? ○  □  △  ○  □  ?", choices: ["○", "□", "△", "◇", "●"], targetSeconds: 20, difficulty: 3, skill: "visual sequences" },
  { id: "practice-spa-06", category: "Spatial", prompt: "Which arrangement is a 180° rotation of ▲○?", choices: ["▲○", "○▲", "▼○", "○▼", "◀○"], targetSeconds: 28, difficulty: 5, skill: "mental rotation" },
  { id: "practice-num-14", category: "Numerical", prompt: "What is the average of 10 and 14?", choices: ["11", "12", "13", "14", "15"], targetSeconds: 18, difficulty: 1, skill: "averages" },
  { id: "practice-num-15", category: "Numerical", prompt: "Six numbers have an average of 23. Five of the numbers total 111. What is the sixth number?", choices: ["23", "25", "27", "29", "31"], targetSeconds: 30, difficulty: 4, skill: "averages" },
  { id: "practice-num-16", category: "Numerical", prompt: "Four workers average 18 completed tasks and six workers average 27. What is the average across all ten workers?", choices: ["21.6", "22.5", "23.0", "23.4", "24.6"], targetSeconds: 36, difficulty: 5, skill: "averages" },
  { id: "practice-num-17", category: "Numerical", prompt: "Which fraction is largest?", choices: ["1/2", "2/3", "3/4", "5/8", "7/10"], targetSeconds: 20, difficulty: 1, skill: "fractions and proportions" },
  { id: "practice-num-18", category: "Numerical", prompt: "What is 2/3 of 45?", choices: ["15", "24", "27", "30", "36"], targetSeconds: 24, difficulty: 3, skill: "fractions and proportions" },
  { id: "practice-num-19", category: "Numerical", prompt: "A tank is 7/12 full and holds 144 liters when full. How many more liters are needed to fill it?", choices: ["48", "54", "60", "72", "84"], targetSeconds: 34, difficulty: 5, skill: "fractions and proportions" },
  { id: "practice-log-10", category: "Logic", prompt: "Which letter comes next? A, C, E, G, ?", choices: ["H", "I", "J", "K", "L"], targetSeconds: 18, difficulty: 1, skill: "letter series" },
  { id: "practice-log-11", category: "Logic", prompt: "Which pair of letters comes next? AZ, BY, CX, ?", choices: ["DV", "DW", "DX", "EV", "EW"], targetSeconds: 24, difficulty: 3, skill: "letter series" },
  { id: "practice-log-12", category: "Logic", prompt: "Which pair of letters comes next? AB, DE, HI, MN, ?", choices: ["QR", "RS", "ST", "TU", "UV"], targetSeconds: 32, difficulty: 5, skill: "letter series" },
  { id: "practice-spa-07", category: "Spatial", prompt: "A vertical mirror is placed to the right of →. Which arrow appears in the mirror?", choices: ["↑", "→", "↓", "←", "↗"], targetSeconds: 18, difficulty: 1, skill: "reflection" },
  { id: "practice-spa-08", category: "Spatial", prompt: "A vertical mirror is placed to the right of ↘. Which arrow appears in the mirror?", choices: ["↗", "↘", "↙", "↖", "↓"], targetSeconds: 22, difficulty: 3, skill: "reflection" },
  { id: "practice-spa-09", category: "Spatial", prompt: "A vertical mirror reflects the arrangement ▲○■. Which arrangement appears?", choices: ["▲○■", "■○▲", "▼○■", "■○▼", "○■▲"], targetSeconds: 28, difficulty: 5, skill: "reflection" },
  { id: "practice-ver-16", category: "Verbal", prompt: "Which item is not an animal?", choices: ["Dog", "Cat", "Horse", "Tulip", "Rabbit"], targetSeconds: 18, difficulty: 1, skill: "word classification" },
  { id: "practice-ver-17", category: "Verbal", prompt: "Which item is not a metal?", choices: ["Copper", "Iron", "Silver", "Granite", "Gold"], targetSeconds: 22, difficulty: 3, skill: "word classification" },
  { id: "practice-ver-18", category: "Verbal", prompt: "Which word differs in meaning from the other four?", choices: ["Taciturn", "Reticent", "Laconic", "Verbose", "Reserved"], targetSeconds: 26, difficulty: 5, skill: "word classification" },
  { id: "practice-num-20", category: "Numerical", prompt: "By what percentage did output increase from Q1 to Q4?", choices: ["50%", "60%", "70%", "75%", "80%"], targetSeconds: 28, difficulty: 2, skill: "data interpretation", stimulus: { kind: "bar", title: "Quarterly output", labels: ["Q1", "Q2", "Q3", "Q4"], values: [80, 100, 120, 140], unit: "units" } },
  { id: "practice-num-21", category: "Numerical", prompt: "Which region had the highest hiring rate?", choices: ["North", "South", "East", "West", "All equal"], targetSeconds: 32, difficulty: 3, skill: "data interpretation", stimulus: { kind: "table", title: "Hiring by region", columns: ["Applicants", "Hired"], rows: [{ label: "North", values: [100, 20] }, { label: "South", values: [80, 20] }, { label: "East", values: [120, 24] }, { label: "West", values: [90, 27] }] } },
  { id: "practice-num-22", category: "Numerical", prompt: "What is the average response time for Tuesday and Thursday?", choices: ["16", "17", "18", "19", "20"], targetSeconds: 30, difficulty: 4, skill: "data interpretation", stimulus: { kind: "line", title: "Response time", labels: ["Mon", "Tue", "Wed", "Thu", "Fri"], values: [22, 20, 17, 16, 15], unit: "minutes" } },
  { id: "practice-num-23", category: "Numerical", prompt: "If the total budget is $360,000, how much more is allocated to Sales than Administration?", choices: ["$54,000", "$63,000", "$72,000", "$81,000", "$90,000"], targetSeconds: 36, difficulty: 5, skill: "data interpretation", stimulus: { kind: "pie", title: "Department budget", labels: ["Operations", "Product", "Sales", "Administration"], values: [35, 25, 30, 10], unit: "%" } },
  { id: "practice-ver-19", category: "Verbal", prompt: "Which pair is exactly the same?", choices: ["K8M42P · K8N42P", "R7T91Q · R7T19Q", "B4X66L · B4X66L", "D2V83C · D2V8BC", "P5A17N · P5A71N"], targetSeconds: 22, difficulty: 2, skill: "attention to detail" },
  { id: "practice-ver-20", category: "Verbal", prompt: "How many rows contain exactly matching entries?", choices: ["1", "2", "3", "4", "5"], targetSeconds: 26, difficulty: 3, skill: "attention to detail", stimulus: { kind: "pairs", title: "Compare each row", pairs: [["LM7-204", "LM7-204"], ["QR5-816", "QR5-861"], ["TX9-442", "TX9-442"], ["BN3-175", "BN3-17S"], ["CP8-630", "CP8-630"]] } },
  { id: "practice-ver-21", category: "Verbal", prompt: "Which longer code pair is exactly the same?", choices: ["8QK-41M-762 · 8QK-41N-762", "5RB-903-X17 · 5RB-930-X17", "6TN-28G-445 · 6TN-28G-445", "LP4-771-Z09 · LP4-717-Z09", "3DV-618-K52 · 3DV-681-K52"], targetSeconds: 24, difficulty: 5, skill: "attention to detail" },
  { id: "practice-spa-10", category: "Spatial", prompt: "Complete the matrix: top row ○, ○○, ○○○; bottom row ■, ■■, ?", choices: ["■", "■■", "■■■", "□□□", "●●●"], targetSeconds: 22, difficulty: 2, skill: "figure matrices" },
  { id: "practice-spa-11", category: "Spatial", prompt: "In each row, the third cell combines the first two. Top row: ○, ●, ○●. Bottom row: □, ■, ?", choices: ["□", "■", "□■", "○●", "■■"], targetSeconds: 28, difficulty: 3, skill: "figure matrices" },
  { id: "practice-spa-12", category: "Spatial", prompt: "In each row, rotate the first symbol 90° clockwise, then place it before the second. Top row: ↑, ○, →○. Bottom row: ←, □, ?", choices: ["←□", "↑□", "→□", "↓□", "□↑"], targetSeconds: 34, difficulty: 5, skill: "figure matrices" },
  ...PRACTICE_EXPANSION_QUESTIONS,
  ...PRIORITY_EXPANSION_QUESTIONS,
  ...ADVANCED_MATH_QUESTIONS,
  ...LOGIC_SPATIAL_EXPANSION_QUESTIONS,
];

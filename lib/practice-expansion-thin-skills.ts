import type { PracticeQuestion } from "./practice";

export const THIN_SKILL_EXPANSION_QUESTIONS: PracticeQuestion[] = [
  { id: "practice-thin-ver-01", category: "Verbal", prompt: "CANDID most nearly means:", choices: ["Frank", "Careless", "Qualified", "Secret", "Uncertain"], targetSeconds: 20, difficulty: 2, skill: "vocabulary" },
  { id: "practice-thin-ver-02", category: "Verbal", prompt: "PRUDENT most nearly means:", choices: ["Hasty", "Cautious", "Generous", "Rigid", "Obvious"], targetSeconds: 22, difficulty: 3, skill: "vocabulary" },
  { id: "practice-thin-ver-03", category: "Verbal", prompt: "ABATE most nearly means:", choices: ["Predict", "Intensify", "Diminish", "Permit", "Divide"], targetSeconds: 24, difficulty: 4, skill: "vocabulary" },

  { id: "practice-thin-num-01", category: "Numerical", prompt: "If y = 3x + 2, what is y when x = 5?", choices: ["13", "15", "17", "19", "21"], targetSeconds: 22, difficulty: 2, skill: "algebraic relationships" },
  { id: "practice-thin-num-02", category: "Numerical", prompt: "The pairs (1, 5), (2, 8), and (3, 11) follow the same rule. Which equation relates x and y?", choices: ["y = 2x + 3", "y = 3x + 2", "y = 3x - 2", "y = 4x + 1", "y = 5x"], targetSeconds: 32, difficulty: 4, skill: "algebraic relationships" },

  { id: "practice-thin-num-03", category: "Numerical", prompt: "A two-digit number has a tens digit twice its ones digit. The digits sum to 12. What is the number?", choices: ["48", "64", "72", "84", "93"], targetSeconds: 32, difficulty: 3, skill: "digit algebra" },
  { id: "practice-thin-num-04", category: "Numerical", prompt: "A two-digit number has digits that sum to 11. Reversing its digits decreases the number by 27. What is the original number?", choices: ["47", "56", "65", "74", "83"], targetSeconds: 38, difficulty: 5, skill: "digit algebra" },

  { id: "practice-thin-num-05", category: "Numerical", prompt: "What is 2³ × 2⁴?", choices: ["32", "64", "96", "128", "256"], targetSeconds: 24, difficulty: 3, skill: "exponents" },
  { id: "practice-thin-num-06", category: "Numerical", prompt: "What is 3⁴ ÷ 3²?", choices: ["3", "6", "9", "12", "27"], targetSeconds: 24, difficulty: 3, skill: "exponents" },

  { id: "practice-thin-num-07", category: "Numerical", prompt: "A rectangle has a perimeter of 50 and a length of 15. What is its area?", choices: ["100", "125", "150", "175", "200"], targetSeconds: 34, difficulty: 3, skill: "geometry" },
  { id: "practice-thin-num-08", category: "Numerical", prompt: "What is the area of a triangle with a base of 14 and a perpendicular height of 9?", choices: ["46", "54", "63", "72", "126"], targetSeconds: 28, difficulty: 2, skill: "geometry" },

  { id: "practice-thin-num-09", category: "Numerical", prompt: "A container holds 30 liters of a 20% solution. If 10 liters of pure concentrate are added, what percent of the new mixture is concentrate?", choices: ["25%", "30%", "35%", "40%", "45%"], targetSeconds: 40, difficulty: 5, skill: "mixtures" },
  { id: "practice-thin-num-10", category: "Numerical", prompt: "How many pounds of $12-per-pound coffee should be mixed with $8-per-pound coffee to make 10 pounds worth $10.40 per pound?", choices: ["4", "5", "6", "7", "8"], targetSeconds: 42, difficulty: 5, skill: "mixtures" },

  { id: "practice-thin-num-11", category: "Numerical", prompt: "2 is to 6 as 6 is to what number?", choices: ["30", "36", "40", "42", "48"], targetSeconds: 28, difficulty: 3, skill: "numerical analogies" },
  { id: "practice-thin-num-12", category: "Numerical", prompt: "7 is to 50 as 11 is to what number?", choices: ["111", "120", "121", "122", "132"], targetSeconds: 30, difficulty: 4, skill: "numerical analogies" },

  { id: "practice-thin-num-13", category: "Numerical", prompt: "If x is positive and x² - 9 = 16, what is x?", choices: ["3", "4", "5", "7", "25"], targetSeconds: 30, difficulty: 4, skill: "quadratic reasoning" },

  { id: "practice-thin-num-14", category: "Numerical", prompt: "If x + y = 14 and x - y = 4, what is x?", choices: ["5", "7", "8", "9", "10"], targetSeconds: 30, difficulty: 3, skill: "systems of equations" },
  { id: "practice-thin-num-15", category: "Numerical", prompt: "If 2p + q = 17 and p - q = 4, what is q?", choices: ["2", "3", "4", "5", "7"], targetSeconds: 36, difficulty: 4, skill: "systems of equations" },

  { id: "practice-thin-num-16", category: "Numerical", prompt: "One pump fills a tank in 6 hours and another fills it in 3 hours. How long do they take working together?", choices: ["1 hour", "1.5 hours", "2 hours", "2.5 hours", "3 hours"], targetSeconds: 34, difficulty: 3, skill: "work rates" },
  { id: "practice-thin-num-17", category: "Numerical", prompt: "Four equally productive workers finish a job in 15 days. At the same rate, how many days would 10 workers need?", choices: ["4", "5", "6", "7.5", "9"], targetSeconds: 30, difficulty: 3, skill: "work rates" },
];

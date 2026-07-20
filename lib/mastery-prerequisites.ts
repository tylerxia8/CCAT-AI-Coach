export type MasteryStep = { title: string; description: string; kind: "lesson" | "recognition" | "automaticity" | "transfer" | "simulation"; href: string; gate: string };

export function masteryPath(skill: string): MasteryStep[] {
  const encoded = encodeURIComponent(skill);
  return [
    { title: "Understand the rule", description: "Study worked examples and repair the missing prerequisite.", kind: "lesson", href: `/learn?skill=${encoded}`, gate: "Pass all four comprehension checks" },
    { title: "Recognize the method", description: "Identify the question family and first solving step without completing the calculation.", kind: "recognition", href: `/recognition?skill=${encoded}`, gate: "8 of 10 methods identified" },
    { title: "Build automaticity", description: "Execute one familiar method repeatedly with a shrinking time cap.", kind: "automaticity", href: `/practice?focus=speed&skill=${encoded}&new=1`, gate: "80% correct at target pace" },
    { title: "Prove transfer", description: "Solve unseen mixed examples without a method label or hint.", kind: "transfer", href: `/practice?focus=refinement&skill=${encoded}&new=1`, gate: "4 of 5 unseen examples correct" },
    { title: "Verify under test conditions", description: "Maintain the repaired skill inside a fresh timed form.", kind: "simulation", href: "/practice-tests", gate: "No category collapse or pace regression" },
  ];
}

export function prerequisiteFor(skill: string) {
  const text = skill.toLowerCase();
  if (/syllog|deductive|truth/.test(text)) return "logic language: all, some, none, if, and only if";
  if (/ordering/.test(text)) return "two-statement ordering chains";
  if (/percent/.test(text)) return "fractions, decimals, and the correct base quantity";
  if (/ratio|proportion|mixture|rate/.test(text)) return "equivalent ratios and aligned units";
  if (/algebra|equation|quadratic/.test(text)) return "translating words into one equation";
  if (/sentence|vocab|antonym/.test(text)) return "context clues, tone, and common roots";
  if (/analogy/.test(text)) return "directional word relationships";
  if (/matrix|visual|sequence/.test(text)) return "count, position, fill, and transformation rules";
  if (/rotation|reflection|spatial|cube/.test(text)) return "orientation, handedness, and one-feature tracking";
  if (/attention/.test(text)) return "fixed-direction character chunking";
  return "question-family recognition and a canonical solving method";
}

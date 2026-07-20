import type { QuestionReview } from "./diagnostic";

export type MisconceptionSignal = { code: string; label: string; skill: string; count: number; confidence: "emerging" | "moderate" | "strong"; evidence: string; repair: string };

export function inferMisconceptions(reviews: QuestionReview[]): MisconceptionSignal[] {
  const signals = new Map<string, Omit<MisconceptionSignal, "count" | "confidence" | "evidence"> & { count: number; examples: string[] }>();
  for (const review of reviews.filter((item) => !item.isCorrect)) {
    const definition = classify(review);
    const current = signals.get(definition.code) ?? { ...definition, count: 0, examples: [] };
    current.count += 1;
    current.examples.push(review.questionId);
    signals.set(definition.code, current);
  }
  return [...signals.values()].map((signal): MisconceptionSignal => ({ code: signal.code, label: signal.label, skill: signal.skill, count: signal.count, confidence: signal.count >= 4 ? "strong" : signal.count >= 2 ? "moderate" : "emerging", evidence: `${signal.count} recent miss${signal.count === 1 ? "" : "es"} matched this pattern (${signal.examples.slice(0, 3).join(", ")}).`, repair: signal.repair })).sort((a, b) => b.count - a.count).slice(0, 5);
}

function classify(review: QuestionReview) {
  const fast = review.elapsedSeconds <= review.targetSeconds * .55;
  if (review.selectedAnswer === null) return base("unreached", "Question was not reached", review.skill, "Use earlier move-on decisions to preserve time for this item.");
  if (review.firstAnswerCorrect && !review.isCorrect) return base("changed_correct", "Correct reasoning was replaced", review.skill, "Change an answer only after naming specific contradictory evidence.");
  if (fast && review.confidence !== 3) return base("premature_guess", "Answer selected before a method formed", review.skill, "Classify the question and name the first solving step before choosing.");
  const skill = review.skill.toLowerCase();
  if (/syllog|deductive|truth/.test(skill)) return base("logic_scope", "Logical certainty or direction was confused", review.skill, "Diagram the premises, then test what must be true rather than what may be true.");
  if (/ordering/.test(skill)) return base("ordering_chain", "Ordering constraints were not fully chained", review.skill, "Externalize every relationship in one left-to-right chain.");
  if (/coding/.test(skill)) return base("coding_execution", "The coding rule was applied inconsistently", review.skill, "Apply the transformation one character and one position at a time.");
  if (/percent/.test(skill)) return base("percent_base", "The percentage base was likely misidentified", review.skill, "Write change ÷ original or part ÷ whole before calculating.");
  if (/ratio|fraction|proportion/.test(skill)) return base("proportion_setup", "The quantitative relationship was set up incorrectly", review.skill, "Label corresponding quantities and cross-multiply only after units align.");
  if (/sequence|series/.test(skill)) return base("pattern_overfit", "A pattern was chosen without explaining every transition", review.skill, "Test differences, ratios, alternation, and interleaving in that order.");
  if (/sentence|vocab|antonym|analogy/.test(skill)) return base("verbal_relation", "Context or word relationship was not used precisely", review.skill, "Predict the needed meaning or relationship before reading the choices.");
  if (/matrix|visual|rotation|reflection|cube|spatial/.test(skill)) return base("visual_transform", "The visual transformation was not tracked consistently", review.skill, "Track one asymmetric anchor and apply one transformation at a time.");
  if (/attention/.test(skill)) return base("comparison_scan", "A transposition or character difference was overlooked", review.skill, "Compare fixed chunks left to right and classify each pair once.");
  if (review.elapsedSeconds > review.targetSeconds * 1.5) return base("method_search", "Too many methods were attempted", review.skill, "Learn one canonical method and leave when no path is clear by 30 seconds.");
  return base("execution_error", "The method or final verification broke down", review.skill, "Redo the item by naming the rule, executing once, and checking only the requested value.");
}

function base(code: string, label: string, skill: string, repair: string) { return { code, label, skill, repair }; }

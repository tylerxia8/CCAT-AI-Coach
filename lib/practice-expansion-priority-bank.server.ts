import type { AnswerKey } from "./diagnostic";
import { rotatedCorrectIndex } from "./question-choice-rotation";

let answerOffset = 0;

export const PRIORITY_EXPANSION_ANSWER_KEY: AnswerKey = {
  "practice-ver-39": answer(1, "Lucid means clear and easy to understand, matching instructions a beginner can follow."),
  "practice-ver-40": answer(0, "Brief best describes a small delay that allows the ceremony to continue despite rain."),
  "practice-ver-41": answer(1, "Repeating an experiment can verify, or confirm, that its original result is reliable."),
  "practice-ver-42": answer(1, "Nearly identical independent accounts reasonably create suspicion that one writer copied the other."),
  "practice-ver-43": answer(2, "The contrast shows the evidence strengthened rather than undermined, or weakened, the theory."),
  "practice-ver-44": answer(1, "Numerous exceptions make an apparently simple task intricate, meaning complex in detail."),
  "practice-ver-45": answer(0, "Someone who refuses to favor either side is impartial."),
  "practice-ver-46": answer(2, "Demand that declines after alternatives appear begins to wane."),
  "practice-ver-47": answer(0, "A calm, detailed statement appears credible, meaning believable and trustworthy."),
  "practice-ver-48": answer(1, "An evasive response avoids a direct answer and leaves the matter unresolved."),
  "practice-ver-49": answer(1, "Publishing accounts openly promotes financial transparency."),
  "practice-ver-50": answer(0, "An explanation covering every necessary point is comprehensive even when concise."),
  "practice-ver-51": answer(1, "Ignoring foreseeable costs makes a savings estimate excessively optimistic."),
  "practice-ver-52": answer(1, "Continuing to blame others makes the apology appear insincere."),
  "practice-ver-53": answer(1, "Limited data cannot reliably justify a broad population-level conclusion."),
  "practice-ver-54": answer(0, "A successful trial gives an initially doubted proposal credibility."),
  "practice-ver-55": answer(0, "A familiar example can make an abstract concept concrete and accessible."),
  "practice-ver-56": answer(1, "Choosing only favorable evidence is selective even when the report's tone sounds neutral."),
  "practice-ver-57": answer(0, "An imminent deadline is close at hand and justifies postponing nonessential work."),
  "practice-ver-58": answer(1, "Different definitions explain and therefore resolve the apparent contradiction."),
  "practice-ver-59": answer(2, "Polished but formulaic answers follow a stock pattern and reveal little genuine position."),
  "practice-ver-60": answer(2, "A concession intentionally used to cause delay is calculated rather than genuinely generous."),
  "practice-ver-61": answer(0, "A temporary policy that becomes firmly established has become entrenched."),
  "practice-ver-62": answer(1, "Equivocal praise is ambiguous enough to sound either sincere or ironic."),
  "practice-ver-63": answer(1, "A perfunctory response handles the surface requirement with minimal real engagement."),
  "practice-ver-64": answer(1, "Evidence attempts to persuade a skeptic by changing the skeptic's belief."),
  "practice-ver-65": answer(0, "A trend that looks unequivocal appears clear and unambiguous, despite the historian's warning."),
  "practice-ver-66": answer(1, "An argument whose conclusion restates its premise is circular."),
  "practice-ver-67": answer(1, "To disavow responsibility is to deny association with it without necessarily making a broader claim."),
  "practice-ver-68": answer(1, "A negligible practical effect is too small to justify changing policy."),
  "practice-ver-69": answer(0, "A dispassionate tone appears neutral and unemotional, allowing a subtle critique to remain hidden."),
  "practice-ver-70": answer(1, "Treating an exception as typical produces a distorted representation of the evidence."),
  "practice-ver-71": answer(0, "Silence deliberately used to elicit information is a strategic tactic."),
  "practice-ver-72": answer(1, "A rule with many exceptions has questionable predictive usefulness."),
  "practice-ver-73": answer(0, "A structural shift is an underlying, durable change rather than a temporary fluctuation."),
  ...Object.fromEntries([2, 4, 1, 3, 5, 1, 4, 2, 5, 3, 2, 1, 4, 3, 5, 4, 2, 5, 1, 3, 5, 3, 1, 4, 2].map((count, index) => [`practice-ver-${index + 74}`, answer(count - 1, `Exactly ${count} row${count === 1 ? " matches" : "s match"} character for character; the remaining row${5 - count === 1 ? " contains" : "s contain"} a substitution or transposition.`)])),
};

function answer(correctIndex: number, explanation: string) {
  const id = `practice-ver-${39 + answerOffset++}`;
  return { correctIndex: rotatedCorrectIndex(id, correctIndex), explanation };
}

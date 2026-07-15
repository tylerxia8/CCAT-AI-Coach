import type { DiagnosticResult, QuestionReview } from "./diagnostic";

export type Bottleneck = "pacing" | "confidence" | "category" | "endurance" | "refinement";

export type CoachingPlan = {
  bottleneck: Bottleneck;
  title: string;
  evidence: string[];
  strategy: string;
  drill: {
    title: string;
    instructions: string;
    target: string;
  };
};

export function buildCoachingPlan(result: DiagnosticResult, reviews: QuestionReview[]): CoachingPlan {
  const answered = reviews.filter((review) => review.selectedAnswer !== null);
  const slow = answered.filter((review) => review.pace === "slow");
  const highConfidenceMisses = answered.filter((review) => !review.isCorrect && review.confidence === 3);
  const midpoint = Math.ceil(reviews.length / 2);
  const firstHalf = reviews.slice(0, midpoint);
  const secondHalf = reviews.slice(midpoint);
  const firstAccuracy = accuracy(firstHalf);
  const secondAccuracy = accuracy(secondHalf);
  const weakest = [...result.categoryResults]
    .filter((item) => item.total > 0)
    .sort((a, b) => a.correct / a.total - b.correct / b.total)[0];

  if (slow.length >= Math.ceil(answered.length * 0.4) && slow.length > 0) {
    return {
      bottleneck: "pacing",
      title: "Build a faster decision rhythm",
      evidence: [
        `${slow.length} of ${answered.length} answered questions ran past their target pace.`,
        `Your average decision time was ${result.averageSeconds} seconds.`,
      ],
      strategy: "Use a two-pass decision rule: commit when you can eliminate to one answer, and mark uncertain items before they consume a second question's time.",
      drill: {
        title: "Fixed-pace sprint",
        instructions: "Complete 8 mixed questions with a visible 30-second checkpoint. Move on at the checkpoint even when uncertain, then review only the marked items.",
        target: "At least 6 of 8 decisions within target pace",
      },
    };
  }

  if (highConfidenceMisses.length >= 2) {
    return {
      bottleneck: "confidence",
      title: "Calibrate confident decisions",
      evidence: [
        `${highConfidenceMisses.length} incorrect answers were submitted with high confidence.`,
        `Your confidence-fit score was ${Math.round(result.confidenceScore * 100)}%.`,
      ],
      strategy: "Before locking a high-confidence answer, state the rule or calculation that makes the nearest alternative wrong.",
      drill: {
        title: "Challenge-the-answer set",
        instructions: "Complete 6 questions. For every high-confidence choice, spend five seconds identifying the strongest competing answer and rejecting it explicitly.",
        target: "No more than 1 high-confidence miss",
      },
    };
  }

  if (secondHalf.length >= 3 && firstAccuracy - secondAccuracy >= 0.25) {
    return {
      bottleneck: "endurance",
      title: "Protect accuracy late in the test",
      evidence: [
        `Accuracy fell from ${Math.round(firstAccuracy * 100)}% in the first half to ${Math.round(secondAccuracy * 100)}% in the second half.`,
        `${secondHalf.filter((review) => !review.isCorrect).length} second-half questions were missed or skipped.`,
      ],
      strategy: "Reset at the halfway point: release the previous question, check the clock once, and begin the next item with a fresh read.",
      drill: {
        title: "Back-half accuracy set",
        instructions: "Run 10 questions without review. Treat questions 6–10 as the scored segment and use a deliberate five-second midpoint reset.",
        target: "Second-half accuracy within 10 points of first-half accuracy",
      },
    };
  }

  if (weakest && weakest.correct / weakest.total < 0.7) {
    return {
      bottleneck: "category",
      title: `Strengthen ${weakest.category.toLowerCase()} reasoning`,
      evidence: [
        `${weakest.correct} of ${weakest.total} ${weakest.category.toLowerCase()} questions were correct.`,
        `This was your lowest-performing measured category.`,
      ],
      strategy: "Practice one reasoning pattern at a time, name the pattern before solving, and compare your method with the verified solution.",
      drill: {
        title: `${weakest.category} pattern drill`,
        instructions: `Complete 8 untimed ${weakest.category.toLowerCase()} questions, labeling the governing pattern before calculating or choosing an answer.`,
        target: "At least 7 of 8 correct before adding time pressure",
      },
    };
  }

  return {
    bottleneck: "refinement",
    title: "Practice under sustained time pressure",
    evidence: [
      `You answered ${result.correct} of ${result.total} correctly.`,
      `${Math.round(result.paceScore * 100)}% of decisions were within target pace.`,
    ],
    strategy: "Preserve your current method while increasing the length of timed sets. Review only changed answers, slow correct answers, and confident misses.",
    drill: {
      title: "Full-rhythm mixed set",
      instructions: "Complete 12 mixed questions at test pace without pausing, then review the three highest-information decisions.",
      target: "Maintain accuracy and pace across the full set",
    },
  };
}

function accuracy(reviews: QuestionReview[]) {
  return reviews.length ? reviews.filter((review) => review.isCorrect).length / reviews.length : 0;
}

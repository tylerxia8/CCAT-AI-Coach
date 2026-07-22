import { QUESTIONS, type QuestionReview as Review } from "@/lib/diagnostic";

function confidenceLabel(value: Review["confidence"]) {
  if (value === 3) return "High confidence";
  if (value === 2) return "Medium confidence";
  if (value === 1) return "Low confidence";
  return "No confidence rating";
}

export function QuestionReview({ reviews }: { reviews: Review[] }) {
  return (
    <section className="review-section">
      <div className="review-heading">
        <div><div className="section-label">Verified review</div><h2>Learn from each decision.</h2></div>
        <p>All answer options, correct answers, and explanations are released only after the diagnostic is complete.</p>
      </div>
      <div className="review-list">
        {reviews.map((review, index) => {
          const choices = review.choices ?? QUESTIONS.find((question) => question.id === review.questionId)?.choices;
          return (
          <details className={`review-item ${review.isCorrect ? "correct" : "incorrect"}`} key={review.questionId}>
            <summary>
              <span className="review-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="review-summary"><small>{review.category} · {review.skill}</small><strong>{review.prompt}</strong></span>
              <span className="review-outcome">{review.isCorrect ? "Correct" : review.selectedAnswer ? "Review" : "Skipped"}</span>
            </summary>
            <div className="review-body">
              <div className="answer-grid">
                <div><small>Your answer</small><strong>{review.selectedAnswer ?? "No answer"}</strong></div>
                <div><small>Correct answer</small><strong>{review.correctAnswer}</strong></div>
              </div>
              {choices?.length ? (
                <div className="review-options" aria-label="All answer options">
                  <div className="review-options-title">All answer options</div>
                  <ol>
                    {choices.map((choice, choiceIndex) => {
                      const isCorrect = choice === review.correctAnswer;
                      const isSelected = choice === review.selectedAnswer;
                      const label = isCorrect && isSelected ? "Your answer · Correct" : isCorrect ? "Correct answer" : isSelected ? "Your answer · Incorrect" : "Incorrect option";
                      return <li className={isCorrect ? "correct" : isSelected ? "selected-wrong" : "incorrect"} key={`${choiceIndex}-${choice}`}><span>{String.fromCharCode(65 + choiceIndex)}</span><strong>{choice}</strong><small>{label}</small></li>;
                    })}
                  </ol>
                </div>
              ) : null}
              <p>{review.explanation}</p>
              <div className="review-signals">
                <span>{review.elapsedSeconds}s taken · {review.targetSeconds}s target</span>
                <span className={review.pace === "slow" ? "signal-warn" : ""}>{review.pace === "slow" ? "Slower than target" : review.pace === "unanswered" ? "No timing recorded" : "On-target pace"}</span>
                <span>{confidenceLabel(review.confidence)}</span>
                <span>{review.answerChanges ? `${review.answerChanges} answer change${review.answerChanges === 1 ? "" : "s"}` : "No answer changes"}</span>
                <span>{review.viewCount > 1 ? `${review.viewCount} visits` : "Answered in one visit"}</span>
                {review.firstAnswerCorrect === true && !review.isCorrect && <span>Correct first choice changed to wrong</span>}
              </div>
            </div>
          </details>
          );
        })}
      </div>
    </section>
  );
}

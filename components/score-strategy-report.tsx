import type { QuestionReview } from "@/lib/diagnostic";
import { analyzeStrategy } from "@/lib/score-improvement";

export function ScoreStrategyReport({ reviews, allottedSeconds = 900 }: { reviews: QuestionReview[]; allottedSeconds?: number }) {
  const analysis = analyzeStrategy(reviews, allottedSeconds);
  return <section className="strategy-report" aria-labelledby="strategy-title">
    <div><div className="section-label">Score strategy</div><h2 id="strategy-title">Turn your time into more points.</h2><p>{analysis.prescription}</p></div>
    <div className="strategy-metrics">
      <article><small>Score efficiency</small><strong>{analysis.correctPerMinute.toFixed(1)}</strong><span>correct per minute</span></article>
      <article><small>Recoverable estimate</small><strong>+{analysis.recoverablePoints}</strong><span>points from long misses</span></article>
      <article><small>Readiness range</small><strong>{analysis.forecastLow}–{analysis.forecastHigh}</strong><span>practice estimate, not an official score</span></article>
      <article><small>Confidence calibration</small><strong>{analysis.highConfidenceWrong}</strong><span>confident misses · {analysis.lowConfidenceRight} uncertain wins</span></article>
    </div>
    <div className="checkpoint-grid">{analysis.checkpoints.map((checkpoint) => <article key={checkpoint.label}><strong>{checkpoint.label}</strong><span>{checkpoint.correct}/{checkpoint.total} correct</span><small>{checkpoint.seconds}s used</small></article>)}</div>
    <p className="strategy-detail">Projected reach at this cadence: about {analysis.projectedAttempts} of 50 questions. Signals: {analysis.slowMisses} long misses, {analysis.rushedMisses} rushed misses, and {analysis.changedFromCorrect} correct first answers changed.</p>
  </section>;
}

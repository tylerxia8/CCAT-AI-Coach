# CCAT AI Coach

An instrumented CCAT-style preparation platform focused on diagnosing and improving execution bottlenecks such as pacing, hesitation, reading efficiency, confidence calibration, and fatigue.

## Product direction

The initial product will prove one complete learning loop:

1. Timed baseline diagnostic
2. Evidence-based diagnostic report
3. Targeted practice and pacing drills
4. Structured coaching intervention
5. Equivalent reassessment
6. Before-and-after progress reporting

Scoring, timing metrics, and diagnostic evidence remain deterministic. AI converts verified findings into clear explanations and coaching, but does not determine scores or invent findings.

## Initial delivery phases

- **Foundation:** test blueprint, content taxonomy, original question bank, and equivalent assessment forms
- **Practice engine:** authentication, timed sessions, deterministic scoring, telemetry, and review
- **Diagnostic coach:** rules-based findings plus structured AI explanations
- **Adaptive loop:** personalized drills, pacing interventions, study plans, and reassessment
- **Closed beta:** validate score improvement, recommendation quality, content quality, latency, and cost

## Proposed stack

- Next.js, React, and TypeScript
- Supabase Auth and PostgreSQL
- OpenAI API through a versioned AI gateway
- PostHog analytics
- LangSmith tracing where useful
- GitHub Actions for linting, tests, prompt evaluations, and deployment

The architecture will begin as a modular application rather than a multi-agent system. LangGraph can be introduced later for workflows that genuinely require branching, retries, or multi-step verification.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Repository status

The first vertical slice is implemented: a responsive timed diagnostic, deterministic scoring, pace and confidence analysis, category performance, and an initial coaching recommendation. In-progress sessions and behavioral events persist locally across refreshes. The repository includes a Supabase-ready schema, passwordless email authentication, authenticated attempt and telemetry synchronization, an immutable seeded diagnostic form, database-enforced correctness, server-side session finalization, and row-level security.

Answer keys and explanations are excluded from the browser bundle. Completed attempts are validated and scored through a server-only endpoint before results are displayed.

After scoring, learners receive a verified question-by-question review showing their answer, the correct answer, explanation, pace against target, and confidence rating.

The deterministic coaching engine classifies knowledge, rushing, speed, cadence, second-guessing, and general refinement. It retains first-choice outcomes, first-selection latency, cumulative time across revisits, and visit counts so it can distinguish productive corrections from correct-to-wrong changes. Rushing uses very fast misses, confidence, and consecutive fast-error evidence rather than treating every quick mistake as a knowledge gap. Results include skill-level accuracy, pace, and decision-change evidence, and every recommendation includes a measurable next drill.

Prescribed drills open a separate eight-question practice set with per-question pace targets. Answers are checked on the server, and verified corrective feedback is released only after each answer is committed.

The primary diagnostic is a 50-question, 15-minute assessment governed by a tested content blueprint: 15 verbal items, 25 math-and-logic items, and 10 spatial items across 17 supported item families. Every item is original practice content; it is not an official CCAT exam and does not reproduce proprietary assessment questions.

The current form deliberately includes a demanding difficulty curve—8 entry, 28 intermediate, and 14 advanced items—so stronger candidates encounter multi-rule and multi-step questions rather than a bank dominated by one-step exercises.

Math-and-logic coverage includes responsive bar-chart, line-graph, table, and pie-chart interpretation items. The bank also covers single- and double-blank sentence completion using context clues, exact-match attention, letter series, and reflection. Every item is original and uses common CCAT-style formats rather than copied proprietary questions. Visual data is represented as structured application data and rendered accessibly rather than stored as opaque screenshots.

Active drills resume after refresh with committed feedback intact. Completed drills are recorded idempotently, and drill count and aggregate practice accuracy appear on the progress dashboard.

The latest diagnostic generates a persistent five-session study plan tailored to the detected bottleneck: learn the intervention, apply it at pace, review high-information decisions, complete mixed practice, and reassess against a fresh baseline.

The results experience also maintains conservative skill-mastery estimates from accuracy and pace evidence, selects one highest-value next activity with an explicit advancement criterion, and keeps the full diagnostic evidence collapsed until requested. The progress dashboard carries forward only the three highest curriculum priorities so the interface stays focused.

An additional original Form B practice test provides 20 mixed verbal, numerical, logic, and spatial questions. Learners can choose a six-minute simulation or a self-paced guided mode with question-family strategy cues. Its structure was informed by publicly visible CCAT practice-test format patterns, while all prompts, options, answer keys, and explanations were independently authored. It uses server-only scoring and releases review explanations only after completion.

Form B is difficulty-ramped and gives compact phase guidance during timed work: bank straightforward points early with a verification beat, maintain the 18-second rhythm through the middle, and invest selectively on the hardest closing items. Guided cues teach first-difference checks for series, relationship sentences for analogies, feature isolation for abstract items, and symbolic ordering for logic.

Guided mode also supports explicit answer elimination. Learners can cross out options while applying a hypothesis–verify–eliminate protocol for abstract patterns, place-value comparison for decimals, and estimation anchors for percentages. Elimination remains a learning aid and does not contaminate timed-mode behavioral measurements.

Timed forms produce a conservative practice-readiness indicator based on accuracy, on-target pace, confidence calibration, and evidence volume. It is explicitly a training signal—not a hiring-score or pass prediction—and always provides the next measurable evidence gate.

Completed results are stored idempotently in versioned local history. The progress dashboard shows accuracy change from baseline, current pace and confidence fit, cumulative category performance, session trends, and recurring bottlenecks.

When Supabase is configured and the learner is signed in, compact result summaries synchronize to the account and merge into the dashboard across devices. Browser history remains available if cloud access is unavailable.

Run the complete local quality gate with `npm run check`. The same test, lint, build, client-bundle privacy scan, and dependency audit run in GitHub Actions on every pull request and push to `main`.

Runtime hardening includes centralized browser security headers, disabled framework identification, non-cacheable private API responses, and a privacy-safe `/api/health` liveness endpoint.

The settings page lets learners inspect stored data groups, export a versioned JSON copy, clear application-owned data from the current browser, and sign out of a configured cloud account.

Signed-in learners can also delete their synchronized learning records through an authenticated, least-privilege database function. This removes activity data while deliberately keeping identity deletion as a separate privileged operation.

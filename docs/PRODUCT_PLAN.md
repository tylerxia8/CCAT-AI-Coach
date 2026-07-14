# Product Plan

## Product thesis

CCAT AI Coach should identify how a learner loses points, prioritize the highest-impact bottleneck, and prescribe a focused intervention whose effect can be measured in a subsequent assessment.

## MVP scope

### Baseline diagnostic

- Timed, representative assessment
- Deterministic scoring
- Per-question timing, skips, answer changes, and confidence

### Diagnostic report

- Accuracy by category and difficulty
- Pace distribution
- Correct-but-slow and fast-but-wrong patterns
- Knowledge versus execution findings
- One or two prioritized weaknesses

### Targeted practice

- Category and difficulty drills
- Timed pacing drills
- Verified solutions
- Confidence capture
- Interpretable, rules-based question selection

### Coaching intervention

- Evidence-based observation
- One specific strategy
- A drill applying the strategy
- A measurable completion target

### Reassessment and progress

- Equivalent, non-overlapping assessment form
- Before-and-after comparison
- Updated recommendation
- Score, accuracy, timing, and study-plan trends

## Explicitly deferred

- Learner-facing generated questions
- Autonomous multi-agent orchestration
- Notifications
- Advanced retention mechanics
- Enterprise dashboards
- Expansion to other assessments

## Phase gates

### Phase 0: content foundation

Deliver a test blueprint, operational error taxonomy, authoring standard, reviewed initial question bank, and two equivalent assessment forms.

### Phase 1: instrumented practice engine

Deliver timed assessment and practice flows, deterministic scoring, attempt persistence, telemetry, verified review, and internal content administration.

### Phase 2: diagnostic coach

Deliver deterministic behavioral findings and structured AI explanations. Expert reviewers should consider at least 80% of recommendations appropriate and actionable.

### Phase 3: adaptive study loop

Deliver personalized daily plans, interpretable question selection, spaced review, pacing interventions, and reassessment.

### Phase 4: closed beta

Test with 50-100 candidates and evaluate adjusted score improvement, drill completion, recommendation acceptance, question disputes, factual errors, latency, and cost.

## Primary risks

- Incorrect or ambiguous content
- Non-equivalent assessment forms
- Behavioral overdiagnosis from weak evidence
- Premature AI and orchestration complexity
- Branding and content-rights exposure
- Timing distortion from interruptions or device differences
- Unsupported score or employment claims

## First engineering epics

1. Test blueprint and content taxonomy
2. Question authoring, versioning, and review
3. Assessment-form construction
4. Timed exam experience
5. Deterministic scoring and reconstruction
6. Behavioral telemetry
7. Diagnostic rules engine
8. Verified solution and review experience
9. Targeted practice and study plans
10. Reassessment and outcome analytics


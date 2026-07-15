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

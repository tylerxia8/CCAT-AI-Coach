# Data Model

The initial migration is in `supabase/migrations/0001_initial_schema.sql`.

## Design principles

- Published questions are immutable through versioned content records.
- Assessment forms point to exact question versions so historical scores remain reproducible.
- Sessions and attempts store deterministic scoring outputs and the scoring-policy version.
- Raw telemetry remains separate from derived diagnostics.
- Learners can access only their own sessions, attempts, telemetry, and profiles.
- Public clients can read only published question content and active assessment forms.

## Local-first bridge

Until a Supabase project is configured, the browser stores the active diagnostic and its event stream under a versioned local-storage key. The storage adapter validates saved data before restoring it. This keeps the product testable without cloud credentials and establishes a payload that can later be synchronized to Supabase.

## Next data tasks

1. Provision development and production Supabase projects.
2. Configure email authentication and profile creation.
3. Restrict content authoring to explicit admin roles.
4. Add database tests for row-level security and score reconstruction.
5. Replace the in-repository preview bank with database-backed assessment delivery.

## Scoring integrity

Migration `0002_seed_diagnostic_and_score.sql` seeds an immutable diagnostic form and adds two database controls. A trigger calculates attempt correctness from the stored question version, ignoring any client-provided correctness value. The authenticated `finalize_session` function then derives the session score only from persisted attempts owned by the current user.

The browser bundle contains only prompts, choices, difficulty, and target pace. The private answer bank is imported only by the server scoring route. That route validates question IDs, answer ranges, timing bounds, confidence values, and duplicate attempts before returning a diagnostic result.

Before submission, the browser normalizes the form to exactly one record per question, explicitly representing omissions. The scoring endpoint rejects partial forms, missing records, extra records, and duplicates; answer-bearing responses use private `no-store` cache headers.

Migration `0003_diagnostic_results.sql` stores a compact, user-owned result summary after server finalization. The authenticated progress endpoint validates these rows before merging them into versioned browser history, allowing the dashboard to work across devices while retaining an offline/local fallback.

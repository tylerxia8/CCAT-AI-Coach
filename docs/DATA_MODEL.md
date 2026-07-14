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
3. Add server-side session synchronization with idempotency keys.
4. Seed reviewed question versions and an active diagnostic form.
5. Restrict content authoring to explicit admin roles.
6. Add database tests for row-level security and score reconstruction.

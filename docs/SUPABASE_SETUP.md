# Supabase Setup

## Project configuration

1. Create separate Supabase projects for development and production.
2. Apply `supabase/migrations/0001_initial_schema.sql` through the Supabase CLI or SQL editor.
3. Copy `.env.example` to `.env.local` and add the project URL and anonymous key.
4. In Authentication URL Configuration, add the local callback `http://localhost:3000/auth/callback` and the production callback.
5. Enable email one-time-password authentication and customize the email template before inviting pilot users.

## Current synchronization behavior

- Without environment values, sessions remain in versioned browser storage.
- With Supabase configured but no authenticated user, completed results invite the learner to sign in.
- After authentication, the completed session and its telemetry events are upserted using stable client-generated IDs.
- Question-level attempts are mapped to immutable database versions and synchronized before the database finalizes the score.

## Security checks before production

- Run automated row-level-security tests with two distinct users.
- Restrict question and form authoring to an explicit admin role.
- Set production redirect URLs exactly; do not use wildcard hosts.
- Configure rate limits and bot protection for email authentication.
- Confirm that the browser receives only the anonymous key, never a service-role key.
- Apply and test the authenticated `delete_my_learning_data` function with two users, confirming that one user cannot affect the other's records.
- Implement privileged Supabase Auth identity deletion separately if the product offers full account deletion.

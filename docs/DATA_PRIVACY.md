# Learner Data and Privacy

## Data stored in the browser

- Active diagnostic state and behavioral events
- Diagnostic result history
- Active practice state and released feedback
- Practice completion history
- Study-plan completion state

The settings page can export these application-owned records as versioned JSON or remove them from the current device. Removal is scoped to known application keys and does not clear unrelated browser storage.

## Optional cloud data

When Supabase is configured and the learner signs in, the application can store the account email, completed sessions, attempts, telemetry, and compact diagnostic summaries. Row-level security restricts learner-facing access to the authenticated owner.

Clearing a device does not delete synchronized cloud data. Signed-in learners can separately invoke `delete_my_learning_data`, which removes their telemetry, sessions, cascading attempts and diagnostic summaries, and profile under their own authenticated database permissions. It does not delete the Supabase Auth identity; full identity deletion requires a privileged server-side workflow and a documented retention schedule before production launch.

## Interpretation boundary

Timing, confidence, accuracy, and coaching classifications are educational signals. They must not be represented as medical, psychological, hiring, or employment decisions. Avoid collecting employer names, application outcomes, demographic attributes, or other unnecessary personal information in the MVP.

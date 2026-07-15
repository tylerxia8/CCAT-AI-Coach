alter table public.attempts
  add column if not exists first_answer_index integer check (first_answer_index between 0 and 4),
  add column if not exists first_answer_seconds integer check (first_answer_seconds >= 0),
  add column if not exists view_count integer not null default 1 check (view_count >= 1);

comment on column public.attempts.first_answer_index is 'First selected choice, retained separately from the submitted choice to measure change quality.';
comment on column public.attempts.first_answer_seconds is 'Seconds from the start of the first view until the first selection.';
comment on column public.attempts.view_count is 'Number of times the learner opened the item during the session.';

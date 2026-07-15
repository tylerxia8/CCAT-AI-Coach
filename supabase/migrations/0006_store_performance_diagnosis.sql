alter table public.diagnostic_results
  add column if not exists primary_cause text,
  add column if not exists weakest_skill text,
  add column if not exists diagnosis jsonb;

alter table public.diagnostic_results
  add constraint diagnostic_results_primary_cause_check
  check (primary_cause is null or primary_cause in ('knowledge', 'speed', 'rhythm', 'second_guessing', 'refinement'));

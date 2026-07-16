alter table public.diagnostic_results
  drop constraint if exists diagnostic_results_primary_cause_check;

alter table public.diagnostic_results
  add constraint diagnostic_results_primary_cause_check
  check (primary_cause is null or primary_cause in ('knowledge', 'rushing', 'speed', 'rhythm', 'second_guessing', 'refinement'));

create table public.diagnostic_results (
  session_id uuid primary key references public.sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  correct integer not null check (correct >= 0),
  total integer not null check (total > 0 and correct <= total),
  accuracy double precision not null check (accuracy between 0 and 1),
  average_seconds integer not null check (average_seconds >= 0),
  pace_score double precision not null check (pace_score between 0 and 1),
  confidence_score double precision not null check (confidence_score between 0 and 1),
  category_results jsonb not null check (jsonb_typeof(category_results) = 'array'),
  bottleneck text not null check (bottleneck in ('pacing', 'confidence', 'category', 'endurance', 'refinement')),
  coaching_title text not null,
  completed_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index diagnostic_results_user_completed_idx
  on public.diagnostic_results(user_id, completed_at desc);

alter table public.diagnostic_results enable row level security;

create policy "users read own diagnostic results"
on public.diagnostic_results for select
using (auth.uid() = user_id);

create policy "users insert own diagnostic results"
on public.diagnostic_results for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.sessions s
    where s.id = session_id and s.user_id = auth.uid()
  )
);

create policy "users update own diagnostic results"
on public.diagnostic_results for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

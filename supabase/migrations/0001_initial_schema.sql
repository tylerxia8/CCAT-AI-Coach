create extension if not exists pgcrypto;

create type public.session_mode as enum ('diagnostic', 'practice', 'mock', 'reassessment');
create type public.session_status as enum ('active', 'completed', 'abandoned');
create type public.question_status as enum ('draft', 'review', 'published', 'retired');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null,
  status public.question_status not null default 'draft',
  current_version integer not null default 1 check (current_version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.question_versions (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  version integer not null check (version > 0),
  stem text not null,
  choices jsonb not null check (jsonb_typeof(choices) = 'array'),
  correct_index integer not null check (correct_index >= 0),
  explanation text not null,
  difficulty smallint not null check (difficulty between 1 and 3),
  target_seconds integer not null check (target_seconds > 0),
  authored_by uuid references auth.users(id),
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (question_id, version)
);

create table public.assessment_forms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  version integer not null default 1,
  time_limit_seconds integer not null check (time_limit_seconds > 0),
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.assessment_form_items (
  form_id uuid not null references public.assessment_forms(id) on delete cascade,
  question_version_id uuid not null references public.question_versions(id),
  position integer not null check (position > 0),
  primary key (form_id, position),
  unique (form_id, question_version_id)
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  form_id uuid references public.assessment_forms(id),
  mode public.session_mode not null,
  status public.session_status not null default 'active',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer,
  raw_score integer,
  total_questions integer,
  scoring_version text not null default 'v1'
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  question_version_id uuid not null references public.question_versions(id),
  answer_index integer,
  is_correct boolean,
  elapsed_seconds integer not null check (elapsed_seconds >= 0),
  confidence smallint check (confidence between 1 and 3),
  answer_changes integer not null default 0 check (answer_changes >= 0),
  submitted_at timestamptz not null default now(),
  unique (session_id, question_version_id)
);

create table public.telemetry_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete cascade,
  event_name text not null,
  event_version integer not null default 1,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index attempts_session_id_idx on public.attempts(session_id);
create index sessions_user_started_idx on public.sessions(user_id, started_at desc);
create index telemetry_session_occurred_idx on public.telemetry_events(session_id, occurred_at);

alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.question_versions enable row level security;
alter table public.assessment_forms enable row level security;
alter table public.assessment_form_items enable row level security;
alter table public.sessions enable row level security;
alter table public.attempts enable row level security;
alter table public.telemetry_events enable row level security;

create policy "users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "published questions are readable" on public.questions for select using (status = 'published');
create policy "published question versions are readable" on public.question_versions for select using (
  exists (select 1 from public.questions q where q.id = question_id and q.status = 'published')
);
create policy "active forms are readable" on public.assessment_forms for select using (is_active);
create policy "active form items are readable" on public.assessment_form_items for select using (
  exists (select 1 from public.assessment_forms f where f.id = form_id and f.is_active)
);
create policy "users manage own sessions" on public.sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage attempts in own sessions" on public.attempts for all using (
  exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid())
) with check (
  exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid())
);
create policy "users manage own telemetry" on public.telemetry_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


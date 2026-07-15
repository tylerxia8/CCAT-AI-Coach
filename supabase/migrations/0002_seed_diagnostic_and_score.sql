-- Stable IDs allow the application fixture and database seed to reference the same immutable versions.
insert into public.questions (id, slug, category, status, current_version) values
  ('00000000-0000-4000-8000-000000000101', 'num-01', 'Numerical', 'published', 1),
  ('00000000-0000-4000-8000-000000000102', 'ver-01', 'Verbal', 'published', 1),
  ('00000000-0000-4000-8000-000000000103', 'log-01', 'Logic', 'published', 1),
  ('00000000-0000-4000-8000-000000000104', 'num-02', 'Numerical', 'published', 1),
  ('00000000-0000-4000-8000-000000000105', 'spa-01', 'Spatial', 'published', 1),
  ('00000000-0000-4000-8000-000000000106', 'ver-02', 'Verbal', 'published', 1),
  ('00000000-0000-4000-8000-000000000107', 'log-02', 'Logic', 'published', 1),
  ('00000000-0000-4000-8000-000000000108', 'num-03', 'Numerical', 'published', 1)
on conflict (id) do nothing;

insert into public.question_versions
  (id, question_id, version, stem, choices, correct_index, explanation, difficulty, target_seconds, verified_at)
values
  ('10000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000101', 1,
   'A team completes 3 reports every 8 hours. At the same rate, how many reports will it complete in 40 hours?',
   '["10","12","15","18","24"]', 2, 'Forty hours contains five 8-hour blocks. Five blocks multiplied by 3 reports equals 15.', 1, 36, now()),
  ('10000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000102', 1,
   'FRAIL is to STURDY as SCARCE is to:',
   '["Rare","Plentiful","Costly","Hidden","Fragile"]', 1, 'Frail and sturdy are opposites. Scarce and plentiful have the same opposite relationship.', 1, 24, now()),
  ('10000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000103', 1,
   'All Kems are Rals. No Rals are Tovs. Which statement must be true?',
   '["No Kems are Tovs","Some Kems are Tovs","All Tovs are Kems","No Kems are Rals","Some Rals are not Kems"]', 0, 'Because every Kem is a Ral and no Ral can be a Tov, no Kem can be a Tov.', 2, 38, now()),
  ('10000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000104', 1,
   'What number comes next? 4, 7, 13, 25, 49, ?',
   '["73","81","89","97","101"]', 3, 'Each number is the previous number doubled minus 1. Therefore, 49 × 2 − 1 = 97.', 2, 34, now()),
  ('10000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000105', 1,
   'An arrow points north. It rotates 90° clockwise, then 180° counterclockwise. Which direction does it point?',
   '["North","Northeast","East","South","West"]', 4, 'North rotated clockwise 90° becomes east. East rotated counterclockwise 180° becomes west.', 1, 26, now()),
  ('10000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000106', 1,
   'Choose the word that does not belong with the others.',
   '["Conclude","Infer","Deduce","Observe","Reason"]', 3, 'Conclude, infer, deduce, and reason involve deriving a judgment. Observe means to notice directly.', 2, 28, now()),
  ('10000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000107', 1,
   'If the first two statements are true, is the final statement true? Liam is older than Noor. Noor is older than Priya. Priya is older than Liam.',
   '["True","False","Uncertain","Only sometimes","Not enough information"]', 1, 'The first two statements establish Liam > Noor > Priya, so Priya cannot be older than Liam.', 1, 25, now()),
  ('10000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000108', 1,
   'A jacket priced at $80 is discounted by 25%, then the sale price is increased by 10%. What is the final price?',
   '["$60","$64","$66","$68","$70"]', 2, 'The discounted price is $60. Increasing $60 by 10% adds $6, producing a final price of $66.', 3, 42, now())
on conflict (id) do nothing;

insert into public.assessment_forms (id, slug, title, version, time_limit_seconds, is_active)
values ('20000000-0000-4000-8000-000000000001', 'diagnostic-full-v1', 'Full Diagnostic', 1, 900, true)
on conflict (id) do update set is_active = excluded.is_active;

insert into public.assessment_form_items (form_id, question_version_id, position) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000101', 1),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000102', 2),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000103', 3),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000104', 4),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000105', 5),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000106', 6),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000107', 7),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000108', 8)
on conflict (form_id, position) do nothing;

-- The database, not the browser, owns correctness.
create or replace function public.set_attempt_correctness()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare expected_index integer;
begin
  select correct_index into expected_index
  from public.question_versions
  where id = new.question_version_id;
  if not found then raise exception 'Unknown question version'; end if;
  new.is_correct := new.answer_index is not null and new.answer_index = expected_index;
  return new;
end;
$$;

drop trigger if exists attempts_set_correctness on public.attempts;
create trigger attempts_set_correctness
before insert or update of answer_index, question_version_id on public.attempts
for each row execute function public.set_attempt_correctness();

create or replace function public.finalize_session(target_session_id uuid)
returns table (raw_score integer, total_questions integer)
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.sessions where id = target_session_id and user_id = auth.uid()
  ) then raise exception 'Session not found'; end if;

  update public.sessions s
  set status = 'completed',
      completed_at = coalesce(s.completed_at, now()),
      raw_score = (select count(*)::integer from public.attempts a where a.session_id = s.id and a.is_correct),
      total_questions = (select count(*)::integer from public.attempts a where a.session_id = s.id)
  where s.id = target_session_id;

  return query select s.raw_score, s.total_questions from public.sessions s where s.id = target_session_id;
end;
$$;

revoke all on function public.finalize_session(uuid) from public;
grant execute on function public.finalize_session(uuid) to authenticated;

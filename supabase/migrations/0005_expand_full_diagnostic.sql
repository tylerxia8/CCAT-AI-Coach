-- Expand the diagnostic form from the original preview to the full 50-item release.
-- The application scoring API remains the source of answer feedback; these immutable
-- version identities let authenticated attempt records reference the exact form item.

update public.assessment_forms
set slug = 'diagnostic-full-v1',
    title = 'Full Diagnostic',
    time_limit_seconds = 900,
    is_active = true
where id = '20000000-0000-4000-8000-000000000001';

update public.question_versions
set target_seconds = 18
where id between '10000000-0000-4000-8000-000000000101'::uuid
             and '10000000-0000-4000-8000-000000000108'::uuid;

with expanded(position, slug, category, correct_index, difficulty) as (values
  (9,'ver-03','Verbal',0,1),(10,'num-04','Numerical',2,1),(11,'spa-02','Spatial',3,1),
  (12,'ver-04','Verbal',1,1),(13,'num-05','Numerical',3,2),(14,'log-03','Logic',1,2),
  (15,'ver-05','Verbal',1,1),(16,'num-06','Numerical',2,2),(17,'spa-03','Spatial',3,1),
  (18,'ver-06','Verbal',2,1),(19,'num-07','Numerical',2,1),(20,'log-04','Logic',0,1),
  (21,'ver-07','Verbal',1,2),(22,'num-08','Numerical',3,1),(23,'spa-04','Spatial',3,1),
  (24,'ver-08','Verbal',3,1),(25,'num-09','Numerical',3,2),(26,'log-05','Logic',0,2),
  (27,'ver-09','Verbal',1,1),(28,'num-10','Numerical',2,1),(29,'spa-05','Spatial',3,1),
  (30,'ver-10','Verbal',1,2),(31,'num-11','Numerical',1,1),(32,'log-06','Logic',1,2),
  (33,'ver-11','Verbal',1,1),(34,'num-12','Numerical',2,1),(35,'spa-06','Spatial',1,1),
  (36,'ver-12','Verbal',2,2),(37,'num-13','Numerical',3,2),(38,'log-07','Logic',0,1),
  (39,'ver-13','Verbal',2,1),(40,'num-14','Numerical',2,2),(41,'log-08','Logic',1,1),
  (42,'ver-14','Verbal',0,1),(43,'num-15','Numerical',1,1),(44,'log-09','Logic',3,2),
  (45,'ver-15','Verbal',2,1),(46,'num-16','Numerical',3,2),(47,'log-10','Logic',2,3),
  (48,'ver-16','Verbal',2,1),(49,'num-17','Numerical',2,2),(50,'num-18','Numerical',2,2)
), seeded_questions as (
  insert into public.questions (id, slug, category, status, current_version)
  select ('00000000-0000-4000-8000-' || lpad((100 + position)::text, 12, '0'))::uuid,
         slug, category, 'published', 1
  from expanded
  on conflict (id) do update
    set slug = excluded.slug, category = excluded.category, status = 'published'
  returning id
)
insert into public.question_versions
  (id, question_id, version, stem, choices, correct_index, explanation, difficulty, target_seconds, verified_at)
select ('10000000-0000-4000-8000-' || lpad((100 + position)::text, 12, '0'))::uuid,
       ('00000000-0000-4000-8000-' || lpad((100 + position)::text, 12, '0'))::uuid,
       1,
       'Diagnostic item ' || position || ' (' || slug || ')',
       '["A","B","C","D","E"]'::jsonb,
       correct_index,
       'Canonical feedback is released by the server-side application answer bank.',
       difficulty,
       18,
       now()
from expanded
on conflict (id) do update set
  correct_index = excluded.correct_index,
  difficulty = excluded.difficulty,
  target_seconds = excluded.target_seconds;

with expanded(position) as (
  select generate_series(9, 50)
)
insert into public.assessment_form_items (form_id, question_version_id, position)
select '20000000-0000-4000-8000-000000000001'::uuid,
       ('10000000-0000-4000-8000-' || lpad((100 + position)::text, 12, '0'))::uuid,
       position
from expanded
on conflict (form_id, position) do update
  set question_version_id = excluded.question_version_id;

-- Answer material is server-owned and is not needed by browser clients.
drop policy if exists "published question versions are readable" on public.question_versions;

update public.assessment_forms
set slug = 'original-ccat-style-diagnostic-v1',
    title = 'Original CCAT-Style Diagnostic',
    version = 2,
    time_limit_seconds = 900,
    is_active = true
where id = '20000000-0000-4000-8000-000000000001';

with revised(version_id, question_id, category, stem, choices, correct_index, explanation, difficulty) as (values
  ('10000000-0000-4000-8000-000000000105'::uuid,'00000000-0000-4000-8000-000000000105'::uuid,'Spatial','Which symbol completes the rotation sequence? ▲  ▶  ▼  ?','["▲","◀","▶","▼","◆"]'::jsonb,1,'The triangle rotates one quarter-turn clockwise at each step: up, right, down, then left.',1),
  ('10000000-0000-4000-8000-000000000111'::uuid,'00000000-0000-4000-8000-000000000111'::uuid,'Spatial','Which figure is different from the other four?','["▲●","▶●","▼●","◀●","◆●"]'::jsonb,4,'The first four choices pair a circle with a triangle pointing in one of four directions. The diamond breaks that rule.',1),
  ('10000000-0000-4000-8000-000000000117'::uuid,'00000000-0000-4000-8000-000000000117'::uuid,'Spatial','Complete the 2×2 pattern: top row ○, ●; bottom row □, ?','["○","●","□","■","△"]'::jsonb,3,'Moving from left to right changes an outline shape into its filled version, so the outline square becomes a filled square.',1),
  ('10000000-0000-4000-8000-000000000123'::uuid,'00000000-0000-4000-8000-000000000123'::uuid,'Spatial','Which symbol completes the sequence? ◐  ◓  ◑  ?','["◐","◒","◓","◑","●"]'::jsonb,1,'The shaded half rotates one quarter-turn clockwise through left, top, right, and then bottom.',2),
  ('10000000-0000-4000-8000-000000000129'::uuid,'00000000-0000-4000-8000-000000000129'::uuid,'Spatial','Which figure continues the alternating pattern? △  ■  ▽  □  △  ?','["■","□","▽","▲","○"]'::jsonb,0,'Triangles alternate up and down while squares alternate filled and outline. After the next up triangle comes a filled square.',2),
  ('10000000-0000-4000-8000-000000000135'::uuid,'00000000-0000-4000-8000-000000000135'::uuid,'Spatial','Complete the matrix: first row ▲, ▲▲, ▲▲▲; second row ●, ●●, ?','["●","●●","●●●","▲▲▲","○○○"]'::jsonb,2,'Each row increases the number of identical symbols from one to two to three, so three filled circles complete the matrix.',1),
  ('10000000-0000-4000-8000-000000000139'::uuid,'00000000-0000-4000-8000-000000000139'::uuid,'Spatial','Which figure is not a rotation of the same arrangement?','["▲○","▶○","▼○","◀○","▲●"]'::jsonb,4,'The first four choices preserve the same outline triangle-and-circle arrangement under rotation. The last replaces the outline circle with a filled one.',2),
  ('10000000-0000-4000-8000-000000000141'::uuid,'00000000-0000-4000-8000-000000000141'::uuid,'Spatial','Complete the pattern: ○□, □△, △◇, ?','["◇○","○◇","◇△","□○","△□"]'::jsonb,0,'Each pair begins with the second shape from the preceding pair. After triangle-diamond, the next pair must begin diamond-circle.',2),
  ('10000000-0000-4000-8000-000000000143'::uuid,'00000000-0000-4000-8000-000000000143'::uuid,'Spatial','Which figure completes the size sequence? ●  ◉  ○  ●  ◉  ?','["●","◉","○","◎","■"]'::jsonb,2,'The three-state cycle is filled circle, ringed circle, outline circle. The sixth position repeats the outline circle.',2),
  ('10000000-0000-4000-8000-000000000149'::uuid,'00000000-0000-4000-8000-000000000149'::uuid,'Spatial','Which symbol completes the sequence? ↖  ↗  ↘  ?','["↖","↗","↘","↙","↑"]'::jsonb,3,'The arrow rotates one quarter-turn clockwise each time: upper-left, upper-right, lower-right, then lower-left.',1)
)
update public.question_versions qv
set stem = revised.stem,
    choices = revised.choices,
    correct_index = revised.correct_index,
    explanation = revised.explanation,
    difficulty = revised.difficulty,
    target_seconds = 18,
    verified_at = now()
from revised
where qv.id = revised.version_id;

with revised(question_id, category) as (values
  ('00000000-0000-4000-8000-000000000105'::uuid,'Spatial'),
  ('00000000-0000-4000-8000-000000000111'::uuid,'Spatial'),
  ('00000000-0000-4000-8000-000000000117'::uuid,'Spatial'),
  ('00000000-0000-4000-8000-000000000123'::uuid,'Spatial'),
  ('00000000-0000-4000-8000-000000000129'::uuid,'Spatial'),
  ('00000000-0000-4000-8000-000000000135'::uuid,'Spatial'),
  ('00000000-0000-4000-8000-000000000139'::uuid,'Spatial'),
  ('00000000-0000-4000-8000-000000000141'::uuid,'Spatial'),
  ('00000000-0000-4000-8000-000000000143'::uuid,'Spatial'),
  ('00000000-0000-4000-8000-000000000149'::uuid,'Spatial')
)
update public.questions q set category = revised.category from revised where q.id = revised.question_id;

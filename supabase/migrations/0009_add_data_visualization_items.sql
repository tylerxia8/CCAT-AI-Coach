update public.assessment_forms
set slug = 'original-ccat-style-diagnostic-v3',
    title = 'Original CCAT-Style Diagnostic — Data Visuals',
    version = 4,
    time_limit_seconds = 900
where id = '20000000-0000-4000-8000-000000000001';

-- The browser renders chart data from the versioned application form. These
-- snapshots keep the associated prompt and scoring metadata aligned in cloud history.
update public.question_versions set
  stem = 'By what percentage did output increase from Q1 to Q4? [Quarterly output: Q1 120, Q2 150, Q3 135, Q4 180]',
  choices = '["25%","33%","40%","50%","60%"]'::jsonb,
  correct_index = 3,
  explanation = 'Output rose from 120 to 180, an increase of 60. Sixty divided by the original 120 equals 50%.',
  difficulty = 2,
  verified_at = now()
where id = '10000000-0000-4000-8000-000000000125';

update public.question_versions set
  stem = 'What is the average response time for Tuesday and Thursday? [Mon 24, Tue 20, Wed 18, Thu 16, Fri 12 minutes]',
  choices = '["16","17","18","19","20"]'::jsonb,
  correct_index = 2,
  explanation = 'Tuesday is 20 minutes and Thursday is 16 minutes. Their average is 18 minutes.',
  difficulty = 2,
  verified_at = now()
where id = '10000000-0000-4000-8000-000000000128';

update public.question_versions set
  stem = 'Which region had the highest hiring rate? [North 80/20, South 120/24, East 90/27, West 150/30 applicants/hired]',
  choices = '["North","South","East","West","All were equal"]'::jsonb,
  correct_index = 2,
  explanation = 'The hiring rates are 25%, 20%, 30%, and 20%. East has the highest rate at 30%.',
  difficulty = 2,
  verified_at = now()
where id = '10000000-0000-4000-8000-000000000140';

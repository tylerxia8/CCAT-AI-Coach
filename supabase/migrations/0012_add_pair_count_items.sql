update public.assessment_forms
set slug = 'original-ccat-style-diagnostic-v5',
    title = 'Original CCAT-Style Diagnostic — Pair Comparison',
    version = 6,
    time_limit_seconds = 900
where id = '20000000-0000-4000-8000-000000000001';

update public.question_versions set
  stem = 'How many pairs are exactly the same? [LQ7-483/LQ7-483; NP6-219/NP6-291; TX4-805/TX4-805; BR9-167/BR9-176; CM2-744/CM2-744]',
  choices = '["0","1","2","3","4"]'::jsonb,
  correct_index = 3,
  explanation = 'Rows 1, 3, and 5 match exactly. Rows 2 and 4 contain transposed final digits, so 3 pairs are the same.',
  difficulty = 2,
  verified_at = now()
where id = '10000000-0000-4000-8000-000000000121';

update public.question_versions set
  stem = 'How many pairs are exactly the same? [8RK-41M-762/8RK-41M-762; Q5B-903-X17/Q5B-930-X17; 6TN-28C-445/6TN-28G-445; LP4-771-Z09/LP4-771-Z09; 3DV-618-K52/3DV-681-K52]',
  choices = '["1","2","3","4","5"]'::jsonb,
  correct_index = 1,
  explanation = 'Only rows 1 and 4 match exactly. The other rows contain a transposition or a single-character substitution, so 2 pairs are the same.',
  difficulty = 2,
  verified_at = now()
where id = '10000000-0000-4000-8000-000000000142';

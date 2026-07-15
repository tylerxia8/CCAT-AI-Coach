update public.assessment_forms
set slug = 'original-ccat-style-diagnostic-v4',
    title = 'Original CCAT-Style Diagnostic — Expanded Formats',
    version = 5,
    time_limit_seconds = 900
where id = '20000000-0000-4000-8000-000000000001';

update public.question_versions set
  stem = 'Although the proposal appeared ___, its assumptions were so ___ that the committee rejected it.',
  choices = '["ordinary · practical","promising · flawed","costly · detailed","brief · familiar","novel · proven"]'::jsonb,
  correct_index = 1,
  explanation = 'Promising creates the contrast with the rejection, while flawed explains why the committee rejected the proposal despite its promise.',
  difficulty = 2,
  verified_at = now()
where id = '10000000-0000-4000-8000-000000000106';

update public.question_versions set
  stem = 'A vertical mirror is placed to the right of ↗●. Which image appears in the mirror?',
  choices = '["●↖","↖●","●↗","↙●","●↘"]'::jsonb,
  correct_index = 0,
  explanation = 'A vertical reflection reverses left and right. The arrow points upper-left, and the circle appears to its left in the reflected image.',
  difficulty = 2,
  verified_at = now()
where id = '10000000-0000-4000-8000-000000000129';

update public.question_versions set
  stem = 'Which pair is exactly the same?',
  choices = '["K7M4Q2 · K7N4Q2","B93L6A · B93LGA","R5T88C · R5T8BC","P4X72N · P4X72N","D61V9K · D16V9K"]'::jsonb,
  correct_index = 3,
  explanation = 'Only P4X72N is reproduced without a substituted, transposed, or missing character.',
  difficulty = 2,
  verified_at = now()
where id = '10000000-0000-4000-8000-000000000130';

update public.question_versions set
  stem = 'If the total annual budget is $240,000, how much more is allocated to Operations (35%) than Administration (15%)?',
  choices = '["$36,000","$42,000","$48,000","$54,000","$60,000"]'::jsonb,
  correct_index = 2,
  explanation = 'Operations exceeds Administration by 20 percentage points. Twenty percent of $240,000 is $48,000.',
  difficulty = 2,
  verified_at = now()
where id = '10000000-0000-4000-8000-000000000137';

update public.questions
set category = 'Logic'
where id = '00000000-0000-4000-8000-000000000146';

update public.question_versions set
  category = 'Logic',
  stem = 'Which letter comes next? A, C, F, J, O, ?',
  choices = '["S","T","U","V","W"]'::jsonb,
  correct_index = 2,
  explanation = 'The letter-position jumps increase by one: plus 2, 3, 4, and 5. The next jump is plus 6, taking O to U.',
  difficulty = 2,
  verified_at = now()
where id = '10000000-0000-4000-8000-000000000146';

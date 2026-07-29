begin;

set local search_path = public, extensions;

select plan(5);

select columns_are(
  'public',
  'sessions',
  array[
    'id', 'parent_id', 'parent_preferences', 'status', 'parent_email',
    'preferred_location', 'monthly_household_income', 'parental_preferences'
  ],
  'sessions exposes the expanded parent contract without removing legacy JSONB'
);

select columns_are(
  'public',
  'student_assessments',
  array[
    'id', 'session_id', 'student_id', 'assessment_data', 'student_email',
    'academic_record', 'personality_test', 'vibe_check_quiz'
  ],
  'student assessments exposes typed JSONB fields without removing legacy JSONB'
);

select col_type_is('public', 'sessions', 'parental_preferences', 'jsonb', 'parent preferences use JSONB');
select col_type_is('public', 'student_assessments', 'personality_test', 'jsonb', 'personality answers use JSONB');

select throws_ok(
  $$
    insert into public.student_assessments (personality_test)
    values ('[1,2,3]'::jsonb)
  $$,
  '23514',
  null,
  'rejects personality tests that do not contain exactly 16 Likert values'
);

select * from finish();

rollback;

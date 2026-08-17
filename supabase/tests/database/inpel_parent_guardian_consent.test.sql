begin;
select plan(10);

select columns_are(
  'public',
  'sessions',
  array[
    'id', 'parent_id', 'parent_preferences', 'status', 'parent_email',
    'preferred_location', 'monthly_household_income', 'parental_preferences',
    'student_age_band', 'guardian_consent_given', 'guardian_consent_recorded_at',
    'guardian_consent_declaration'
  ],
  'sessions stores the student age declaration and guardian consent audit trail'
);

select col_type_is('public', 'sessions', 'student_age_band', 'text', 'student age band uses text');
select col_type_is('public', 'sessions', 'guardian_consent_given', 'boolean', 'guardian consent uses boolean');
select col_not_null('public', 'sessions', 'guardian_consent_given', 'guardian consent flag is never null');
select col_type_is('public', 'sessions', 'guardian_consent_recorded_at', 'timestamp with time zone', 'consent time is timezone-aware');
select col_type_is('public', 'sessions', 'guardian_consent_declaration', 'text', 'the accepted declaration is retained');

select function_returns(
  'public',
  'create_parent_student_invitation',
  array['text', 'text', 'text', 'jsonb', 'jsonb', 'text', 'boolean'],
  'jsonb',
  'invitation creation accepts age and guardian consent inputs'
);

select throws_ok(
  $$insert into public.sessions (status, student_age_band) values ('invited', 'under-15')$$,
  '23514',
  null,
  'students under 15 cannot be represented by an invitation session'
);

select throws_ok(
  $$insert into public.sessions (status, student_age_band) values ('invited', '15-17')$$,
  '23514',
  null,
  'a minor session cannot exist without affirmative consent and an audit record'
);

select lives_ok(
  $$insert into public.sessions (
      status, student_age_band, guardian_consent_given,
      guardian_consent_recorded_at, guardian_consent_declaration
    ) values (
      'invited', '15-17', true, statement_timestamp(), 'Test declaration'
    )$$,
  'a complete minor consent audit record is accepted'
);

select * from finish();
rollback;

begin;

-- Safe while the portal dual-writes the complete legacy aggregate columns.
alter table public.student_assessments
  drop constraint if exists student_assessments_vibe_check_quiz_shape_check,
  drop constraint if exists student_assessments_personality_test_shape_check,
  drop constraint if exists student_assessments_academic_record_shape_check,
  drop column if exists vibe_check_quiz,
  drop column if exists personality_test,
  drop column if exists academic_record,
  drop column if exists student_email;

alter table public.sessions
  drop constraint if exists sessions_parental_preferences_shape_check,
  drop constraint if exists sessions_monthly_household_income_check,
  drop constraint if exists sessions_preferred_location_check,
  drop column if exists parental_preferences,
  drop column if exists monthly_household_income,
  drop column if exists preferred_location,
  drop column if exists parent_email;

commit;

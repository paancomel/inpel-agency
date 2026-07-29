begin;

-- Expand first: retain the legacy aggregate JSONB columns while new and old
-- clients overlap. The portal dual-writes both representations during rollout.
alter table public.sessions
  add column parent_email text,
  add column preferred_location text,
  add column monthly_household_income text,
  add column parental_preferences jsonb;

alter table public.student_assessments
  add column student_email text,
  add column academic_record jsonb,
  add column personality_test jsonb,
  add column vibe_check_quiz jsonb;

-- Best-effort backfill from the previously shipped camelCase aggregate shape.
-- Unknown legacy shapes remain untouched rather than being coerced or dropped.
update public.sessions
set
  parent_email = parent_preferences ->> 'email',
  preferred_location = parent_preferences ->> 'location',
  monthly_household_income = parent_preferences ->> 'income',
  parental_preferences = case
    when jsonb_typeof(parent_preferences -> 'preferences') = 'object' then
      jsonb_build_object(
        'campus_vibe', parent_preferences #>> '{preferences,campusVibe}',
        'campus_concern', parent_preferences #>> '{preferences,campusConcern}',
        'ultimate_win', parent_preferences #>> '{preferences,ultimateWin}',
        'independence', parent_preferences #>> '{preferences,independence}'
      )
    else null
  end
where parent_preferences is not null;

update public.student_assessments
set
  student_email = assessment_data ->> 'email',
  academic_record = assessment_data -> 'subjects',
  personality_test = assessment_data -> 'personalityAnswers',
  vibe_check_quiz = case
    when jsonb_typeof(assessment_data -> 'vibeAnswers') = 'object' then
      jsonb_build_object(
        'friday_night', assessment_data #>> '{vibeAnswers,fridayNight}',
        'campus_setting', assessment_data #>> '{vibeAnswers,campusSetting}',
        'team_style', assessment_data #>> '{vibeAnswers,teamStyle}',
        'schedule_style', assessment_data #>> '{vibeAnswers,scheduleStyle}',
        'learning_style', assessment_data #>> '{vibeAnswers,learningStyle}',
        'future_horizon', assessment_data #>> '{vibeAnswers,futureHorizon}'
      )
    else null
  end
where assessment_data is not null;

-- NOT VALID protects deployments containing older, unexpected JSON shapes.
-- PostgreSQL still enforces every constraint for new or subsequently changed rows.
alter table public.sessions
  add constraint sessions_preferred_location_check check (
    preferred_location is null or preferred_location in (
      'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang',
      'Perak', 'Perlis', 'Penang', 'Sabah', 'Sarawak', 'Selangor',
      'Terengganu', 'Kuala Lumpur', 'Labuan', 'Putrajaya', 'Open to anywhere'
    )
  ) not valid,
  add constraint sessions_monthly_household_income_check check (
    monthly_household_income is null or monthly_household_income in (
      'Below RM 3,000', 'RM 3,000 - RM 5,999', 'RM 6,000 - RM 9,999',
      'RM 10,000 - RM 14,999', 'RM 15,000 - RM 19,999', 'RM 20,000 and above'
    )
  ) not valid,
  add constraint sessions_parental_preferences_shape_check check (
    parental_preferences is null or (
      jsonb_typeof(parental_preferences) = 'object'
      and jsonb_typeof(parental_preferences -> 'campus_vibe') = 'string'
      and jsonb_typeof(parental_preferences -> 'campus_concern') = 'string'
      and jsonb_typeof(parental_preferences -> 'ultimate_win') = 'string'
      and jsonb_typeof(parental_preferences -> 'independence') = 'string'
    )
  ) not valid;

alter table public.student_assessments
  add constraint student_assessments_academic_record_shape_check check (
    academic_record is null or (
      jsonb_typeof(academic_record) = 'array'
      and jsonb_array_length(academic_record) between 1 and 20
    )
  ) not valid,
  add constraint student_assessments_personality_test_shape_check check (
    personality_test is null or (
      jsonb_typeof(personality_test) = 'array'
      and jsonb_array_length(personality_test) = 16
      and not jsonb_path_exists(
        personality_test,
        '$[*] ? (@.type() != "number" || @ < 1 || @ > 5)'
      )
    )
  ) not valid,
  add constraint student_assessments_vibe_check_quiz_shape_check check (
    vibe_check_quiz is null or (
      jsonb_typeof(vibe_check_quiz) = 'object'
      and vibe_check_quiz ->> 'friday_night' in ('cozy', 'networking')
      and vibe_check_quiz ->> 'campus_setting' in ('nature', 'city')
      and vibe_check_quiz ->> 'team_style' in ('solo', 'collaborative')
      and vibe_check_quiz ->> 'schedule_style' in ('spontaneous', 'structured')
      and vibe_check_quiz ->> 'learning_style' in ('creative', 'research')
      and vibe_check_quiz ->> 'future_horizon' in ('local', 'global')
    )
  ) not valid;

commit;

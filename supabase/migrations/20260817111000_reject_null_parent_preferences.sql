begin;

create or replace function public.create_parent_student_invitation(
  p_student_email text,
  p_preferred_location text,
  p_monthly_household_income text,
  p_parental_preferences jsonb,
  p_parent_preferences jsonb,
  p_student_age_band text,
  p_guardian_consent_confirmed boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if jsonb_typeof(p_parental_preferences) is distinct from 'object'
     or jsonb_typeof(p_parent_preferences) is distinct from 'object'
     or not (p_parental_preferences ?& array[
       'campus_vibe', 'campus_concern', 'ultimate_win', 'independence'
     ])
     or not (p_parent_preferences ?& array[
       'campusVibe', 'campusConcern', 'ultimateWin', 'independence'
     ]) then
    raise exception using errcode = '22023', message = 'Every parent preference is required.';
  end if;

  if ((p_parental_preferences ->> 'campus_vibe') = any (array[
       'Public (IPTA) - Warm & Local',
       'Private (IPTS) - Modern & Vibrant',
       'International Branch - Global Exposure',
       'No preference - open to anything!'
     ]::text[])) is not true
     or ((p_parental_preferences ->> 'campus_concern') = any (array[
       'Academic rigor & faculty quality',
       'Campus safety & physical well-being',
       'Mental health & student support',
       'Networking & industry connections'
     ]::text[])) is not true
     or ((p_parental_preferences ->> 'ultimate_win') = any (array[
       'Guaranteed high-paying employment',
       'Strong professional network',
       'Character & leadership development',
       'Path to international migration/work'
     ]::text[])) is not true
     or ((p_parental_preferences ->> 'independence') = any (array[
       'Highly independent self-starter',
       'Needs some structural guidance',
       'Requires close academic monitoring',
       'Needs strong emotional/social support'
     ]::text[])) is not true then
    raise exception using errcode = '22023', message = 'Parent preferences contain an unsupported value.';
  end if;

  if p_parent_preferences ->> 'campusVibe'
       is distinct from p_parental_preferences ->> 'campus_vibe'
     or p_parent_preferences ->> 'campusConcern'
       is distinct from p_parental_preferences ->> 'campus_concern'
     or p_parent_preferences ->> 'ultimateWin'
       is distinct from p_parental_preferences ->> 'ultimate_win'
     or p_parent_preferences ->> 'independence'
       is distinct from p_parental_preferences ->> 'independence' then
    raise exception using errcode = '22023', message = 'Parent preference representations do not match.';
  end if;

  return public.create_parent_student_invitation_unchecked(
    p_student_email,
    p_preferred_location,
    p_monthly_household_income,
    p_parental_preferences,
    p_parent_preferences,
    p_student_age_band,
    p_guardian_consent_confirmed
  );
end;
$$;

revoke all on function public.create_parent_student_invitation(
  text, text, text, jsonb, jsonb, text, boolean
) from public, anon;
grant execute on function public.create_parent_student_invitation(
  text, text, text, jsonb, jsonb, text, boolean
) to authenticated;

commit;

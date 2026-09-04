alter table public.sessions
  add column student_age_band text,
  add column guardian_consent_given boolean not null default false,
  add column guardian_consent_recorded_at timestamptz,
  add column guardian_consent_declaration text,
  add constraint sessions_student_age_band_check
    check (student_age_band is null or student_age_band in ('15-17', '18+')),
  add constraint sessions_guardian_consent_consistency_check
    check (
      (student_age_band is null
        and guardian_consent_given = false
        and guardian_consent_recorded_at is null
        and guardian_consent_declaration is null)
      or
      (student_age_band = '18+'
        and guardian_consent_given = false
        and guardian_consent_recorded_at is null
        and guardian_consent_declaration is null)
      or
      (student_age_band = '15-17'
        and guardian_consent_given = true
        and guardian_consent_recorded_at is not null
        and nullif(btrim(guardian_consent_declaration), '') is not null)
    );

comment on column public.sessions.student_age_band is
  'Age category declared by the authenticated invitation creator; not independently verified by INPEL.';
comment on column public.sessions.guardian_consent_recorded_at is
  'Server-generated time when the authenticated invitation creator expressly confirmed guardian consent.';
comment on column public.sessions.guardian_consent_declaration is
  'Exact declaration accepted for a 15-17-year-old student invitation.';

drop function public.create_parent_student_invitation(text, text, text, jsonb, jsonb);

create function public.create_parent_student_invitation(
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
declare
  v_parent_id uuid := auth.uid();
  v_parent_email text;
  v_parent_role text;
  v_student_email text := lower(btrim(coalesce(p_student_email, '')));
  v_student_age_band text := btrim(coalesce(p_student_age_band, ''));
  v_session_id uuid := extensions.uuid_generate_v4();
  v_token text := encode(extensions.gen_random_bytes(32), 'hex');
  v_expires_at timestamptz;
  v_guardian_consent_declaration constant text := 'I declare that I am the student''s parent or legal guardian and consent to the student using INPEL and submitting their information for university matching and related reports.';
begin
  if v_parent_id is null then
    raise exception using errcode = '28000', message = 'Authenticated parent or guardian account is required.';
  end if;

  select lower(btrim(email)) into v_parent_email
    from auth.users
   where id = v_parent_id
     and email_confirmed_at is not null;

  if v_parent_email is null or v_parent_email = '' then
    raise exception using errcode = '28000', message = 'A confirmed parent or guardian account email is required.';
  end if;

  if v_student_email = ''
     or length(v_student_email) > 320
     or v_student_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception using errcode = '22023', message = 'A valid student email is required.';
  end if;

  if v_student_age_band not in ('15-17', '18+') then
    raise exception using errcode = '22023', message = 'The student must be at least 15 years old.';
  end if;

  if v_student_age_band = '15-17' and coalesce(p_guardian_consent_confirmed, false) = false then
    raise exception using errcode = '22023', message = 'Parent or legal guardian consent is required for students aged 15 to 17.';
  end if;

  if nullif(btrim(coalesce(p_preferred_location, '')), '') is null
     or nullif(btrim(coalesce(p_monthly_household_income, '')), '') is null
     or coalesce(jsonb_typeof(p_parental_preferences), '') <> 'object'
     or coalesce(jsonb_typeof(p_parent_preferences), '') <> 'object' then
    raise exception using errcode = '22023', message = 'A complete parent profile is required.';
  end if;

  insert into public.profiles (id, email, role)
  values (v_parent_id, v_parent_email, 'parent')
  on conflict (id) do nothing;

  select role into v_parent_role
    from public.profiles
   where id = v_parent_id
   for update;

  if v_parent_role not in ('parent', 'admin') then
    raise exception using errcode = '42501', message = 'The authenticated account cannot create parent invitations.';
  end if;

  insert into public.sessions (
    id, parent_id, parent_email, preferred_location, monthly_household_income,
    parental_preferences, parent_preferences, status, student_age_band,
    guardian_consent_given, guardian_consent_recorded_at, guardian_consent_declaration
  ) values (
    v_session_id, v_parent_id, v_parent_email, p_preferred_location,
    p_monthly_household_income, p_parental_preferences, p_parent_preferences, 'invited',
    v_student_age_band,
    v_student_age_band = '15-17',
    case when v_student_age_band = '15-17' then statement_timestamp() else null end,
    case when v_student_age_band = '15-17' then v_guardian_consent_declaration else null end
  );

  insert into public.session_student_bindings (
    session_id, token_digest, invited_email_digest, status
  ) values (
    v_session_id,
    extensions.digest(convert_to(v_token, 'UTF8'), 'sha256'),
    extensions.digest(convert_to(v_student_email, 'UTF8'), 'sha256'),
    'issued'
  ) returning expires_at into v_expires_at;

  return jsonb_build_object(
    'session_id', v_session_id,
    'invitation_token', v_token,
    'expires_at', v_expires_at
  );
end;
$$;

revoke all on function public.create_parent_student_invitation(text, text, text, jsonb, jsonb, text, boolean) from public, anon;
grant execute on function public.create_parent_student_invitation(text, text, text, jsonb, jsonb, text, boolean) to authenticated;

begin;

-- This migration is pending everywhere. Keep the profile boundary and trusted
-- RPCs in one transaction so no public RPC can ever rely on self-editable roles.
create extension if not exists "pgcrypto" with schema extensions;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

alter table public.profiles enable row level security;
create or replace function public.is_portal_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.profiles p
     where p.id = (select auth.uid())
       and p.role = 'admin'
  );
$$;
revoke all on function public.is_portal_admin() from public;
revoke all on function public.is_portal_admin() from anon;
grant execute on function public.is_portal_admin() to authenticated;

drop policy if exists profiles_update_own_or_admin on public.profiles;
revoke all on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;

-- Fail closed on historical duplicate rows before exposing assessment completion.
create unique index student_assessments_session_id_key
  on public.student_assessments (session_id)
  where session_id is not null;

create or replace function public.create_parent_student_invitation(
  p_student_email text,
  p_preferred_location text,
  p_monthly_household_income text,
  p_parental_preferences jsonb,
  p_parent_preferences jsonb
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
  v_session_id uuid := extensions.uuid_generate_v4();
  v_token text := encode(extensions.gen_random_bytes(32), 'hex');
  v_expires_at timestamptz;
begin
  if v_parent_id is null then
    raise exception using errcode = '28000', message = 'Authenticated parent is required.';
  end if;

  select lower(btrim(email)) into v_parent_email
    from auth.users
   where id = v_parent_id
     and email_confirmed_at is not null;

  if v_parent_email is null or v_parent_email = '' then
    raise exception using errcode = '28000', message = 'A confirmed parent email is required.';
  end if;

  if v_student_email = ''
     or length(v_student_email) > 320
     or v_student_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception using errcode = '22023', message = 'A valid student email is required.';
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
    parental_preferences, parent_preferences, status
  ) values (
    v_session_id, v_parent_id, v_parent_email, p_preferred_location,
    p_monthly_household_income, p_parental_preferences, p_parent_preferences, 'invited'
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

create or replace function public.revoke_parent_student_invitation(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parent_id uuid := auth.uid();
  v_binding public.session_student_bindings%rowtype;
begin
  if v_parent_id is null then
    raise exception using errcode = '28000', message = 'Authenticated parent is required.';
  end if;

  select b.* into v_binding
    from public.session_student_bindings b
    join public.sessions s on s.id = b.session_id
   where b.session_id = p_session_id
     and s.parent_id = v_parent_id
   for update of b;

  if not found then
    raise exception using errcode = '42501', message = 'The invitation is not owned by the authenticated parent.';
  end if;

  if v_binding.status = 'revoked' then
    return jsonb_build_object('session_id', p_session_id, 'status', 'revoked');
  end if;

  if v_binding.status <> 'issued' then
    raise exception using errcode = '22023', message = 'Only an unclaimed invitation can be revoked.';
  end if;

  update public.session_student_bindings
     set status = 'revoked',
         revoked_at = current_timestamp,
         revoked_by = v_parent_id,
         updated_at = current_timestamp
   where id = v_binding.id
     and status = 'issued';

  if not found then
    raise exception using errcode = '22023', message = 'The invitation is no longer available.';
  end if;

  return jsonb_build_object('session_id', p_session_id, 'status', 'revoked');
end;
$$;

create or replace function public.claim_student_invitation(p_invitation_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := auth.uid();
  v_auth_email text;
  v_profile_role text;
  v_digest bytea;
  v_binding public.session_student_bindings%rowtype;
begin
  if v_student_id is null then
    raise exception using errcode = '28000', message = 'Authenticated student is required.';
  end if;

  select lower(btrim(email)) into v_auth_email
    from auth.users
   where id = v_student_id
     and email_confirmed_at is not null;

  if v_auth_email is null or v_auth_email = '' then
    raise exception using errcode = '28000', message = 'A confirmed student email is required.';
  end if;

  if p_invitation_token is null or p_invitation_token !~ '^[0-9a-fA-F]{64}$' then
    raise exception using errcode = '22023', message = 'Invitation is invalid.';
  end if;

  v_digest := extensions.digest(convert_to(lower(p_invitation_token), 'UTF8'), 'sha256');
  select * into v_binding
    from public.session_student_bindings
   where token_digest = v_digest
   for update;

  if not found then
    raise exception using errcode = '22023', message = 'Invitation is invalid.';
  end if;

  if v_binding.status = 'claimed' then
    if v_binding.student_id = v_student_id then
      return jsonb_build_object('session_id', v_binding.session_id, 'status', 'claimed');
    end if;
    raise exception using errcode = '22023', message = 'Invitation is invalid.';
  end if;

  if v_binding.status <> 'issued' then
    raise exception using errcode = '22023', message = 'Invitation is no longer available.';
  end if;

  if v_binding.expires_at <= current_timestamp then
    raise exception using errcode = '22023', message = 'Invitation has expired.';
  end if;

  if extensions.digest(convert_to(v_auth_email, 'UTF8'), 'sha256') <> v_binding.invited_email_digest then
    raise exception using errcode = '22023', message = 'Invitation is invalid.';
  end if;

  insert into public.profiles (id, email, role)
  values (v_student_id, v_auth_email, 'student')
  on conflict (id) do nothing;

  select role into v_profile_role
    from public.profiles
   where id = v_student_id
   for update;

  if v_profile_role <> 'student' then
    raise exception using errcode = '42501', message = 'The authenticated account cannot claim a student invitation.';
  end if;

  update public.session_student_bindings
     set student_id = v_student_id,
         claimed_by = v_student_id,
         claimed_at = current_timestamp,
         status = 'claimed',
         updated_at = current_timestamp
   where id = v_binding.id
     and status = 'issued';

  if not found then
    raise exception using errcode = '22023', message = 'Invitation is no longer available.';
  end if;

  return jsonb_build_object('session_id', v_binding.session_id, 'status', 'claimed');
end;
$$;

create or replace function public.complete_student_assessment(
  p_session_id uuid,
  p_assessment_data jsonb,
  p_academic_record jsonb,
  p_personality_test jsonb,
  p_vibe_check_quiz jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := auth.uid();
  v_student_email text;
  v_session_status text;
  v_existing_assessment_id uuid;
  v_existing_student_id uuid;
  v_written_assessment_id uuid;
  v_updated_session_id uuid;
begin
  if v_student_id is null then
    raise exception using errcode = '28000', message = 'Authenticated student is required.';
  end if;

  select lower(btrim(email)) into v_student_email
    from auth.users
   where id = v_student_id
     and email_confirmed_at is not null;

  if v_student_email is null or v_student_email = '' then
    raise exception using errcode = '28000', message = 'A confirmed student email is required.';
  end if;

  if coalesce(jsonb_typeof(p_assessment_data), '') <> 'object'
     or coalesce(jsonb_typeof(p_academic_record), '') <> 'array'
     or (case when jsonb_typeof(p_academic_record) = 'array' then jsonb_array_length(p_academic_record) else 0 end) not between 1 and 20
     or coalesce(jsonb_typeof(p_personality_test), '') <> 'array'
     or (case when jsonb_typeof(p_personality_test) = 'array' then jsonb_array_length(p_personality_test) else 0 end) <> 16
     or coalesce(jsonb_typeof(p_vibe_check_quiz), '') <> 'object' then
    raise exception using errcode = '22023', message = 'A complete student assessment is required.';
  end if;

  select s.status into v_session_status
    from public.sessions s
    join public.session_student_bindings b on b.session_id = s.id
   where s.id = p_session_id
     and b.student_id = v_student_id
     and b.status = 'claimed'
   for update of s, b;

  if not found then
    raise exception using errcode = '42501', message = 'This assessment is not linked to the authenticated student.';
  end if;

  select id, student_id into v_existing_assessment_id, v_existing_student_id
    from public.student_assessments
   where session_id = p_session_id
   for update;

  if v_existing_assessment_id is not null and v_existing_student_id is distinct from v_student_id then
    raise exception using errcode = '23505', message = 'A conflicting assessment already exists for this session.';
  end if;

  if v_session_status = 'completed' then
    if v_existing_assessment_id is null then
      raise exception using errcode = '23514', message = 'Completed session is missing its assessment.';
    end if;
    return jsonb_build_object('session_id', p_session_id, 'status', 'completed');
  end if;

  insert into public.student_assessments (
    session_id, student_id, student_email, assessment_data, academic_record,
    personality_test, vibe_check_quiz
  ) values (
    p_session_id, v_student_id, v_student_email, p_assessment_data,
    p_academic_record, p_personality_test, p_vibe_check_quiz
  )
  on conflict (session_id) where session_id is not null do update
    set student_email = excluded.student_email,
        assessment_data = excluded.assessment_data,
        academic_record = excluded.academic_record,
        personality_test = excluded.personality_test,
        vibe_check_quiz = excluded.vibe_check_quiz
    where public.student_assessments.student_id = v_student_id
  returning id into v_written_assessment_id;

  if v_written_assessment_id is null then
    raise exception using errcode = '23505', message = 'The assessment could not be safely stored.';
  end if;

  update public.sessions
     set status = 'completed'
   where id = p_session_id
     and status = 'invited'
  returning id into v_updated_session_id;

  if v_updated_session_id is null then
    raise exception using errcode = '23514', message = 'The session could not be completed.';
  end if;

  return jsonb_build_object('session_id', p_session_id, 'status', 'completed');
end;
$$;

revoke all on function public.create_parent_student_invitation(text, text, text, jsonb, jsonb) from public, anon;
revoke all on function public.revoke_parent_student_invitation(uuid) from public, anon;
revoke all on function public.claim_student_invitation(text) from public, anon;
revoke all on function public.complete_student_assessment(uuid, jsonb, jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.create_parent_student_invitation(text, text, text, jsonb, jsonb) to authenticated;
grant execute on function public.revoke_parent_student_invitation(uuid) to authenticated;
grant execute on function public.claim_student_invitation(text) to authenticated;
grant execute on function public.complete_student_assessment(uuid, jsonb, jsonb, jsonb, jsonb) to authenticated;

commit;

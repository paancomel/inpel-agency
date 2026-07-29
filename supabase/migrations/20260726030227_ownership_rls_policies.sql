begin;

-- Browser table writes are intentionally unavailable for family and report data.
-- The public RPCs created in the previous migration are the only mutation path.
alter table public.session_student_bindings enable row level security;
alter table public.sessions enable row level security;
alter table public.student_assessments enable row level security;
alter table public.recommendation_results enable row level security;
alter table public.payments enable row level security;

create table public.report_access_grants (
  id uuid not null default extensions.uuid_generate_v4(),
  session_id uuid not null,
  grant_kind text not null default 'demo',
  status text not null default 'active',
  granted_by uuid not null,
  granted_at timestamptz not null default current_timestamp,
  revoked_at timestamptz,
  revoked_by uuid,
  constraint report_access_grants_pkey primary key (id),
  constraint report_access_grants_session_id_key unique (session_id),
  constraint report_access_grants_session_id_fkey
    foreign key (session_id) references public.sessions (id) on delete cascade,
  constraint report_access_grants_granted_by_fkey
    foreign key (granted_by) references public.profiles (id),
  constraint report_access_grants_revoked_by_fkey
    foreign key (revoked_by) references public.profiles (id),
  constraint report_access_grants_kind_check check (grant_kind = 'demo'),
  constraint report_access_grants_status_check check (status in ('active', 'revoked')),
  constraint report_access_grants_lifecycle_check check (
    (status = 'active' and revoked_at is null and revoked_by is null)
    or (status = 'revoked' and revoked_at is not null and revoked_by is not null)
  )
);

alter table public.report_access_grants enable row level security;

create or replace function private.can_access_parent_session(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.sessions s
     where s.id = p_session_id
       and s.parent_id = (select auth.uid())
  );
$$;

create or replace function private.can_access_bound_assessment(
  p_session_id uuid,
  p_student_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.sessions s
      join public.session_student_bindings b on b.session_id = s.id
     where s.id = p_session_id
       and b.student_id = p_student_id
       and b.status = 'claimed'
       and (
         s.parent_id = (select auth.uid())
         or b.student_id = (select auth.uid())
       )
  );
$$;

revoke all on function private.can_access_parent_session(uuid) from public, anon;
revoke all on function private.can_access_bound_assessment(uuid, uuid) from public, anon;
grant execute on function private.can_access_parent_session(uuid) to authenticated;
grant execute on function private.can_access_bound_assessment(uuid, uuid) to authenticated;

revoke all on table public.session_student_bindings from public, anon, authenticated;
revoke all on table public.sessions from public, anon, authenticated;
revoke all on table public.student_assessments from public, anon, authenticated;
revoke all on table public.recommendation_results from public, anon, authenticated;
revoke all on table public.payments from public, anon, authenticated;
revoke all on table public.report_access_grants from public, anon, authenticated;

grant select on table public.sessions to authenticated;
grant select on table public.student_assessments to authenticated;
grant select on table public.report_access_grants to authenticated;

drop policy if exists sessions_select_parent_owned on public.sessions;
create policy sessions_select_parent_owned
  on public.sessions for select to authenticated
  using ((select private.can_access_parent_session(id)));

drop policy if exists student_assessments_select_bound on public.student_assessments;
create policy student_assessments_select_bound
  on public.student_assessments for select to authenticated
  using ((select private.can_access_bound_assessment(session_id, student_id)));

drop policy if exists report_access_grants_select_parent_owned on public.report_access_grants;
create policy report_access_grants_select_parent_owned
  on public.report_access_grants for select to authenticated
  using ((select private.can_access_parent_session(session_id)));

create or replace function public.grant_demo_report_access(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parent_id uuid := auth.uid();
  v_grant public.report_access_grants%rowtype;
begin
  if v_parent_id is null then
    raise exception using errcode = '28000', message = 'Authenticated parent is required.';
  end if;

  perform 1
    from public.sessions s
    join public.session_student_bindings b on b.session_id = s.id
   where s.id = p_session_id
     and s.parent_id = v_parent_id
     and s.status = 'completed'
     and b.status = 'claimed'
   for update of s, b;

  if not found then
    raise exception using errcode = '42501', message = 'Only the parent of a completed claimed session can activate demo report access.';
  end if;

  insert into public.report_access_grants (
    session_id, grant_kind, status, granted_by, granted_at, revoked_at, revoked_by
  ) values (
    p_session_id, 'demo', 'active', v_parent_id, current_timestamp, null, null
  )
  on conflict (session_id) do update
    set grant_kind = 'demo',
        status = 'active',
        granted_by = excluded.granted_by,
        granted_at = excluded.granted_at,
        revoked_at = null,
        revoked_by = null
  returning * into v_grant;

  return jsonb_build_object(
    'session_id', v_grant.session_id,
    'grant_kind', v_grant.grant_kind,
    'status', v_grant.status,
    'granted_at', v_grant.granted_at,
    'message', 'Demo report access is active. No payment was collected.'
  );
end;
$$;

create or replace function public.get_authorized_report(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parent_id uuid := auth.uid();
  v_assessment jsonb;
  v_recommendations jsonb;
begin
  if v_parent_id is null then
    raise exception using errcode = '28000', message = 'Authenticated parent is required.';
  end if;

  if not exists (
    select 1
      from public.sessions s
      join public.report_access_grants g on g.session_id = s.id
     where s.id = p_session_id
       and s.parent_id = v_parent_id
       and s.status = 'completed'
       and g.grant_kind = 'demo'
       and g.status = 'active'
  ) then
    raise exception using errcode = '42501', message = 'An active demo report grant is required.';
  end if;

  select jsonb_build_object(
    'student_email', sa.student_email,
    'assessment_data', sa.assessment_data,
    'academic_record', sa.academic_record,
    'personality_test', sa.personality_test,
    'vibe_check_quiz', sa.vibe_check_quiz
  ) into v_assessment
    from public.student_assessments sa
   where sa.session_id = p_session_id;

  if v_assessment is null then
    raise exception using errcode = '23514', message = 'Completed session is missing its assessment.';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', r.id,
        'university_id', r.university_id,
        'match_score', r.match_score,
        'roi_and_career', r.roi_and_career,
        'source', 'persisted_database',
        'method', coalesce(r.roi_and_career ->> 'method', 'not_recorded')
      ) order by r.match_score desc, r.id
    ),
    '[]'::jsonb
  ) into v_recommendations
    from public.recommendation_results r
   where r.session_id = p_session_id;

  return jsonb_build_object(
    'session_id', p_session_id,
    'grant_kind', 'demo',
    'access', 'active',
    'assessment', v_assessment,
    'recommendations', v_recommendations,
    'recommendation_source', 'persisted_database_only'
  );
end;
$$;

revoke all on function public.grant_demo_report_access(uuid) from public, anon;
revoke all on function public.get_authorized_report(uuid) from public, anon;
grant execute on function public.grant_demo_report_access(uuid) to authenticated;
grant execute on function public.get_authorized_report(uuid) to authenticated;

commit;

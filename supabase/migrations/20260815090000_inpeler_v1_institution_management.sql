begin;

-- INPELER Version 1: move from a single representative owner to a
-- server-authoritative institution, domain, membership, version, and audit model.
drop index if exists public.universities_representative_id_key;

alter table public.universities
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists profile_status text not null default 'incomplete',
  add column if not exists is_suspended boolean not null default false,
  add column if not exists primary_admin_id uuid,
  add column if not exists published_version integer not null default 0,
  add column if not exists updated_at timestamptz not null default current_timestamp,
  add constraint universities_verification_status_check check (verification_status in ('unverified', 'verified', 'suspended')),
  add constraint universities_profile_status_check check (profile_status in ('incomplete', 'complete')),
  add constraint universities_primary_admin_id_fkey foreign key (primary_admin_id) references public.profiles (id) on delete set null;

create table if not exists public.institution_domains (
  id uuid not null default extensions.uuid_generate_v4(),
  university_id uuid not null references public.universities (id) on delete cascade,
  domain text not null,
  status text not null default 'approved',
  source text not null default 'institution',
  verified_at timestamptz,
  suspended_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default current_timestamp,
  constraint institution_domains_pkey primary key (id),
  constraint institution_domains_domain_format check (domain = lower(trim(domain)) and domain !~ '@' and domain ~ '^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$'),
  constraint institution_domains_status_check check (status in ('approved', 'suspended')),
  constraint institution_domains_source_check check (source in ('institution', 'manual_exception')),
  constraint institution_domains_lifecycle_check check ((status = 'approved' and suspended_at is null) or (status = 'suspended' and suspended_at is not null)),
  constraint institution_domains_university_domain_key unique (university_id, domain)
);

create unique index institution_domains_active_domain_key
  on public.institution_domains (domain)
  where status = 'approved';

create table if not exists public.approved_institution_domains (
  domain text not null,
  university_id uuid references public.universities (id) on delete set null,
  status text not null default 'approved',
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default current_timestamp,
  constraint approved_institution_domains_pkey primary key (domain),
  constraint approved_institution_domains_domain_format check (domain = lower(trim(domain)) and domain !~ '@' and domain ~ '^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$'),
  constraint approved_institution_domains_status_check check (status in ('approved', 'suspended'))
);

create table if not exists public.institution_members (
  university_id uuid not null references public.universities (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'representative',
  status text not null default 'active',
  invited_by uuid references public.profiles (id) on delete set null,
  joined_at timestamptz not null default current_timestamp,
  removed_at timestamptz,
  constraint institution_members_pkey primary key (university_id, user_id),
  constraint institution_members_role_check check (role in ('representative', 'admin')),
  constraint institution_members_status_check check (status in ('active', 'removed')),
  constraint institution_members_lifecycle_check check ((status = 'active' and removed_at is null) or (status = 'removed' and removed_at is not null))
);

create index institution_members_user_idx on public.institution_members (user_id, status);

create table if not exists public.institution_profile_versions (
  id uuid not null default extensions.uuid_generate_v4(),
  university_id uuid not null references public.universities (id) on delete cascade,
  version_number integer not null,
  snapshot jsonb not null,
  source text not null default 'manual',
  changed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default current_timestamp,
  constraint institution_profile_versions_pkey primary key (id),
  constraint institution_profile_versions_source_check check (source in ('manual', 'import', 'restore', 'system')),
  constraint institution_profile_versions_number_key unique (university_id, version_number)
);

create table if not exists public.institution_audit_events (
  id uuid not null default extensions.uuid_generate_v4(),
  university_id uuid references public.universities (id) on delete set null,
  actor_id uuid references public.profiles (id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default current_timestamp,
  constraint institution_audit_events_pkey primary key (id)
);

create index institution_audit_events_university_created_idx
  on public.institution_audit_events (university_id, created_at desc);

-- Backfill the legacy single owner into the new membership model.
insert into public.institution_members (university_id, user_id, role)
select u.id, u.representative_id, 'admin'
  from public.universities u
 where u.representative_id is not null
on conflict (university_id, user_id) do nothing;

update public.universities u
   set primary_admin_id = coalesce(u.primary_admin_id, u.representative_id)
 where u.primary_admin_id is null;

insert into public.institution_domains (university_id, domain, status, source, verified_at, created_by)
select u.id, lower(split_part(p.email, '@', 2)), 'approved', 'institution', current_timestamp, p.id
  from public.universities u
  join public.profiles p on p.id = u.representative_id
 where p.email like '%@%'
on conflict (university_id, domain) do nothing;

create or replace function private.can_manage_university(p_university_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select private.is_portal_admin())
      or exists (
        select 1
          from public.institution_members m
         where m.university_id = p_university_id
           and m.user_id = (select auth.uid())
           and m.status = 'active'
      );
$$;

create or replace function private.can_administer_university(p_university_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select private.is_portal_admin())
      or exists (
        select 1
          from public.institution_members m
         where m.university_id = p_university_id
           and m.user_id = (select auth.uid())
           and m.role = 'admin'
           and m.status = 'active'
      );
$$;

revoke all on function private.can_manage_university(uuid) from public, anon;
revoke all on function private.can_administer_university(uuid) from public, anon;
grant execute on function private.can_manage_university(uuid) to authenticated;
grant execute on function private.can_administer_university(uuid) to authenticated;

-- Membership-based management replaces the legacy representative_id-only rules.
drop policy if exists universities_owner_update on public.universities;
drop policy if exists universities_owner_delete on public.universities;
drop policy if exists courses_owner_insert on public.courses;
drop policy if exists courses_owner_update on public.courses;
drop policy if exists courses_owner_delete on public.courses;
drop policy if exists gallery_images_owner_insert on public.gallery_images;
drop policy if exists gallery_images_owner_update on public.gallery_images;
drop policy if exists gallery_images_owner_delete on public.gallery_images;

create policy universities_member_update
  on public.universities for update to authenticated
  using ((select private.can_manage_university(id)))
  with check ((select private.can_manage_university(id)));

create policy universities_member_delete
  on public.universities for delete to authenticated
  using ((select private.can_administer_university(id)));

create policy courses_member_insert
  on public.courses for insert to authenticated
  with check ((select private.can_manage_university(university_id)));

create policy courses_member_update
  on public.courses for update to authenticated
  using ((select private.can_manage_university(university_id)))
  with check ((select private.can_manage_university(university_id)));

create policy courses_member_delete
  on public.courses for delete to authenticated
  using ((select private.can_manage_university(university_id)));

create policy gallery_images_member_insert
  on public.gallery_images for insert to authenticated
  with check ((select private.can_manage_university(university_id)));

create policy gallery_images_member_update
  on public.gallery_images for update to authenticated
  using ((select private.can_manage_university(university_id)))
  with check ((select private.can_manage_university(university_id)));

create policy gallery_images_member_delete
  on public.gallery_images for delete to authenticated
  using ((select private.can_manage_university(university_id)));

alter table public.institution_domains enable row level security;
alter table public.approved_institution_domains enable row level security;
alter table public.institution_members enable row level security;
alter table public.institution_profile_versions enable row level security;
alter table public.institution_audit_events enable row level security;

create policy institution_domains_admin_read
  on public.institution_domains for select to authenticated
  using ((select private.can_manage_university(university_id)));
create policy institution_domains_admin_write
  on public.institution_domains for all to authenticated
  using ((select private.can_administer_university(university_id)))
  with check ((select private.can_administer_university(university_id)));

create policy approved_domains_founder_only
  on public.approved_institution_domains for all to authenticated
  using ((select private.is_portal_admin()))
  with check ((select private.is_portal_admin()));

create policy institution_members_member_read
  on public.institution_members for select to authenticated
  using ((select private.can_manage_university(university_id)));
create policy institution_members_admin_write
  on public.institution_members for all to authenticated
  using ((select private.can_administer_university(university_id)))
  with check ((select private.can_administer_university(university_id)));

create policy institution_versions_member_read
  on public.institution_profile_versions for select to authenticated
  using ((select private.can_manage_university(university_id)));

create policy institution_audit_admin_read
  on public.institution_audit_events for select to authenticated
  using ((select private.can_administer_university(university_id)));

revoke all on table public.institution_domains, public.approved_institution_domains,
  public.institution_members, public.institution_profile_versions,
  public.institution_audit_events from anon;
grant select, insert, update, delete on table public.institution_domains,
  public.approved_institution_domains, public.institution_members,
  public.institution_profile_versions, public.institution_audit_events to authenticated;

create or replace function public.get_institution_entitlement(p_university_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'university_id', u.id,
    'verified', u.verification_status = 'verified',
    'complete', u.profile_status = 'complete',
    'suspended', u.is_suspended,
    'official_response_enabled', u.verification_status = 'verified'
      and u.profile_status = 'complete'
      and not u.is_suspended,
    'badge', case when u.verification_status = 'verified'
      and u.profile_status = 'complete' and not u.is_suspended then 'institution_official' else null end
  )
    from public.universities u
   where u.id = p_university_id;
$$;

revoke all on function public.get_institution_entitlement(uuid) from public;
grant execute on function public.get_institution_entitlement(uuid) to anon, authenticated;

create or replace function public.claim_institution_domain(
  p_university_id uuid,
  p_domain text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_email_domain text := lower(trim(p_domain));
  v_profile public.profiles%rowtype;
  v_university public.universities%rowtype;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authenticated institutional email is required.';
  end if;

  select * into v_profile from public.profiles where id = v_user_id;
  select * into v_university from public.universities where id = p_university_id for update;

  if v_profile.id is null or v_profile.role not in ('university_rep', 'admin') then
    raise exception using errcode = '42501', message = 'Only an institutional representative can claim a domain.';
  end if;
  if v_university.id is null then
    raise exception using errcode = 'P0002', message = 'Institution not found.';
  end if;
  if lower(split_part(v_profile.email, '@', 2)) <> v_email_domain then
    raise exception using errcode = '42501', message = 'The verified account domain does not match the claimed domain.';
  end if;
  if v_email_domain = any (array['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com']) then
    raise exception using errcode = '22023', message = 'Public email providers cannot verify an institution.';
  end if;

  if not (
    v_university.representative_id = v_user_id
    or (select private.is_portal_admin())
    or exists (
      select 1 from public.approved_institution_domains d
       where d.domain = v_email_domain
         and d.status = 'approved'
         and (d.university_id is null or d.university_id = p_university_id)
    )
  ) then
    raise exception using errcode = '42501', message = 'This domain is not approved for the selected institution.';
  end if;

  insert into public.institution_domains (university_id, domain, status, source, verified_at, created_by)
  values (p_university_id, v_email_domain, 'approved', 'institution', current_timestamp, v_user_id)
  on conflict (university_id, domain) do update
    set status = 'approved', verified_at = current_timestamp, suspended_at = null;

  insert into public.institution_members (university_id, user_id, role, status)
  values (p_university_id, v_user_id, case when v_university.primary_admin_id is null then 'admin' else 'representative' end, 'active')
  on conflict (university_id, user_id) do update
    set status = 'active', removed_at = null;

  update public.universities
     set verification_status = 'verified',
         is_suspended = false,
         primary_admin_id = coalesce(primary_admin_id, v_user_id),
         updated_at = current_timestamp
   where id = p_university_id;

  insert into public.institution_audit_events (university_id, actor_id, event_type, payload)
  values (p_university_id, v_user_id, 'domain_verified', jsonb_build_object('domain', v_email_domain));

  return public.get_institution_entitlement(p_university_id) || jsonb_build_object('domain', v_email_domain);
end;
$$;

revoke all on function public.claim_institution_domain(uuid, text) from public, anon;
grant execute on function public.claim_institution_domain(uuid, text) to authenticated;

create or replace function public.transfer_institution_admin(
  p_university_id uuid,
  p_new_admin_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
begin
  if not (select private.can_administer_university(p_university_id)) then
    raise exception using errcode = '42501', message = 'Institution admin access is required.';
  end if;
  if not exists (
    select 1 from public.institution_members
     where university_id = p_university_id and user_id = p_new_admin_id and status = 'active'
  ) then
    raise exception using errcode = '23514', message = 'The new admin must be an active institution representative.';
  end if;

  update public.institution_members
     set role = case when user_id = p_new_admin_id then 'admin' else 'representative' end
   where university_id = p_university_id and status = 'active';
  update public.universities
     set primary_admin_id = p_new_admin_id, updated_at = current_timestamp
   where id = p_university_id;
  insert into public.institution_audit_events (university_id, actor_id, event_type, payload)
  values (p_university_id, v_actor_id, 'admin_transferred', jsonb_build_object('new_admin_id', p_new_admin_id));
  return jsonb_build_object('university_id', p_university_id, 'primary_admin_id', p_new_admin_id);
end;
$$;

revoke all on function public.transfer_institution_admin(uuid, uuid) from public, anon;
grant execute on function public.transfer_institution_admin(uuid, uuid) to authenticated;

create or replace function public.set_institution_suspension(
  p_university_id uuid,
  p_suspended boolean,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
begin
  if not (select private.can_administer_university(p_university_id)) then
    raise exception using errcode = '42501', message = 'Institution admin access is required.';
  end if;

  update public.universities
     set is_suspended = p_suspended,
         verification_status = case when p_suspended then 'suspended' else 'verified' end,
         updated_at = current_timestamp
   where id = p_university_id;
  update public.institution_domains
     set status = case when p_suspended then 'suspended' else 'approved' end,
         suspended_at = case when p_suspended then current_timestamp else null end
   where university_id = p_university_id;
  insert into public.institution_audit_events (university_id, actor_id, event_type, payload)
  values (p_university_id, v_actor_id, case when p_suspended then 'institution_suspended' else 'institution_reinstated' end,
          jsonb_build_object('reason', p_reason));
  return public.get_institution_entitlement(p_university_id);
end;
$$;

revoke all on function public.set_institution_suspension(uuid, boolean, text) from public, anon;
grant execute on function public.set_institution_suspension(uuid, boolean, text) to authenticated;

commit;

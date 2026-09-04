begin;

-- A representative may create a university through the existing RLS policy,
-- but subsequent institution operations are membership-based. Bootstrap the
-- creator atomically so there is no legacy representative_id-only access path.
create or replace function private.bootstrap_institution_creator_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.representative_id is not null then
    insert into public.institution_members (
      university_id,
      user_id,
      role,
      status,
      invited_by
    ) values (
      new.id,
      new.representative_id,
      'admin',
      'active',
      new.representative_id
    ) on conflict (university_id, user_id) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function private.bootstrap_institution_creator_membership()
  from public, anon, authenticated;

drop trigger if exists bootstrap_institution_creator_membership
  on public.universities;

create trigger bootstrap_institution_creator_membership
after insert on public.universities
for each row
execute function private.bootstrap_institution_creator_membership();

commit;

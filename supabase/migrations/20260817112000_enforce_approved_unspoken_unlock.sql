begin;

-- No submission path, including the dormant reward endpoint, may unlock
-- protected excerpts before a moderator publishes a review owned by the user.
create or replace function private.enforce_inpolor_unlock_evidence()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.has_unlocked_tea is true and not exists (
    select 1
      from public.reviews r
     where r.user_id = new.id
       and r.status = 'published'
  ) then
    new.has_unlocked_tea := false;
  end if;
  return new;
end;
$$;

revoke all on function private.enforce_inpolor_unlock_evidence()
  from public, anon, authenticated;

drop trigger if exists profiles_require_published_review_for_unlock
  on public.profiles;
create trigger profiles_require_published_review_for_unlock
before insert or update of has_unlocked_tea on public.profiles
for each row execute function private.enforce_inpolor_unlock_evidence();

update public.profiles p
   set has_unlocked_tea = false,
       updated_at = current_timestamp
 where p.has_unlocked_tea is true
   and not exists (
     select 1 from public.reviews r
      where r.user_id = p.id
        and r.status = 'published'
   );

commit;

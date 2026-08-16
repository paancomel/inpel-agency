begin;

-- Community identity is created server-side after either magic-link or Google
-- authentication.  Date of birth is accepted once, validated server-side, and
-- is never read from user_metadata for authorization.
create or replace function public.complete_inpolor_community_onboarding(
  p_date_of_birth date,
  p_locale text default 'en'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication is required.';
  end if;
  if p_date_of_birth is null or p_date_of_birth > current_date - interval '18 years'
     or p_date_of_birth < date '1900-01-01' then
    raise exception using errcode = '22023', message = 'You must be 18 or older to join INPOLOR.';
  end if;
  if p_locale not in ('en', 'ms') then
    raise exception using errcode = '22023', message = 'Unsupported locale.';
  end if;

  select email into v_email from auth.users where id = v_user_id;
  insert into public.profiles (id, email, role, date_of_birth, preferred_locale)
  values (v_user_id, coalesce(v_email, ''), 'community_user', p_date_of_birth, p_locale)
  on conflict (id) do update set
    preferred_locale = excluded.preferred_locale,
    email = case when public.profiles.email = '' then excluded.email else public.profiles.email end;

  if exists (
    select 1 from public.profiles
    where id = v_user_id and date_of_birth is distinct from p_date_of_birth
  ) then
    raise exception using errcode = '22023', message = 'Date of birth cannot be changed.';
  end if;

  return jsonb_build_object('profile_id', v_user_id, 'onboarded', true);
end;
$$;

revoke all on function public.complete_inpolor_community_onboarding(date, text) from public, anon;
grant execute on function public.complete_inpolor_community_onboarding(date, text) to authenticated;

commit;

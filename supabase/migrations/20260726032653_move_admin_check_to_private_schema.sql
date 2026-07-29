begin;

-- `is_portal_admin` is an implementation detail for RLS policies. Keep it out
-- of the exposed `public` API schema so authenticated users cannot invoke it
-- as a standalone RPC endpoint.
create or replace function private.is_portal_admin()
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

revoke all on function private.is_portal_admin() from public, anon;
grant execute on function private.is_portal_admin() to authenticated;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select private.is_portal_admin()));

drop policy if exists universities_owner_insert on public.universities;
drop policy if exists universities_owner_update on public.universities;
drop policy if exists universities_owner_delete on public.universities;
drop policy if exists courses_owner_insert on public.courses;
drop policy if exists courses_owner_update on public.courses;
drop policy if exists courses_owner_delete on public.courses;
drop policy if exists gallery_images_owner_insert on public.gallery_images;
drop policy if exists gallery_images_owner_update on public.gallery_images;
drop policy if exists gallery_images_owner_delete on public.gallery_images;

create policy universities_owner_insert
  on public.universities for insert to authenticated
  with check (
    (select private.is_current_user_university_rep_or_admin())
    and (
      representative_id = (select auth.uid())
      or (select private.is_portal_admin())
    )
  );

create policy universities_owner_update
  on public.universities for update to authenticated
  using (
    (select private.is_current_user_university_rep_or_admin())
    and (
      representative_id = (select auth.uid())
      or (select private.is_portal_admin())
    )
  )
  with check (
    (select private.is_current_user_university_rep_or_admin())
    and (
      representative_id = (select auth.uid())
      or (select private.is_portal_admin())
    )
  );

create policy universities_owner_delete
  on public.universities for delete to authenticated
  using (
    (select private.is_current_user_university_rep_or_admin())
    and (
      representative_id = (select auth.uid())
      or (select private.is_portal_admin())
    )
  );

create policy courses_owner_insert
  on public.courses for insert to authenticated
  with check (
    (select private.is_current_user_university_rep_or_admin())
    and exists (
      select 1 from public.universities u
       where u.id = university_id
         and (u.representative_id = (select auth.uid()) or (select private.is_portal_admin()))
    )
  );

create policy courses_owner_update
  on public.courses for update to authenticated
  using (
    (select private.is_current_user_university_rep_or_admin())
    and exists (
      select 1 from public.universities u
       where u.id = university_id
         and (u.representative_id = (select auth.uid()) or (select private.is_portal_admin()))
    )
  )
  with check (
    (select private.is_current_user_university_rep_or_admin())
    and exists (
      select 1 from public.universities u
       where u.id = university_id
         and (u.representative_id = (select auth.uid()) or (select private.is_portal_admin()))
    )
  );

create policy courses_owner_delete
  on public.courses for delete to authenticated
  using (
    (select private.is_current_user_university_rep_or_admin())
    and exists (
      select 1 from public.universities u
       where u.id = university_id
         and (u.representative_id = (select auth.uid()) or (select private.is_portal_admin()))
    )
  );

create policy gallery_images_owner_insert
  on public.gallery_images for insert to authenticated
  with check (
    (select private.is_current_user_university_rep_or_admin())
    and exists (
      select 1 from public.universities u
       where u.id = university_id
         and (u.representative_id = (select auth.uid()) or (select private.is_portal_admin()))
    )
  );

create policy gallery_images_owner_update
  on public.gallery_images for update to authenticated
  using (
    (select private.is_current_user_university_rep_or_admin())
    and exists (
      select 1 from public.universities u
       where u.id = university_id
         and (u.representative_id = (select auth.uid()) or (select private.is_portal_admin()))
    )
  )
  with check (
    (select private.is_current_user_university_rep_or_admin())
    and exists (
      select 1 from public.universities u
       where u.id = university_id
         and (u.representative_id = (select auth.uid()) or (select private.is_portal_admin()))
    )
  );

create policy gallery_images_owner_delete
  on public.gallery_images for delete to authenticated
  using (
    (select private.is_current_user_university_rep_or_admin())
    and exists (
      select 1 from public.universities u
       where u.id = university_id
         and (u.representative_id = (select auth.uid()) or (select private.is_portal_admin()))
    )
  );

create or replace function private.can_manage_university_asset(
  p_bucket_id text,
  p_name text
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_parts text[] := storage.foldername(p_name);
  v_filename text := lower(storage.filename(p_name));
begin
  return p_bucket_id = 'university-assets'
    and (select private.is_current_user_university_rep_or_admin())
    and (
      (array_length(v_parts, 1) = 3 and v_parts[3] = 'logo')
      or (
        array_length(v_parts, 1) = 4
        and v_parts[3] = 'facilities'
        and v_parts[4] in ('library', 'labs', 'accommodation', 'sports', 'career', 'counselling')
      )
    )
    and v_parts[1] = (select auth.uid())::text
    and v_filename ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|webp)$'
    and exists (
      select 1
        from public.universities u
       where u.id::text = v_parts[2]
         and (u.representative_id = (select auth.uid()) or (select private.is_portal_admin()))
    );
end;
$$;

revoke all on function private.can_manage_university_asset(text, text) from public, anon;
grant execute on function private.can_manage_university_asset(text, text) to authenticated;

revoke all on function public.is_portal_admin() from public, anon, authenticated;

commit;

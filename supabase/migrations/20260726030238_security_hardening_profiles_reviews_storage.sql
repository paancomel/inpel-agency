begin;

-- University management must require an institutional role, not merely a row
-- whose representative_id was supplied by an authenticated browser client.
create or replace function private.is_current_user_university_rep_or_admin()
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
       and p.role in ('university_rep', 'admin')
  );
$$;

revoke all on function private.is_current_user_university_rep_or_admin() from public, anon;
grant execute on function private.is_current_user_university_rep_or_admin() to authenticated;

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
      or (select public.is_portal_admin())
    )
  );

create policy universities_owner_update
  on public.universities for update to authenticated
  using (
    (select private.is_current_user_university_rep_or_admin())
    and (
      representative_id = (select auth.uid())
      or (select public.is_portal_admin())
    )
  )
  with check (
    (select private.is_current_user_university_rep_or_admin())
    and (
      representative_id = (select auth.uid())
      or (select public.is_portal_admin())
    )
  );

create policy universities_owner_delete
  on public.universities for delete to authenticated
  using (
    (select private.is_current_user_university_rep_or_admin())
    and (
      representative_id = (select auth.uid())
      or (select public.is_portal_admin())
    )
  );

create policy courses_owner_insert
  on public.courses for insert to authenticated
  with check (
    (select private.is_current_user_university_rep_or_admin())
    and exists (
      select 1 from public.universities u
       where u.id = university_id
         and (u.representative_id = (select auth.uid()) or (select public.is_portal_admin()))
    )
  );

create policy courses_owner_update
  on public.courses for update to authenticated
  using (
    (select private.is_current_user_university_rep_or_admin())
    and exists (
      select 1 from public.universities u
       where u.id = university_id
         and (u.representative_id = (select auth.uid()) or (select public.is_portal_admin()))
    )
  )
  with check (
    (select private.is_current_user_university_rep_or_admin())
    and exists (
      select 1 from public.universities u
       where u.id = university_id
         and (u.representative_id = (select auth.uid()) or (select public.is_portal_admin()))
    )
  );

create policy courses_owner_delete
  on public.courses for delete to authenticated
  using (
    (select private.is_current_user_university_rep_or_admin())
    and exists (
      select 1 from public.universities u
       where u.id = university_id
         and (u.representative_id = (select auth.uid()) or (select public.is_portal_admin()))
    )
  );

create policy gallery_images_owner_insert
  on public.gallery_images for insert to authenticated
  with check (
    (select private.is_current_user_university_rep_or_admin())
    and exists (
      select 1 from public.universities u
       where u.id = university_id
         and (u.representative_id = (select auth.uid()) or (select public.is_portal_admin()))
    )
  );

create policy gallery_images_owner_update
  on public.gallery_images for update to authenticated
  using (
    (select private.is_current_user_university_rep_or_admin())
    and exists (
      select 1 from public.universities u
       where u.id = university_id
         and (u.representative_id = (select auth.uid()) or (select public.is_portal_admin()))
    )
  )
  with check (
    (select private.is_current_user_university_rep_or_admin())
    and exists (
      select 1 from public.universities u
       where u.id = university_id
         and (u.representative_id = (select auth.uid()) or (select public.is_portal_admin()))
    )
  );

create policy gallery_images_owner_delete
  on public.gallery_images for delete to authenticated
  using (
    (select private.is_current_user_university_rep_or_admin())
    and exists (
      select 1 from public.universities u
       where u.id = university_id
         and (u.representative_id = (select auth.uid()) or (select public.is_portal_admin()))
    )
  );

-- Public retrieval of an already-known URL is supplied by the public bucket.
-- Do not grant object listing, replacement, copy, or move through storage.objects.
drop policy if exists university_assets_public_read on storage.objects;
drop policy if exists university_assets_owner_update on storage.objects;
drop policy if exists university_assets_owner_insert on storage.objects;
drop policy if exists university_assets_owner_delete on storage.objects;

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
         and (u.representative_id = (select auth.uid()) or (select public.is_portal_admin()))
    );
end;
$$;

revoke all on function private.can_manage_university_asset(text, text) from public, anon;
grant execute on function private.can_manage_university_asset(text, text) to authenticated;

create policy university_assets_owner_insert
  on storage.objects for insert to authenticated
  with check ((select private.can_manage_university_asset(bucket_id, name)));

create policy university_assets_owner_delete
  on storage.objects for delete to authenticated
  using ((select private.can_manage_university_asset(bucket_id, name)));

-- Raw community rows never cross the Data API boundary. Moderation and the
-- redacted view below are the only public review paths.
alter table public.reviews
  add column created_at timestamptz not null default current_timestamp,
  add column status text not null default 'pending',
  add constraint reviews_status_check check (status in ('pending', 'published', 'rejected', 'removed')),
  add constraint reviews_no_submitter_check check (
    review_data is null
    or (jsonb_typeof(review_data) = 'object' and not (review_data ? 'submitter'))
  ) not valid;

alter table public.comments
  add column created_at timestamptz not null default current_timestamp,
  add column status text not null default 'pending',
  add constraint comments_status_check check (status in ('pending', 'published', 'rejected', 'removed'));

alter table public.reviews enable row level security;
alter table public.comments enable row level security;
alter table public.review_likes enable row level security;
revoke all on table public.reviews from public, anon, authenticated;
revoke all on table public.comments from public, anon, authenticated;
revoke all on table public.review_likes from public, anon, authenticated;

create or replace view public.published_reviews
with (security_barrier = true)
as
select
  r.id,
  r.university_id,
  r.review_data ->> 'course' as course,
  r.review_data ->> 'year' as year,
  (r.review_data ->> 'rating')::integer as rating,
  r.review_data ->> 'greenFlags' as green_flags,
  r.review_data ->> 'redFlags' as red_flags,
  r.review_data ->> 'spillTheTea' as spill_the_tea,
  coalesce(r.review_data -> 'vibeTags', '[]'::jsonb) as vibe_tags,
  r.is_anonymous,
  r.likes_count,
  r.created_at
from public.reviews r
where r.status = 'published';

revoke all on table public.published_reviews from public, anon, authenticated;
grant select on table public.published_reviews to anon, authenticated;

create or replace function public.submit_review_for_moderation(
  p_university_id uuid,
  p_review_data jsonb,
  p_is_anonymous boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_course text;
  v_year text;
  v_rating integer;
  v_green_flags text;
  v_red_flags text;
  v_spill_the_tea text;
  v_vibe_tags jsonb;
  v_review_id uuid;
  v_sanitized_review jsonb;
begin
  if p_university_id is null or not exists (
    select 1 from public.universities where id = p_university_id
  ) then
    raise exception using errcode = '22023', message = 'A valid university is required.';
  end if;

  if p_is_anonymous is null or coalesce(jsonb_typeof(p_review_data), '') <> 'object' then
    raise exception using errcode = '22023', message = 'A complete review is required.';
  end if;

  if not p_is_anonymous and v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication is required for a named review.';
  end if;

  v_course := btrim(coalesce(p_review_data ->> 'course', ''));
  v_year := btrim(coalesce(p_review_data ->> 'year', ''));
  v_green_flags := btrim(coalesce(p_review_data ->> 'greenFlags', ''));
  v_red_flags := btrim(coalesce(p_review_data ->> 'redFlags', ''));
  v_spill_the_tea := btrim(coalesce(p_review_data ->> 'spillTheTea', ''));
  v_vibe_tags := coalesce(p_review_data -> 'vibeTags', '[]'::jsonb);

  if length(v_course) not between 1 and 120
     or length(v_year) not between 1 and 80
     or length(v_green_flags) > 2000
     or length(v_red_flags) > 2000
     or length(v_spill_the_tea) not between 1 and 4000
     or coalesce(p_review_data ->> 'rating', '') !~ '^[1-5]$'
     or jsonb_typeof(v_vibe_tags) <> 'array'
     or jsonb_array_length(v_vibe_tags) > 12
     or exists (
       select 1
         from jsonb_array_elements(v_vibe_tags) as tag(value)
        where jsonb_typeof(tag.value) <> 'string'
           or length(tag.value #>> '{}') > 50
     ) then
    raise exception using errcode = '22023', message = 'The review contains invalid fields.';
  end if;

  v_rating := (p_review_data ->> 'rating')::integer;
  v_sanitized_review := jsonb_build_object(
    'course', v_course,
    'year', v_year,
    'rating', v_rating,
    'greenFlags', v_green_flags,
    'redFlags', v_red_flags,
    'spillTheTea', v_spill_the_tea,
    'vibeTags', v_vibe_tags
  );

  insert into public.reviews (
    user_id, university_id, review_data, is_anonymous, likes_count, status
  ) values (
    case when p_is_anonymous then null else v_user_id end,
    p_university_id,
    v_sanitized_review,
    p_is_anonymous,
    0,
    'pending'
  ) returning id into v_review_id;

  return jsonb_build_object('review_id', v_review_id, 'status', 'pending');
end;
$$;

revoke all on function public.submit_review_for_moderation(uuid, jsonb, boolean) from public;
grant execute on function public.submit_review_for_moderation(uuid, jsonb, boolean) to anon, authenticated;

commit;

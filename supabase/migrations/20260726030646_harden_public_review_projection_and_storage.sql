begin;

-- Remove all legacy object policies. Public buckets serve already-known public
-- object URLs without SELECT on storage.objects, so listing must stay blocked.
drop policy if exists "university assets are publicly readable" on storage.objects;
drop policy if exists "representatives upload owned university assets" on storage.objects;
drop policy if exists "representatives update owned university assets" on storage.objects;
drop policy if exists "representatives delete owned university assets" on storage.objects;

-- A normal view uses the view owner by default. Replace the former redacted
-- SECURITY DEFINER view with an explicit projection table: browser roles may
-- read only these approved fields and never public.reviews itself.
drop view if exists public.published_reviews;

create table public.published_reviews (
  id uuid not null,
  university_id uuid,
  course text not null,
  year text not null,
  rating integer not null,
  green_flags text not null default '',
  red_flags text not null default '',
  spill_the_tea text not null,
  vibe_tags jsonb not null default '[]'::jsonb,
  is_anonymous boolean not null,
  likes_count integer not null default 0,
  created_at timestamptz not null,
  constraint published_reviews_pkey primary key (id),
  constraint published_reviews_id_fkey
    foreign key (id) references public.reviews (id) on delete cascade,
  constraint published_reviews_university_id_fkey
    foreign key (university_id) references public.universities (id) on delete set null,
  constraint published_reviews_course_length_check
    check (length(course) between 1 and 120),
  constraint published_reviews_year_length_check
    check (length(year) between 1 and 80),
  constraint published_reviews_rating_check
    check (rating between 1 and 5),
  constraint published_reviews_spill_length_check
    check (length(spill_the_tea) between 1 and 4000),
  constraint published_reviews_vibe_tags_check
    check (jsonb_typeof(vibe_tags) = 'array'),
  constraint published_reviews_likes_count_check
    check (likes_count >= 0)
);

alter table public.published_reviews enable row level security;
revoke all on table public.published_reviews from public, anon, authenticated;
grant select on table public.published_reviews to anon, authenticated;

create policy published_reviews_public_read
  on public.published_reviews for select to anon, authenticated
  using (true);

create or replace function private.sync_published_review_projection()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    delete from public.published_reviews where id = old.id;
    return old;
  end if;

  if new.status <> 'published' then
    delete from public.published_reviews where id = new.id;
    return new;
  end if;

  insert into public.published_reviews (
    id, university_id, course, year, rating, green_flags, red_flags,
    spill_the_tea, vibe_tags, is_anonymous, likes_count, created_at
  ) values (
    new.id,
    new.university_id,
    btrim(coalesce(new.review_data ->> 'course', '')),
    btrim(coalesce(new.review_data ->> 'year', '')),
    case
      when coalesce(new.review_data ->> 'rating', '') ~ '^[1-5]$'
        then (new.review_data ->> 'rating')::integer
      else 0
    end,
    btrim(coalesce(new.review_data ->> 'greenFlags', '')),
    btrim(coalesce(new.review_data ->> 'redFlags', '')),
    btrim(coalesce(new.review_data ->> 'spillTheTea', '')),
    coalesce(new.review_data -> 'vibeTags', '[]'::jsonb),
    coalesce(new.is_anonymous, false),
    coalesce(new.likes_count, 0),
    new.created_at
  )
  on conflict (id) do update
    set university_id = excluded.university_id,
        course = excluded.course,
        year = excluded.year,
        rating = excluded.rating,
        green_flags = excluded.green_flags,
        red_flags = excluded.red_flags,
        spill_the_tea = excluded.spill_the_tea,
        vibe_tags = excluded.vibe_tags,
        is_anonymous = excluded.is_anonymous,
        likes_count = excluded.likes_count,
        created_at = excluded.created_at;

  return new;
end;
$$;

revoke all on function private.sync_published_review_projection() from public, anon, authenticated;

create trigger reviews_sync_published_projection
after insert or update of status, review_data, is_anonymous, likes_count, university_id, created_at or delete
on public.reviews
for each row execute function private.sync_published_review_projection();

-- Preserve any reviews already published before the projection table existed.
insert into public.published_reviews (
  id, university_id, course, year, rating, green_flags, red_flags,
  spill_the_tea, vibe_tags, is_anonymous, likes_count, created_at
)
select
  r.id,
  r.university_id,
  btrim(coalesce(r.review_data ->> 'course', '')),
  btrim(coalesce(r.review_data ->> 'year', '')),
  case
    when coalesce(r.review_data ->> 'rating', '') ~ '^[1-5]$'
      then (r.review_data ->> 'rating')::integer
    else 0
  end,
  btrim(coalesce(r.review_data ->> 'greenFlags', '')),
  btrim(coalesce(r.review_data ->> 'redFlags', '')),
  btrim(coalesce(r.review_data ->> 'spillTheTea', '')),
  coalesce(r.review_data -> 'vibeTags', '[]'::jsonb),
  coalesce(r.is_anonymous, false),
  coalesce(r.likes_count, 0),
  r.created_at
from public.reviews r
where r.status = 'published';

commit;

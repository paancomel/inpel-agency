begin;

drop index if exists public.published_reviews_university_visibility_published_idx;

create index if not exists published_reviews_university_visibility_idx
  on public.published_reviews (university_id, visibility_status, published_at desc);

commit;

begin;

set local search_path = public, extensions;

select plan(15);

select has_column(
  'public',
  'universities',
  'representative_id',
  'universities retain the legacy representative link during membership migration'
);

select col_is_fk(
  'public',
  'universities',
  'representative_id',
  'representative id references profiles'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.universities'::regclass),
  true,
  'universities enforce row level security'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.courses'::regclass),
  true,
  'courses enforce row level security'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.gallery_images'::regclass),
  true,
  'gallery images enforce row level security'
);

select is(
  (select public from storage.buckets where id = 'university-assets'),
  true,
  'the institution asset bucket is publicly readable'
);

select is(
  (select file_size_limit from storage.buckets where id = 'university-assets'),
  5242880::bigint,
  'the institution asset bucket has a 5 MB limit'
);

select is(
  (select allowed_mime_types from storage.buckets where id = 'university-assets'),
  array['image/png', 'image/jpeg', 'image/webp']::text[],
  'the institution asset bucket accepts only safe browser image formats'
);

select policies_are(
  'public',
  'universities',
  array[
    'universities are publicly readable',
    'universities_member_delete',
    'universities_member_update',
    'universities_owner_insert'
  ],
  'universities expose public reads, controlled creation, and membership writes'
);

select policies_are(
  'storage',
  'objects',
  array[
    'university_assets_owner_delete',
    'university_assets_owner_insert'
  ],
  'institution assets allow only owner-scoped inserts and deletes'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  true,
  'profiles enforce row level security'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.reviews'::regclass),
  true,
  'reviews enforce row level security'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.comments'::regclass),
  true,
  'comments enforce row level security'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.review_likes'::regclass),
  true,
  'review likes enforce row level security'
);

select policies_are(
  'public',
  'profiles',
  array['profiles_select_own_or_admin'],
  'profiles do not retain broad browser write policies'
);

select * from finish();

rollback;

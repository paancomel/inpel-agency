begin;

set local search_path = public, extensions;

select plan(14);

select is(
  (select relrowsecurity from pg_class where oid = 'public.session_student_bindings'::regclass),
  true,
  'session bindings enforce RLS'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.sessions'::regclass),
  true,
  'family sessions enforce RLS'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.student_assessments'::regclass),
  true,
  'student assessments enforce RLS'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.recommendation_results'::regclass),
  true,
  'recommendation results enforce RLS'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.payments'::regclass),
  true,
  'payments enforce RLS'
);

select ok(
  not has_table_privilege('authenticated', 'public.session_student_bindings', 'select'),
  'authenticated users cannot read invitation token or email digests'
);

select ok(
  not has_table_privilege('authenticated', 'public.sessions', 'insert')
  and not has_table_privilege('authenticated', 'public.sessions', 'update')
  and not has_table_privilege('authenticated', 'public.sessions', 'delete'),
  'authenticated users cannot mutate family sessions directly'
);

select ok(
  not has_table_privilege('authenticated', 'public.student_assessments', 'insert')
  and not has_table_privilege('authenticated', 'public.student_assessments', 'update')
  and not has_table_privilege('authenticated', 'public.student_assessments', 'delete'),
  'authenticated users cannot mutate assessments directly'
);

select ok(
  not has_table_privilege('authenticated', 'public.recommendation_results', 'insert')
  and not has_table_privilege('authenticated', 'public.recommendation_results', 'update')
  and not has_table_privilege('authenticated', 'public.recommendation_results', 'delete'),
  'authenticated users cannot mutate recommendations directly'
);

select ok(
  not has_table_privilege('authenticated', 'public.payments', 'insert')
  and not has_table_privilege('authenticated', 'public.payments', 'update')
  and not has_table_privilege('authenticated', 'public.payments', 'delete'),
  'authenticated users cannot mutate payment rows directly'
);

select ok(
  not has_table_privilege('authenticated', 'public.profiles', 'insert')
  and not has_table_privilege('authenticated', 'public.profiles', 'update')
  and not has_table_privilege('authenticated', 'public.profiles', 'delete'),
  'authenticated users cannot create or alter authoritative profiles directly'
);

select ok(
  has_table_privilege('authenticated', 'public.reviews', 'select')
  and not has_table_privilege('anon', 'public.reviews', 'select')
  and not has_table_privilege('authenticated', 'public.reviews', 'insert')
  and not has_table_privilege('authenticated', 'public.reviews', 'update')
  and not has_table_privilege('authenticated', 'public.reviews', 'delete')
  and exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename = 'reviews'
       and policyname = 'reviews_owner_or_content_moderator_read'
       and cmd = 'SELECT'
  ),
  'raw reviews are readable only through owner-or-moderator RLS and are not directly mutable'
);

select ok(
  to_regclass('public.student_assessments_session_id_key') is not null,
  'a unique session assessment index enforces one assessment per non-null session'
);

select results_eq(
  $$
    select policyname::text
      from pg_policies
     where schemaname = 'storage'
       and tablename = 'objects'
       and policyname in ('university_assets_public_read', 'university_assets_owner_update')
     order by policyname
  $$,
  $$ select null::text where false $$,
  'storage has neither a public list policy nor an object move/update policy'
);

select * from finish();

rollback;

begin;

set local search_path = public, extensions;

select plan(16);

select is(
  coalesce((select reloptions @> array['security_invoker=true']
    from pg_class where oid = 'public.shared_catalog_institutions'::regclass), false),
  true,
  'shared institution catalogue uses caller permissions'
);

select is(
  coalesce((select reloptions @> array['security_invoker=true']
    from pg_class where oid = 'public.shared_catalog_programmes'::regclass), false),
  true,
  'shared programme catalogue uses caller permissions'
);

select is(
  coalesce((select reloptions @> array['security_invoker=true']
    from pg_class where oid = 'public.inpolor_catalog_institutions'::regclass), false),
  true,
  'INPOLOR institution catalogue uses caller permissions'
);

select is(
  coalesce((select reloptions @> array['security_invoker=true']
    from pg_class where oid = 'public.inpolor_catalog_programmes'::regclass), false),
  true,
  'INPOLOR programme catalogue uses caller permissions'
);

select results_eq(
  $$
    select policyname::text
      from pg_policies
     where schemaname = 'public'
       and policyname in (
         'representatives create owned universities',
         'representatives update owned universities',
         'representatives delete owned universities',
         'representatives create courses for owned universities',
         'representatives update courses for owned universities',
         'representatives delete courses for owned universities',
         'representatives manage owned gallery images'
       )
  $$,
  $$ select null::text where false $$,
  'legacy representative policies are removed'
);

select results_eq(
  $$
    select (tablename || '.' || policyname)::text COLLATE "C"
      from pg_policies
     where schemaname = 'public'
       and policyname in (
         'reference_institutions_public_catalog_read',
         'reference_programmes_public_catalog_read',
         'nec_classifications_public_catalog_read',
         'reference_institution_links_verified_read',
         'reference_programme_links_verified_read',
         'portal_catalog_visibility_published_read'
       )
     order by tablename, policyname
  $$,
  $$
    values
      ('nec_classifications.nec_classifications_public_catalog_read'::text COLLATE "C"),
      ('portal_catalog_visibility.portal_catalog_visibility_published_read'::text COLLATE "C"),
      ('reference_institution_links.reference_institution_links_verified_read'::text COLLATE "C"),
      ('reference_institutions.reference_institutions_public_catalog_read'::text COLLATE "C"),
      ('reference_programme_links.reference_programme_links_verified_read'::text COLLATE "C"),
      ('reference_programmes.reference_programmes_public_catalog_read'::text COLLATE "C")
  $$,
  'catalogue RLS policies expose only reviewed public-safe rows'
);

select ok(
  position('mainExperience' in pg_get_functiondef(
    'private.sync_inpolor_review_projection()'::regprocedure
  )) > 0,
  'review projection reads the structured main experience'
);

select ok(
  position('update public.reviews set status=''hidden_under_review''' in pg_get_functiondef(
    'public.report_inpolor_content(text,uuid,text,text)'::regprocedure
  )) = 0,
  'one report does not automatically hide a review'
);

select ok(
  position('has_unlocked_tea = true' in pg_get_functiondef(
    'public.moderate_inpolor_review(uuid,text,text)'::regprocedure
  )) > 0,
  'approved reviews unlock protected excerpts'
);

select ok(
  exists (
    select 1
      from pg_trigger
     where tgrelid = 'public.profiles'::regclass
       and tgname = 'profiles_require_published_review_for_unlock'
       and not tgisinternal
  )
  and position('status = ''published''' in pg_get_functiondef(
    'private.enforce_inpolor_unlock_evidence()'::regprocedure
  )) > 0,
  'all unlock writes require an owned published review'
);

select ok(
  position('coalesce(date_of_birth, p_date_of_birth)' in pg_get_functiondef(
    'public.complete_inpolor_community_onboarding(date,text)'::regprocedure
  )) > 0,
  'existing cross-portal profiles may set birth date once'
);

select ok(
  to_regprocedure(
    'public.create_parent_student_invitation(text,text,text,jsonb,jsonb,text,boolean)'
  ) is not null,
  'strict parent invitation wrapper is installed'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.create_parent_student_invitation_unchecked(text,text,text,jsonb,jsonb,text,boolean)',
    'EXECUTE'
  ),
  'unchecked invitation implementation is not a browser endpoint'
);

select throws_ok(
  $$
    select public.create_parent_student_invitation(
      'student@example.test',
      'Selangor',
      'RM 6,000 - RM 9,999',
      '{}'::jsonb,
      '{}'::jsonb,
      '18+',
      false
    )
  $$,
  '22023',
  'Every parent preference is required.',
  'partial parent preference payloads are rejected before invitation creation'
);

select throws_ok(
  $$
    select public.create_parent_student_invitation(
      'student@example.test',
      'Selangor',
      'RM 6,000 - RM 9,999',
      jsonb_build_object(
        'campus_vibe', null,
        'campus_concern', 'Campus safety & physical well-being',
        'ultimate_win', 'Guaranteed high-paying employment',
        'independence', 'Needs some structural guidance'
      ),
      jsonb_build_object(
        'campusVibe', null,
        'campusConcern', 'Campus safety & physical well-being',
        'ultimateWin', 'Guaranteed high-paying employment',
        'independence', 'Needs some structural guidance'
      ),
      '18+',
      false
    )
  $$,
  '22023',
  'Parent preferences contain an unsupported value.',
  'present-but-null preference values are rejected'
);

select has_index(
  'public',
  'published_reviews',
  'published_reviews_university_visibility_published_idx',
  'public review lookups have a covering university and visibility index'
);

select * from finish();

rollback;

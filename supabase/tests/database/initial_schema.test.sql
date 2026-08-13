begin;

set local search_path = public, extensions;

select plan(12);

select results_eq(
  $$
    select table_name::text COLLATE "C"
    from information_schema.tables
    where table_schema = 'public'
      and table_name in (
        'profiles',
        'universities',
        'gallery_images',
        'courses',
        'sessions',
        'student_assessments',
        'recommendation_results',
        'payments',
        'reviews',
        'comments',
        'review_likes'
      )
    order by table_name
  $$,
  $$
    values
      ('comments'::text COLLATE "C"),
      ('courses'::text COLLATE "C"),
      ('gallery_images'::text COLLATE "C"),
      ('payments'::text COLLATE "C"),
      ('profiles'::text COLLATE "C"),
      ('recommendation_results'::text COLLATE "C"),
      ('review_likes'::text COLLATE "C"),
      ('reviews'::text COLLATE "C"),
      ('sessions'::text COLLATE "C"),
      ('student_assessments'::text COLLATE "C"),
      ('universities'::text COLLATE "C")
  $$,
  'creates every blueprint table in the public schema'
);

select results_eq(
  $$
    select table_name::text COLLATE "C", count(*)::bigint
    from information_schema.columns
    where table_schema = 'public'
      and table_name in (
        'profiles', 'universities', 'gallery_images', 'courses', 'sessions',
        'student_assessments', 'recommendation_results', 'payments', 'reviews',
        'comments', 'review_likes'
      )
    group by table_name
    order by table_name
  $$,
  $$
    values
      ('comments'::text COLLATE "C", 6::bigint),
      ('courses'::text COLLATE "C", 6::bigint),
      ('gallery_images'::text COLLATE "C", 4::bigint),
      ('payments'::text COLLATE "C", 4::bigint),
      ('profiles'::text COLLATE "C", 5::bigint),
      ('recommendation_results'::text COLLATE "C", 5::bigint),
      ('review_likes'::text COLLATE "C", 3::bigint),
      ('reviews'::text COLLATE "C", 8::bigint),
      ('sessions'::text COLLATE "C", 8::bigint),
      ('student_assessments'::text COLLATE "C", 8::bigint),
      ('universities'::text COLLATE "C", 12::bigint)
  $$,
  'creates the exact number of columns declared for each table'
);

select results_eq(
  $$
    select constraint_name::text COLLATE "C"
    from information_schema.table_constraints
    where constraint_schema = 'public'
      and constraint_type = 'PRIMARY KEY'
      and table_name in (
        'profiles', 'universities', 'gallery_images', 'courses', 'sessions',
        'student_assessments', 'recommendation_results', 'payments', 'reviews',
        'comments', 'review_likes'
      )
    order by constraint_name
  $$,
  $$
    values
      ('comments_pkey'::text COLLATE "C"),
      ('courses_pkey'::text COLLATE "C"),
      ('gallery_images_pkey'::text COLLATE "C"),
      ('payments_pkey'::text COLLATE "C"),
      ('profiles_pkey'::text COLLATE "C"),
      ('recommendation_results_pkey'::text COLLATE "C"),
      ('review_likes_pkey'::text COLLATE "C"),
      ('reviews_pkey'::text COLLATE "C"),
      ('sessions_pkey'::text COLLATE "C"),
      ('student_assessments_pkey'::text COLLATE "C"),
      ('universities_pkey'::text COLLATE "C")
  $$,
  'creates a primary key for every blueprint table'
);

select results_eq(
  $$
    select constraint_name::text COLLATE "C"
    from information_schema.table_constraints
    where constraint_schema = 'public'
      and constraint_type = 'UNIQUE'
      and table_name in ('profiles', 'universities', 'courses', 'review_likes')
    order by constraint_name
  $$,
  $$
    values
      ('courses_mqa_code_key'::text COLLATE "C"),
      ('profiles_email_key'::text COLLATE "C"),
      ('review_likes_review_id_user_id_key'::text COLLATE "C"),
      ('universities_name_key'::text COLLATE "C")
  $$,
  'creates every declared single-column and composite unique constraint'
);

select results_eq(
  $$
    select tc.constraint_name::text COLLATE "C", rc.delete_rule::text COLLATE "C"
    from information_schema.table_constraints as tc
    join information_schema.referential_constraints as rc
      on rc.constraint_schema = tc.constraint_schema
     and rc.constraint_name = tc.constraint_name
    where tc.constraint_schema = 'public'
      and tc.constraint_type = 'FOREIGN KEY'
      and tc.table_name in (
        'profiles', 'universities', 'gallery_images', 'courses', 'sessions',
        'student_assessments', 'recommendation_results', 'payments', 'reviews',
        'comments', 'review_likes'
      )
    order by tc.constraint_name
  $$,
  $$
    values
      ('comments_review_id_fkey'::text COLLATE "C", 'CASCADE'::text COLLATE "C"),
      ('comments_user_id_fkey'::text COLLATE "C", 'NO ACTION'::text COLLATE "C"),
      ('courses_university_id_fkey'::text COLLATE "C", 'CASCADE'::text COLLATE "C"),
      ('gallery_images_university_id_fkey'::text COLLATE "C", 'CASCADE'::text COLLATE "C"),
      ('payments_session_id_fkey'::text COLLATE "C", 'NO ACTION'::text COLLATE "C"),
      ('profiles_id_fkey'::text COLLATE "C", 'NO ACTION'::text COLLATE "C"),
      ('recommendation_results_session_id_fkey'::text COLLATE "C", 'NO ACTION'::text COLLATE "C"),
      ('recommendation_results_university_id_fkey'::text COLLATE "C", 'NO ACTION'::text COLLATE "C"),
      ('review_likes_review_id_fkey'::text COLLATE "C", 'CASCADE'::text COLLATE "C"),
      ('review_likes_user_id_fkey'::text COLLATE "C", 'NO ACTION'::text COLLATE "C"),
      ('reviews_university_id_fkey'::text COLLATE "C", 'NO ACTION'::text COLLATE "C"),
      ('reviews_user_id_fkey'::text COLLATE "C", 'NO ACTION'::text COLLATE "C"),
      ('sessions_parent_id_fkey'::text COLLATE "C", 'NO ACTION'::text COLLATE "C"),
      ('student_assessments_session_id_fkey'::text COLLATE "C", 'NO ACTION'::text COLLATE "C"),
      ('student_assessments_student_id_fkey'::text COLLATE "C", 'NO ACTION'::text COLLATE "C"),
      ('universities_representative_id_fkey'::text COLLATE "C", 'SET NULL'::text COLLATE "C")
  $$,
  'preserves foreign keys for the original public tables'
);

select results_eq(
  $$
    select table_name::text COLLATE "C", count(*)::bigint
    from information_schema.columns
    where table_schema = 'public'
      and is_nullable = 'NO'
      and table_name in (
        'profiles', 'universities', 'gallery_images', 'courses', 'sessions',
        'student_assessments', 'recommendation_results', 'payments', 'reviews',
        'comments', 'review_likes'
      )
    group by table_name
    order by table_name
  $$,
  $$
    values
      ('comments'::text COLLATE "C", 4::bigint),
      ('courses'::text COLLATE "C", 2::bigint),
      ('gallery_images'::text COLLATE "C", 2::bigint),
      ('payments'::text COLLATE "C", 3::bigint),
      ('profiles'::text COLLATE "C", 3::bigint),
      ('recommendation_results'::text COLLATE "C", 2::bigint),
      ('review_likes'::text COLLATE "C", 1::bigint),
      ('reviews'::text COLLATE "C", 3::bigint),
      ('sessions'::text COLLATE "C", 2::bigint),
      ('student_assessments'::text COLLATE "C", 1::bigint),
      ('universities'::text COLLATE "C", 2::bigint)
  $$,
  'preserves the blueprint nullability rules'
);

select results_eq(
  $$
    select (table_name || '.' || column_name)::text COLLATE "C"
    from information_schema.columns
    where table_schema = 'public'
      and column_default is not null
      and table_name in (
        'profiles', 'universities', 'gallery_images', 'courses', 'sessions',
        'student_assessments', 'recommendation_results', 'payments', 'reviews',
        'comments', 'review_likes'
      )
    order by table_name, ordinal_position
  $$,
  $$
    values
      ('comments.id'::text COLLATE "C"),
      ('comments.created_at'::text COLLATE "C"),
      ('comments.status'::text COLLATE "C"),
      ('courses.id'::text COLLATE "C"),
      ('gallery_images.id'::text COLLATE "C"),
      ('payments.id'::text COLLATE "C"),
      ('profiles.has_unlocked_tea'::text COLLATE "C"),
      ('profiles.created_at'::text COLLATE "C"),
      ('recommendation_results.id'::text COLLATE "C"),
      ('review_likes.id'::text COLLATE "C"),
      ('reviews.id'::text COLLATE "C"),
      ('reviews.is_anonymous'::text COLLATE "C"),
      ('reviews.likes_count'::text COLLATE "C"),
      ('reviews.created_at'::text COLLATE "C"),
      ('reviews.status'::text COLLATE "C"),
      ('sessions.id'::text COLLATE "C"),
      ('student_assessments.id'::text COLLATE "C"),
      ('universities.id'::text COLLATE "C"),
      ('universities.created_at'::text COLLATE "C"),
      ('universities.representative_id'::text COLLATE "C")
  $$,
  'creates defaults only on the columns declared by the blueprint'
);

select results_eq(
  $$
    select (table_name || '.' || column_name)::text COLLATE "C"
    from information_schema.columns
    where table_schema = 'public'
      and column_default like '%uuid_generate_v4%'
      and table_name in (
        'profiles', 'universities', 'gallery_images', 'courses', 'sessions',
        'student_assessments', 'recommendation_results', 'payments', 'reviews',
        'comments', 'review_likes'
      )
    order by table_name
  $$,
  $$
    values
      ('comments.id'::text COLLATE "C"),
      ('courses.id'::text COLLATE "C"),
      ('gallery_images.id'::text COLLATE "C"),
      ('payments.id'::text COLLATE "C"),
      ('recommendation_results.id'::text COLLATE "C"),
      ('review_likes.id'::text COLLATE "C"),
      ('reviews.id'::text COLLATE "C"),
      ('sessions.id'::text COLLATE "C"),
      ('student_assessments.id'::text COLLATE "C"),
      ('universities.id'::text COLLATE "C")
  $$,
  'uses uuid_generate_v4 for every generated UUID primary key'
);

select results_eq(
  $$
    select constraint_name::text COLLATE "C"
    from information_schema.table_constraints
    where constraint_schema = 'public'
      and constraint_type = 'CHECK'
      and constraint_name in (
        'profiles_role_check',
        'sessions_status_check',
        'recommendation_results_match_score_check',
        'payments_status_check',
        'reviews_likes_count_check'
      )
    order by constraint_name
  $$,
  $$
    values
      ('payments_status_check'::text COLLATE "C"),
      ('profiles_role_check'::text COLLATE "C"),
      ('recommendation_results_match_score_check'::text COLLATE "C"),
      ('reviews_likes_count_check'::text COLLATE "C"),
      ('sessions_status_check'::text COLLATE "C")
  $$,
  'enforces the finite status, role, percentage, and count domains'
);

select results_eq(
  $$
    select indexname::text COLLATE "C"
    from pg_indexes
    where schemaname = 'public'
      and indexname like '%_idx'
      and tablename in (
        'profiles', 'universities', 'gallery_images', 'courses', 'sessions',
        'student_assessments', 'recommendation_results', 'payments', 'reviews',
        'comments', 'review_likes'
      )
    order by indexname
  $$,
  $$
    values
      ('comments_review_id_idx'::text COLLATE "C"),
      ('comments_user_id_idx'::text COLLATE "C"),
      ('courses_university_id_idx'::text COLLATE "C"),
      ('gallery_images_university_id_idx'::text COLLATE "C"),
      ('payments_session_id_idx'::text COLLATE "C"),
      ('recommendation_results_session_id_idx'::text COLLATE "C"),
      ('recommendation_results_university_id_idx'::text COLLATE "C"),
      ('review_likes_user_id_idx'::text COLLATE "C"),
      ('reviews_university_id_idx'::text COLLATE "C"),
      ('reviews_user_id_idx'::text COLLATE "C"),
      ('sessions_parent_id_idx'::text COLLATE "C"),
      ('student_assessments_session_id_idx'::text COLLATE "C"),
      ('student_assessments_student_id_idx'::text COLLATE "C")
  $$,
  'indexes every foreign key not already covered by a leading unique key'
);

select results_eq(
  $$
    select (table_name || '.' || column_name || ':' || data_type)::text COLLATE "C"
    from information_schema.columns
    where table_schema = 'public'
      and column_name = 'created_at'
      and table_name in ('profiles', 'universities')
    order by table_name
  $$,
  $$
    values
      ('profiles.created_at:timestamp without time zone'::text COLLATE "C"),
      ('universities.created_at:timestamp without time zone'::text COLLATE "C")
  $$,
  'preserves the blueprint timestamp data type'
);

select ok(
  extensions.uuid_generate_v4() is not null,
  'uuid-ossp is installed and uuid_generate_v4 is callable'
);

select * from finish();

rollback;

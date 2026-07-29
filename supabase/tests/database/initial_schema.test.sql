begin;

set local search_path = public, extensions;

select plan(12);

select results_eq(
  $$
    select table_name::text
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
      ('comments'::text),
      ('courses'::text),
      ('gallery_images'::text),
      ('payments'::text),
      ('profiles'::text),
      ('recommendation_results'::text),
      ('review_likes'::text),
      ('reviews'::text),
      ('sessions'::text),
      ('student_assessments'::text),
      ('universities'::text)
  $$,
  'creates every blueprint table in the public schema'
);

select results_eq(
  $$
    select table_name::text, count(*)::bigint
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
      ('comments'::text, 4::bigint),
      ('courses'::text, 6::bigint),
      ('gallery_images'::text, 4::bigint),
      ('payments'::text, 4::bigint),
      ('profiles'::text, 6::bigint),
      ('recommendation_results'::text, 5::bigint),
      ('review_likes'::text, 3::bigint),
      ('reviews'::text, 6::bigint),
      ('sessions'::text, 8::bigint),
      ('student_assessments'::text, 8::bigint),
      ('universities'::text, 11::bigint)
  $$,
  'creates the exact number of columns declared for each table'
);

select results_eq(
  $$
    select constraint_name::text
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
      ('comments_pkey'::text),
      ('courses_pkey'::text),
      ('gallery_images_pkey'::text),
      ('payments_pkey'::text),
      ('profiles_pkey'::text),
      ('recommendation_results_pkey'::text),
      ('review_likes_pkey'::text),
      ('reviews_pkey'::text),
      ('sessions_pkey'::text),
      ('student_assessments_pkey'::text),
      ('universities_pkey'::text)
  $$,
  'creates a primary key for every blueprint table'
);

select results_eq(
  $$
    select constraint_name::text
    from information_schema.table_constraints
    where constraint_schema = 'public'
      and constraint_type = 'UNIQUE'
      and table_name in ('profiles', 'universities', 'courses', 'review_likes')
    order by constraint_name
  $$,
  $$
    values
      ('courses_mqa_code_key'::text),
      ('profiles_email_key'::text),
      ('review_likes_review_id_user_id_key'::text),
      ('universities_name_key'::text)
  $$,
  'creates every declared single-column and composite unique constraint'
);

select results_eq(
  $$
    select tc.constraint_name::text, rc.delete_rule::text
    from information_schema.table_constraints as tc
    join information_schema.referential_constraints as rc
      on rc.constraint_schema = tc.constraint_schema
     and rc.constraint_name = tc.constraint_name
    where tc.constraint_schema = 'public'
      and tc.constraint_type = 'FOREIGN KEY'
    order by tc.constraint_name
  $$,
  $$
    values
      ('comments_review_id_fkey'::text, 'CASCADE'::text),
      ('comments_user_id_fkey'::text, 'NO ACTION'::text),
      ('courses_university_id_fkey'::text, 'CASCADE'::text),
      ('gallery_images_university_id_fkey'::text, 'CASCADE'::text),
      ('payments_session_id_fkey'::text, 'NO ACTION'::text),
      ('profiles_id_fkey'::text, 'NO ACTION'::text),
      ('recommendation_results_session_id_fkey'::text, 'NO ACTION'::text),
      ('recommendation_results_university_id_fkey'::text, 'NO ACTION'::text),
      ('review_likes_review_id_fkey'::text, 'CASCADE'::text),
      ('review_likes_user_id_fkey'::text, 'NO ACTION'::text),
      ('reviews_university_id_fkey'::text, 'NO ACTION'::text),
      ('reviews_user_id_fkey'::text, 'NO ACTION'::text),
      ('sessions_parent_id_fkey'::text, 'NO ACTION'::text),
      ('student_assessments_session_id_fkey'::text, 'NO ACTION'::text),
      ('student_assessments_student_id_fkey'::text, 'NO ACTION'::text)
  $$,
  'creates all foreign keys and only the specified cascading deletes'
);

select results_eq(
  $$
    select table_name::text, count(*)::bigint
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
      ('comments'::text, 2::bigint),
      ('courses'::text, 2::bigint),
      ('gallery_images'::text, 2::bigint),
      ('payments'::text, 3::bigint),
      ('profiles'::text, 3::bigint),
      ('recommendation_results'::text, 2::bigint),
      ('review_likes'::text, 1::bigint),
      ('reviews'::text, 1::bigint),
      ('sessions'::text, 2::bigint),
      ('student_assessments'::text, 1::bigint),
      ('universities'::text, 2::bigint)
  $$,
  'preserves the blueprint nullability rules'
);

select results_eq(
  $$
    select (table_name || '.' || column_name)::text
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
      ('comments.id'::text),
      ('courses.id'::text),
      ('gallery_images.id'::text),
      ('payments.id'::text),
      ('profiles.has_unlocked_tea'::text),
      ('profiles.created_at'::text),
      ('recommendation_results.id'::text),
      ('review_likes.id'::text),
      ('reviews.id'::text),
      ('reviews.is_anonymous'::text),
      ('reviews.likes_count'::text),
      ('sessions.id'::text),
      ('student_assessments.id'::text),
      ('universities.id'::text),
      ('universities.created_at'::text)
  $$,
  'creates defaults only on the columns declared by the blueprint'
);

select results_eq(
  $$
    select (table_name || '.' || column_name)::text
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
      ('comments.id'::text),
      ('courses.id'::text),
      ('gallery_images.id'::text),
      ('payments.id'::text),
      ('recommendation_results.id'::text),
      ('review_likes.id'::text),
      ('reviews.id'::text),
      ('sessions.id'::text),
      ('student_assessments.id'::text),
      ('universities.id'::text)
  $$,
  'uses uuid_generate_v4 for every generated UUID primary key'
);

select results_eq(
  $$
    select constraint_name::text
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
      ('payments_status_check'::text),
      ('profiles_role_check'::text),
      ('recommendation_results_match_score_check'::text),
      ('reviews_likes_count_check'::text),
      ('sessions_status_check'::text)
  $$,
  'enforces the finite status, role, percentage, and count domains'
);

select results_eq(
  $$
    select indexname::text
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
      ('comments_review_id_idx'::text),
      ('comments_user_id_idx'::text),
      ('courses_university_id_idx'::text),
      ('gallery_images_university_id_idx'::text),
      ('payments_session_id_idx'::text),
      ('recommendation_results_session_id_idx'::text),
      ('recommendation_results_university_id_idx'::text),
      ('review_likes_user_id_idx'::text),
      ('reviews_university_id_idx'::text),
      ('reviews_user_id_idx'::text),
      ('sessions_parent_id_idx'::text),
      ('student_assessments_session_id_idx'::text),
      ('student_assessments_student_id_idx'::text)
  $$,
  'indexes every foreign key not already covered by a leading unique key'
);

select results_eq(
  $$
    select (table_name || '.' || column_name || ':' || data_type)::text
    from information_schema.columns
    where table_schema = 'public'
      and column_name = 'created_at'
      and table_name in ('profiles', 'universities')
    order by table_name
  $$,
  $$
    values
      ('profiles.created_at:timestamp without time zone'::text),
      ('universities.created_at:timestamp without time zone'::text)
  $$,
  'preserves the blueprint timestamp data type'
);

select ok(
  extensions.uuid_generate_v4() is not null,
  'uuid-ossp is installed and uuid_generate_v4 is callable'
);

select * from finish();

rollback;

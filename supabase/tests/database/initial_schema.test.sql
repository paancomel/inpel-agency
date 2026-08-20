begin;

set local search_path = public, extensions;

select plan(12);

select results_eq(
  $$
    select table_name::text COLLATE "C"
    from information_schema.tables
    where table_schema = 'public'
      and table_name in (
        'profiles', 'universities', 'gallery_images', 'courses', 'sessions',
        'student_assessments', 'recommendation_results', 'payments', 'reviews',
        'comments', 'review_likes'
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
  'creates every original blueprint table in the public schema'
);

select results_eq(
  $$
    with expected(table_name, column_name) as (
      values
        ('profiles', 'id'), ('profiles', 'email'), ('profiles', 'role'),
        ('universities', 'id'), ('universities', 'name'),
        ('gallery_images', 'id'), ('gallery_images', 'university_id'), ('gallery_images', 'preview_url'),
        ('courses', 'id'), ('courses', 'university_id'), ('courses', 'name'), ('courses', 'mqa_code'),
        ('sessions', 'id'), ('sessions', 'parent_id'), ('sessions', 'status'),
        ('student_assessments', 'id'), ('student_assessments', 'session_id'), ('student_assessments', 'student_id'),
        ('recommendation_results', 'id'), ('recommendation_results', 'session_id'),
        ('recommendation_results', 'university_id'), ('recommendation_results', 'match_score'),
        ('payments', 'id'), ('payments', 'session_id'), ('payments', 'tier'), ('payments', 'status'),
        ('reviews', 'id'), ('reviews', 'user_id'), ('reviews', 'university_id'), ('reviews', 'review_data'),
        ('comments', 'id'), ('comments', 'review_id'), ('comments', 'user_id'), ('comments', 'text'),
        ('review_likes', 'id'), ('review_likes', 'review_id'), ('review_likes', 'user_id')
    )
    select (c.table_name || '.' || c.column_name)::text COLLATE "C"
      from information_schema.columns c
      join expected e using (table_name, column_name)
     where c.table_schema = 'public'
     order by c.table_name, c.ordinal_position
  $$,
  $$
    values
      ('comments.id'::text COLLATE "C"),
      ('comments.review_id'::text COLLATE "C"),
      ('comments.user_id'::text COLLATE "C"),
      ('comments.text'::text COLLATE "C"),
      ('courses.id'::text COLLATE "C"),
      ('courses.university_id'::text COLLATE "C"),
      ('courses.name'::text COLLATE "C"),
      ('courses.mqa_code'::text COLLATE "C"),
      ('gallery_images.id'::text COLLATE "C"),
      ('gallery_images.university_id'::text COLLATE "C"),
      ('gallery_images.preview_url'::text COLLATE "C"),
      ('payments.id'::text COLLATE "C"),
      ('payments.session_id'::text COLLATE "C"),
      ('payments.tier'::text COLLATE "C"),
      ('payments.status'::text COLLATE "C"),
      ('profiles.id'::text COLLATE "C"),
      ('profiles.email'::text COLLATE "C"),
      ('profiles.role'::text COLLATE "C"),
      ('recommendation_results.id'::text COLLATE "C"),
      ('recommendation_results.session_id'::text COLLATE "C"),
      ('recommendation_results.university_id'::text COLLATE "C"),
      ('recommendation_results.match_score'::text COLLATE "C"),
      ('review_likes.id'::text COLLATE "C"),
      ('review_likes.review_id'::text COLLATE "C"),
      ('review_likes.user_id'::text COLLATE "C"),
      ('reviews.id'::text COLLATE "C"),
      ('reviews.user_id'::text COLLATE "C"),
      ('reviews.university_id'::text COLLATE "C"),
      ('reviews.review_data'::text COLLATE "C"),
      ('sessions.id'::text COLLATE "C"),
      ('sessions.parent_id'::text COLLATE "C"),
      ('sessions.status'::text COLLATE "C"),
      ('student_assessments.id'::text COLLATE "C"),
      ('student_assessments.session_id'::text COLLATE "C"),
      ('student_assessments.student_id'::text COLLATE "C"),
      ('universities.id'::text COLLATE "C"),
      ('universities.name'::text COLLATE "C")
  $$,
  'preserves the original core columns while allowing additive platform fields'
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
  'creates a primary key for every original blueprint table'
);

select results_eq(
  $$
    select constraint_name::text COLLATE "C"
    from information_schema.table_constraints
    where constraint_schema = 'public'
      and constraint_type = 'UNIQUE'
      and constraint_name in (
        'courses_mqa_code_key', 'profiles_email_key',
        'review_likes_review_id_user_id_key', 'universities_name_key'
      )
    order by constraint_name
  $$,
  $$
    values
      ('courses_mqa_code_key'::text COLLATE "C"),
      ('profiles_email_key'::text COLLATE "C"),
      ('review_likes_review_id_user_id_key'::text COLLATE "C"),
      ('universities_name_key'::text COLLATE "C")
  $$,
  'preserves every original unique constraint'
);

select results_eq(
  $$
    select tc.constraint_name::text COLLATE "C", rc.delete_rule::text COLLATE "C"
    from information_schema.table_constraints tc
    join information_schema.referential_constraints rc
      on rc.constraint_schema = tc.constraint_schema
     and rc.constraint_name = tc.constraint_name
    where tc.constraint_schema = 'public'
      and tc.constraint_type = 'FOREIGN KEY'
      and tc.constraint_name in (
        'comments_review_id_fkey', 'comments_user_id_fkey',
        'courses_university_id_fkey', 'gallery_images_university_id_fkey',
        'payments_session_id_fkey', 'profiles_id_fkey',
        'recommendation_results_session_id_fkey',
        'recommendation_results_university_id_fkey',
        'review_likes_review_id_fkey', 'review_likes_user_id_fkey',
        'reviews_university_id_fkey', 'reviews_user_id_fkey',
        'sessions_parent_id_fkey', 'student_assessments_session_id_fkey',
        'student_assessments_student_id_fkey', 'universities_representative_id_fkey'
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
  'preserves original foreign keys while allowing new relationships'
);

select is(
  (
    select bool_and(is_nullable = 'NO')
      from information_schema.columns
     where table_schema = 'public'
       and (table_name, column_name) in (
         ('profiles', 'id'), ('profiles', 'email'), ('profiles', 'role'),
         ('universities', 'id'), ('universities', 'name'),
         ('gallery_images', 'id'), ('gallery_images', 'preview_url'),
         ('courses', 'id'), ('courses', 'name'),
         ('sessions', 'id'), ('sessions', 'status'),
         ('student_assessments', 'id'),
         ('recommendation_results', 'id'), ('recommendation_results', 'match_score'),
         ('payments', 'id'), ('payments', 'tier'), ('payments', 'status'),
         ('reviews', 'id'),
         ('comments', 'id'), ('comments', 'text'),
         ('review_likes', 'id')
       )
  ),
  true,
  'preserves original required-column nullability'
);

select results_eq(
  $$
    select (table_name || '.' || column_name)::text COLLATE "C"
      from information_schema.columns
     where table_schema = 'public'
       and column_default is not null
       and (table_name, column_name) in (
         ('comments', 'id'), ('courses', 'id'), ('gallery_images', 'id'),
         ('payments', 'id'), ('profiles', 'has_unlocked_tea'),
         ('profiles', 'created_at'), ('recommendation_results', 'id'),
         ('review_likes', 'id'), ('reviews', 'id'), ('reviews', 'is_anonymous'),
         ('reviews', 'likes_count'), ('sessions', 'id'),
         ('student_assessments', 'id'), ('universities', 'id'),
         ('universities', 'created_at')
       )
     order by table_name, ordinal_position
  $$,
  $$
    values
      ('comments.id'::text COLLATE "C"),
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
      ('sessions.id'::text COLLATE "C"),
      ('student_assessments.id'::text COLLATE "C"),
      ('universities.id'::text COLLATE "C"),
      ('universities.created_at'::text COLLATE "C")
  $$,
  'preserves required original defaults while allowing additive defaults'
);

select results_eq(
  $$
    select (table_name || '.' || column_name)::text COLLATE "C"
    from information_schema.columns
    where table_schema = 'public'
      and column_default like '%uuid_generate_v4%'
      and table_name in (
        'universities', 'gallery_images', 'courses', 'sessions',
        'student_assessments', 'recommendation_results', 'payments',
        'reviews', 'comments', 'review_likes'
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
  'uses uuid_generate_v4 for every original generated UUID primary key'
);

select results_eq(
  $$
    select constraint_name::text COLLATE "C"
    from information_schema.table_constraints
    where constraint_schema = 'public'
      and constraint_type = 'CHECK'
      and constraint_name in (
        'profiles_role_check', 'sessions_status_check',
        'recommendation_results_match_score_check', 'payments_status_check',
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
  'preserves original finite status, role, score, and count domains'
);

select results_eq(
  $$
    select indexname::text COLLATE "C"
    from pg_indexes
    where schemaname = 'public'
      and indexname in (
        'comments_review_id_idx', 'comments_user_id_idx',
        'courses_university_id_idx', 'gallery_images_university_id_idx',
        'payments_session_id_idx', 'recommendation_results_session_id_idx',
        'recommendation_results_university_id_idx', 'review_likes_user_id_idx',
        'reviews_university_id_idx', 'reviews_user_id_idx',
        'sessions_parent_id_idx', 'student_assessments_session_id_idx',
        'student_assessments_student_id_idx'
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
  'preserves original foreign-key indexes while allowing new indexes'
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
  'preserves the original timestamp data type'
);

select ok(
  extensions.uuid_generate_v4() is not null,
  'uuid-ossp is installed and uuid_generate_v4 is callable'
);

select * from finish();

rollback;

begin;

-- Supabase installs shared extensions in the extensions schema. Qualifying the
-- function makes UUID defaults independent of the caller's search_path.
create schema if not exists extensions;
create extension if not exists "uuid-ossp" with schema extensions;

create table public.profiles (
  id uuid not null,
  email text not null,
  role text not null,
  has_unlocked_tea boolean default false,
  created_at timestamp without time zone default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey
    foreign key (id) references auth.users (id),
  constraint profiles_email_key unique (email),
  constraint profiles_role_check
    check (role in ('parent', 'student', 'university_rep', 'admin'))
);

create table public.universities (
  id uuid not null default extensions.uuid_generate_v4(),
  name text not null,
  location text,
  address text,
  logo_url text,
  tuition_fees numeric,
  living_costs numeric,
  acceptance_rate text,
  facilities_flags jsonb,
  contacts jsonb,
  created_at timestamp without time zone default now(),
  constraint universities_pkey primary key (id),
  constraint universities_name_key unique (name)
);

create table public.gallery_images (
  id uuid not null default extensions.uuid_generate_v4(),
  university_id uuid,
  category text,
  preview_url text not null,
  constraint gallery_images_pkey primary key (id),
  constraint gallery_images_university_id_fkey
    foreign key (university_id)
    references public.universities (id)
    on delete cascade
);

create table public.courses (
  id uuid not null default extensions.uuid_generate_v4(),
  university_id uuid,
  name text not null,
  mqa_code text,
  tuition_fee numeric,
  course_details jsonb,
  constraint courses_pkey primary key (id),
  constraint courses_university_id_fkey
    foreign key (university_id)
    references public.universities (id)
    on delete cascade,
  constraint courses_mqa_code_key unique (mqa_code)
);

create table public.sessions (
  id uuid not null default extensions.uuid_generate_v4(),
  parent_id uuid,
  parent_preferences jsonb,
  status text not null,
  constraint sessions_pkey primary key (id),
  constraint sessions_parent_id_fkey
    foreign key (parent_id) references public.profiles (id),
  constraint sessions_status_check
    check (status in ('invited', 'completed'))
);

create table public.student_assessments (
  id uuid not null default extensions.uuid_generate_v4(),
  session_id uuid,
  student_id uuid,
  assessment_data jsonb,
  constraint student_assessments_pkey primary key (id),
  constraint student_assessments_session_id_fkey
    foreign key (session_id) references public.sessions (id),
  constraint student_assessments_student_id_fkey
    foreign key (student_id) references public.profiles (id)
);

create table public.recommendation_results (
  id uuid not null default extensions.uuid_generate_v4(),
  session_id uuid,
  university_id uuid,
  match_score integer not null,
  roi_and_career jsonb,
  constraint recommendation_results_pkey primary key (id),
  constraint recommendation_results_session_id_fkey
    foreign key (session_id) references public.sessions (id),
  constraint recommendation_results_university_id_fkey
    foreign key (university_id) references public.universities (id),
  constraint recommendation_results_match_score_check
    check (match_score between 0 and 100)
);

create table public.payments (
  id uuid not null default extensions.uuid_generate_v4(),
  session_id uuid,
  tier integer not null,
  status text not null,
  constraint payments_pkey primary key (id),
  constraint payments_session_id_fkey
    foreign key (session_id) references public.sessions (id),
  constraint payments_status_check
    check (status in ('pending', 'success', 'failed'))
);

create table public.reviews (
  id uuid not null default extensions.uuid_generate_v4(),
  user_id uuid,
  university_id uuid,
  review_data jsonb,
  is_anonymous boolean default false,
  likes_count integer default 0,
  constraint reviews_pkey primary key (id),
  constraint reviews_user_id_fkey
    foreign key (user_id) references public.profiles (id),
  constraint reviews_university_id_fkey
    foreign key (university_id) references public.universities (id),
  constraint reviews_likes_count_check
    check (likes_count >= 0)
);

create table public.comments (
  id uuid not null default extensions.uuid_generate_v4(),
  review_id uuid,
  user_id uuid,
  text text not null,
  constraint comments_pkey primary key (id),
  constraint comments_review_id_fkey
    foreign key (review_id)
    references public.reviews (id)
    on delete cascade,
  constraint comments_user_id_fkey
    foreign key (user_id) references public.profiles (id)
);

create table public.review_likes (
  id uuid not null default extensions.uuid_generate_v4(),
  review_id uuid,
  user_id uuid,
  constraint review_likes_pkey primary key (id),
  constraint review_likes_review_id_fkey
    foreign key (review_id)
    references public.reviews (id)
    on delete cascade,
  constraint review_likes_user_id_fkey
    foreign key (user_id) references public.profiles (id),
  constraint review_likes_review_id_user_id_key
    unique (review_id, user_id)
);

-- PostgreSQL does not automatically index referencing foreign-key columns.
-- These indexes keep joins and parent-row deletes from degrading as data grows.
create index gallery_images_university_id_idx
  on public.gallery_images (university_id);
create index courses_university_id_idx
  on public.courses (university_id);
create index sessions_parent_id_idx
  on public.sessions (parent_id);
create index student_assessments_session_id_idx
  on public.student_assessments (session_id);
create index student_assessments_student_id_idx
  on public.student_assessments (student_id);
create index recommendation_results_session_id_idx
  on public.recommendation_results (session_id);
create index recommendation_results_university_id_idx
  on public.recommendation_results (university_id);
create index payments_session_id_idx
  on public.payments (session_id);
create index reviews_user_id_idx
  on public.reviews (user_id);
create index reviews_university_id_idx
  on public.reviews (university_id);
create index comments_review_id_idx
  on public.comments (review_id);
create index comments_user_id_idx
  on public.comments (user_id);
create index review_likes_user_id_idx
  on public.review_likes (user_id);

commit;

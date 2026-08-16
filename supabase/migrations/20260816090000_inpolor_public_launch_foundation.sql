begin;

-- INPOLOR public-launch foundation. Raw identity-bearing rows stay behind RLS;
-- browser-readable content is copied into redacted projection tables.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add column if not exists date_of_birth date,
  add column if not exists preferred_locale text not null default 'en',
  add column if not exists updated_at timestamptz not null default current_timestamp,
  add constraint profiles_role_check check (
    role in ('parent', 'student', 'community_user', 'university_rep',
             'content_moderator', 'payment_moderator', 'admin')
  ),
  add constraint profiles_preferred_locale_check check (preferred_locale in ('en', 'ms'));

create or replace function private.prevent_profile_birth_date_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.date_of_birth is not null and new.date_of_birth is distinct from old.date_of_birth then
    raise exception using errcode = '22023', message = 'Date of birth can only be corrected by verified support.';
  end if;
  new.updated_at := current_timestamp;
  return new;
end;
$$;

drop trigger if exists profiles_lock_birth_date on public.profiles;
create trigger profiles_lock_birth_date
before update on public.profiles
for each row execute function private.prevent_profile_birth_date_change();
revoke all on function private.prevent_profile_birth_date_change() from public, anon, authenticated;

create or replace function private.has_inpolor_role(p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
     where p.id = (select auth.uid()) and p.role = any (p_roles)
  );
$$;
revoke all on function private.has_inpolor_role(text[]) from public, anon;
grant execute on function private.has_inpolor_role(text[]) to authenticated;

create or replace function private.can_moderate_inpolor_content()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_inpolor_role(array['content_moderator', 'admin']);
$$;
create or replace function private.can_moderate_inpolor_payments()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_inpolor_role(array['payment_moderator', 'admin']);
$$;
revoke all on function private.can_moderate_inpolor_content() from public, anon;
revoke all on function private.can_moderate_inpolor_payments() from public, anon;
grant execute on function private.can_moderate_inpolor_content() to authenticated;
grant execute on function private.can_moderate_inpolor_payments() to authenticated;

-- INPELER members may edit profile content, but only the founder/admin lane can
-- change verification, suspension, ownership, or publication-version controls.
revoke update on table public.universities from authenticated;
grant update (name, location, address, logo_url, tuition_fees, living_costs,
  acceptance_rate, facilities_flags, contacts, profile_status)
  on table public.universities to authenticated;

create or replace function public.set_institution_verification(
  p_university_id uuid,
  p_verification_status text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_portal_admin() then
    raise exception using errcode='42501',message='Primary admin access is required.';
  end if;
  if p_verification_status not in ('unverified','verified','suspended') then
    raise exception using errcode='22023',message='Invalid verification status.';
  end if;
  update public.universities
     set verification_status=p_verification_status,
         is_suspended=(p_verification_status='suspended'),
         updated_at=current_timestamp
   where id=p_university_id;
  if not found then raise exception using errcode='22023',message='University not found.'; end if;
  insert into public.institution_audit_events(university_id,actor_id,event_type,payload)
  values(p_university_id,auth.uid(),'verification_status_changed',jsonb_build_object('status',p_verification_status));
  return jsonb_build_object('university_id',p_university_id,'verification_status',p_verification_status);
end;
$$;
revoke all on function public.set_institution_verification(uuid,text) from public,anon;
grant execute on function public.set_institution_verification(uuid,text) to authenticated;

-- Replace the earlier self-verifying claim flow. A valid institutional domain
-- creates a pending membership only; primary admin approval is still required.
create or replace function public.claim_institution_domain(p_university_id uuid,p_domain text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user_id uuid:=auth.uid(); v_domain text:=lower(trim(p_domain)); v_profile public.profiles%rowtype; v_university public.universities%rowtype;
begin
  if v_user_id is null then raise exception using errcode='28000',message='Authenticated institutional email is required.'; end if;
  select * into v_profile from public.profiles where id=v_user_id;
  select * into v_university from public.universities where id=p_university_id for update;
  if v_profile.id is null or v_profile.role not in ('university_rep','admin') then raise exception using errcode='42501',message='Only an institutional representative can claim a domain.'; end if;
  if v_university.id is null then raise exception using errcode='P0002',message='Institution not found.'; end if;
  if lower(split_part(v_profile.email,'@',2))<>v_domain or v_domain=any(array['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com']) then
    raise exception using errcode='42501',message='A matching non-public institutional email domain is required.';
  end if;
  if not ((select private.is_portal_admin()) or exists(
    select 1 from public.approved_institution_domains d where d.domain=v_domain and d.status='approved'
      and (d.university_id is null or d.university_id=p_university_id)
  )) then raise exception using errcode='42501',message='This domain is not approved for the selected institution.'; end if;
  insert into public.institution_domains(university_id,domain,status,source,verified_at,created_by)
  values(p_university_id,v_domain,'approved','institution',current_timestamp,v_user_id)
  on conflict(university_id,domain) do update set status='approved',verified_at=current_timestamp,suspended_at=null;
  insert into public.institution_members(university_id,user_id,role,status)
  values(p_university_id,v_user_id,'representative','active')
  on conflict(university_id,user_id) do update set status='active',removed_at=null;
  insert into public.institution_audit_events(university_id,actor_id,event_type,payload)
  values(p_university_id,v_user_id,'domain_claim_pending_approval',jsonb_build_object('domain',v_domain));
  return public.get_institution_entitlement(p_university_id)||jsonb_build_object('domain',v_domain,'approval_required',true);
end; $$;
revoke all on function public.claim_institution_domain(uuid,text) from public,anon;
grant execute on function public.claim_institution_domain(uuid,text) to authenticated;

create or replace function public.set_institution_suspension(p_university_id uuid,p_suspended boolean,p_reason text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_portal_admin() then raise exception using errcode='42501',message='Primary admin access is required.'; end if;
  update public.universities set is_suspended=p_suspended,
    verification_status=case when p_suspended then 'suspended' else 'verified' end,updated_at=current_timestamp
  where id=p_university_id;
  if not found then raise exception using errcode='22023',message='University not found.'; end if;
  update public.institution_domains set status=case when p_suspended then 'suspended' else 'approved' end,
    suspended_at=case when p_suspended then current_timestamp else null end where university_id=p_university_id;
  insert into public.institution_audit_events(university_id,actor_id,event_type,payload)
  values(p_university_id,auth.uid(),case when p_suspended then 'institution_suspended' else 'institution_reinstated' end,jsonb_build_object('reason',p_reason));
  return public.get_institution_entitlement(p_university_id);
end; $$;
revoke all on function public.set_institution_suspension(uuid,boolean,text) from public,anon;
grant execute on function public.set_institution_suspension(uuid,boolean,text) to authenticated;

-- Replace the prototype status/checks with the approved manual moderation lifecycle.
alter table public.reviews drop constraint if exists reviews_status_check;
alter table public.reviews
  add column if not exists course_id uuid references public.courses (id) on delete set null,
  add column if not exists course_name text,
  add column if not exists study_year smallint,
  add column if not exists review_kind text not null default 'standard',
  add column if not exists rating_facilities smallint,
  add column if not exists rating_teaching smallint,
  add column if not exists rating_class_experience smallint,
  add column if not exists rating_safety smallint,
  add column if not exists rating_value smallint,
  add column if not exists rating_transport smallint,
  add column if not exists rating_campus_life smallint,
  add column if not exists rating_career smallint,
  add column if not exists overall_rating numeric(3,1) generated always as (
    round((rating_facilities + rating_teaching + rating_class_experience + rating_safety
      + rating_value + rating_transport + rating_campus_life + rating_career)::numeric / 8, 1)
  ) stored,
  add column if not exists living_cost_monthly integer,
  add column if not exists is_complete_review boolean not null default false,
  add column if not exists current_version integer not null default 1,
  add column if not exists acquisition_source text,
  add column if not exists acquisition_campaign text,
  add column if not exists submitted_at timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists updated_at timestamptz not null default current_timestamp,
  add constraint reviews_status_check check (
    status in ('draft', 'submitted', 'pending', 'needs_correction', 'published',
               'rejected', 'hidden_under_review', 'removed')
  ),
  add constraint reviews_kind_check check (review_kind in ('standard', 'reward')),
  add constraint reviews_course_name_check check (course_name is null or length(btrim(course_name)) between 1 and 160),
  add constraint reviews_study_year_check check (study_year is null or study_year between 1990 and 2100),
  add constraint reviews_living_cost_check check (living_cost_monthly is null or living_cost_monthly between 300 and 10000),
  add constraint reviews_ratings_check check (
    (rating_facilities is null or rating_facilities between 1 and 10)
    and (rating_teaching is null or rating_teaching between 1 and 10)
    and (rating_class_experience is null or rating_class_experience between 1 and 10)
    and (rating_safety is null or rating_safety between 1 and 10)
    and (rating_value is null or rating_value between 1 and 10)
    and (rating_transport is null or rating_transport between 1 and 10)
    and (rating_campus_life is null or rating_campus_life between 1 and 10)
    and (rating_career is null or rating_career between 1 and 10)
  );

create unique index if not exists reviews_one_active_per_user_university_idx
  on public.reviews (user_id, university_id)
  where user_id is not null and status not in ('rejected', 'removed');
create index if not exists reviews_university_status_published_idx
  on public.reviews (university_id, status, published_at desc);
create index if not exists reviews_user_updated_idx
  on public.reviews (user_id, updated_at desc);

create table public.review_versions (
  id uuid not null default extensions.uuid_generate_v4() primary key,
  review_id uuid not null references public.reviews (id) on delete cascade,
  version_number integer not null,
  payload jsonb not null,
  status text not null default 'submitted',
  submitted_by uuid not null references public.profiles (id) on delete restrict,
  moderator_note text,
  created_at timestamptz not null default current_timestamp,
  decided_at timestamptz,
  decided_by uuid references public.profiles (id) on delete set null,
  constraint review_versions_number_key unique (review_id, version_number),
  constraint review_versions_status_check check (
    status in ('submitted', 'needs_correction', 'approved', 'rejected')
  ),
  constraint review_versions_payload_object_check check (jsonb_typeof(payload) = 'object')
);
create index review_versions_review_created_idx on public.review_versions (review_id, created_at desc);

create table public.review_photos (
  id uuid not null default extensions.uuid_generate_v4() primary key,
  review_id uuid not null references public.reviews (id) on delete cascade,
  category text not null,
  storage_path text not null,
  mime_type text not null,
  size_bytes integer not null,
  redaction_status text not null default 'pending',
  redaction_confirmed_at timestamptz,
  quality_score numeric(5,2),
  community_score integer not null default 0,
  moderator_featured boolean not null default false,
  sort_order smallint not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default current_timestamp,
  constraint review_photos_path_key unique (storage_path),
  constraint review_photos_category_check check (category in (
    'class', 'library', 'affordable_food', 'daily_route', 'campus',
    'accommodation', 'hangout', 'nearby_activity'
  )),
  constraint review_photos_mime_check check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  constraint review_photos_size_check check (size_bytes between 1 and 5242880),
  constraint review_photos_redaction_check check (redaction_status in ('pending', 'redacted', 'confirmed', 'rejected')),
  constraint review_photos_status_check check (status in ('pending', 'published', 'hidden_under_review', 'rejected', 'removed'))
);
create index review_photos_review_category_idx on public.review_photos (review_id, category, sort_order);

create table public.moderation_actions (
  id uuid not null default extensions.uuid_generate_v4() primary key,
  content_type text not null,
  content_id uuid not null,
  action text not null,
  reason_code text,
  note text,
  actor_id uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default current_timestamp,
  constraint moderation_actions_type_check check (content_type in (
    'review', 'review_version', 'review_photo', 'comment', 'question', 'answer', 'official_response', 'report'
  )),
  constraint moderation_actions_action_check check (action in (
    'approve', 'publish', 'request_correction', 'reject', 'hide', 'restore',
    'remove', 'classify_unspoken_truth', 'clear_unspoken_truth', 'flag_reward', 'save_draft'
  ))
);
create index moderation_actions_content_idx on public.moderation_actions (content_type, content_id, created_at desc);

create table public.review_unspoken_truths (
  id uuid not null default extensions.uuid_generate_v4() primary key,
  review_id uuid not null references public.reviews (id) on delete cascade,
  review_version_id uuid references public.review_versions (id) on delete set null,
  excerpt text not null,
  topic text not null,
  status text not null default 'candidate',
  classified_by text not null default 'automation',
  decided_by uuid references public.profiles (id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default current_timestamp,
  constraint review_unspoken_truths_excerpt_check check (length(btrim(excerpt)) between 1 and 2000),
  constraint review_unspoken_truths_status_check check (status in ('candidate', 'approved', 'rejected', 'hidden_under_review')),
  constraint review_unspoken_truths_classifier_check check (classified_by in ('automation', 'moderator'))
);
create index review_unspoken_truths_queue_idx on public.review_unspoken_truths (status, created_at);

alter table public.comments drop constraint if exists comments_status_check;
alter table public.comments
  add column if not exists parent_comment_id uuid references public.comments (id) on delete cascade,
  add column if not exists depth smallint not null default 1,
  add column if not exists updated_at timestamptz not null default current_timestamp,
  add constraint comments_status_check check (status in ('pending', 'published', 'rejected', 'hidden_under_review', 'removed')),
  add constraint comments_depth_check check (depth between 1 and 3),
  add constraint comments_text_length_check check (length(btrim(text)) between 1 and 2000);
create index if not exists comments_parent_idx on public.comments (parent_comment_id, created_at);

create table public.university_questions (
  id uuid not null default extensions.uuid_generate_v4() primary key,
  university_id uuid not null references public.universities (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete restrict,
  body text not null,
  status text not null default 'pending',
  created_at timestamptz not null default current_timestamp,
  updated_at timestamptz not null default current_timestamp,
  constraint university_questions_body_check check (length(btrim(body)) between 5 and 2000),
  constraint university_questions_status_check check (status in ('pending', 'published', 'rejected', 'hidden_under_review', 'removed'))
);
create index university_questions_university_status_idx on public.university_questions (university_id, status, created_at desc);

create table public.question_answers (
  id uuid not null default extensions.uuid_generate_v4() primary key,
  question_id uuid not null references public.university_questions (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete restrict,
  parent_answer_id uuid references public.question_answers (id) on delete cascade,
  depth smallint not null default 1,
  author_label text not null default 'community_member',
  body text not null,
  status text not null default 'pending',
  upvotes_count integer not null default 0,
  created_at timestamptz not null default current_timestamp,
  updated_at timestamptz not null default current_timestamp,
  constraint question_answers_depth_check check (depth between 1 and 3),
  constraint question_answers_label_check check (author_label in ('approved_reviewer', 'current_student', 'alumni', 'community_member')),
  constraint question_answers_body_check check (length(btrim(body)) between 1 and 2000),
  constraint question_answers_status_check check (status in ('pending', 'published', 'rejected', 'hidden_under_review', 'removed')),
  constraint question_answers_upvotes_check check (upvotes_count >= 0)
);
create index question_answers_question_status_idx on public.question_answers (question_id, status, upvotes_count desc, created_at desc);
create index question_answers_parent_idx on public.question_answers (parent_answer_id, created_at);

create table public.question_answer_votes (
  answer_id uuid not null references public.question_answers (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default current_timestamp,
  primary key (answer_id, user_id)
);
create index question_answer_votes_user_idx on public.question_answer_votes (user_id, created_at desc);

create table public.official_responses (
  id uuid not null default extensions.uuid_generate_v4() primary key,
  university_id uuid not null references public.universities (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete restrict,
  target_type text not null,
  target_id uuid,
  body text not null,
  status text not null default 'pending',
  created_at timestamptz not null default current_timestamp,
  published_at timestamptz,
  constraint official_responses_target_check check (target_type in ('profile', 'review', 'question')),
  constraint official_responses_body_check check (length(btrim(body)) between 1 and 4000),
  constraint official_responses_status_check check (status in ('pending', 'published', 'rejected', 'hidden_under_review', 'removed'))
);
create index official_responses_university_target_idx on public.official_responses (university_id, target_type, target_id, created_at desc);

create table public.content_reports (
  id uuid not null default extensions.uuid_generate_v4() primary key,
  reporter_id uuid not null references public.profiles (id) on delete restrict,
  content_type text not null,
  content_id uuid not null,
  reason_code text not null,
  details text,
  status text not null default 'received',
  created_at timestamptz not null default current_timestamp,
  resolved_at timestamptz,
  resolved_by uuid references public.profiles (id) on delete set null,
  constraint content_reports_one_active_key unique (reporter_id, content_type, content_id),
  constraint content_reports_type_check check (content_type in ('review', 'review_photo', 'comment', 'question', 'answer', 'official_response')),
  constraint content_reports_status_check check (status in ('received', 'under_review', 'action_taken', 'no_action')),
  constraint content_reports_details_check check (details is null or length(details) <= 2000)
);
create index content_reports_queue_idx on public.content_reports (status, created_at);

create table public.review_saves (
  review_id uuid not null references public.reviews (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default current_timestamp,
  primary key (review_id, user_id)
);
create table public.university_saves (
  university_id uuid not null references public.universities (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default current_timestamp,
  primary key (university_id, user_id)
);
create table public.question_saves (
  question_id uuid not null references public.university_questions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default current_timestamp,
  primary key (question_id, user_id)
);
create index review_saves_user_idx on public.review_saves (user_id, created_at desc);
create index university_saves_user_idx on public.university_saves (user_id, created_at desc);
create index question_saves_user_idx on public.question_saves (user_id, created_at desc);

create table public.notifications (
  id uuid not null default extensions.uuid_generate_v4() primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  title_key text not null,
  body_key text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default current_timestamp,
  constraint notifications_kind_check check (kind in ('reply', 'like', 'review_status', 'reward_status', 'report', 'security', 'support')),
  constraint notifications_data_object_check check (jsonb_typeof(data) = 'object')
);
create index notifications_user_unread_idx on public.notifications (user_id, created_at desc) where read_at is null;

create table private.reward_claims (
  id uuid not null default extensions.uuid_generate_v4() primary key,
  user_id uuid not null references public.profiles (id) on delete restrict,
  review_id uuid not null references public.reviews (id) on delete restrict,
  ewallet_number text not null,
  ewallet_digest bytea not null,
  status text not null default 'waiting_for_payment',
  transaction_reference text,
  submitted_at timestamptz not null default current_timestamp,
  paid_at timestamptz,
  retain_until timestamptz,
  constraint reward_claims_user_key unique (user_id),
  constraint reward_claims_review_key unique (review_id),
  constraint reward_claims_ewallet_key unique (ewallet_digest),
  constraint reward_claims_status_check check (status in ('waiting_for_payment', 'needs_action', 'eligible', 'paid', 'ineligible', 'payment_problem')),
  constraint reward_claims_ewallet_check check (ewallet_number ~ '^60?[0-9]{9,11}$'),
  constraint reward_claims_paid_check check (
    (status <> 'paid') or (paid_at is not null and transaction_reference is not null and retain_until is not null)
  )
);
create index reward_claims_status_submitted_idx on private.reward_claims (status, submitted_at);
alter table private.reward_claims enable row level security;
revoke all on table private.reward_claims from public, anon, authenticated;

create table private.reward_risk_signals (
  id bigint generated always as identity primary key,
  claim_id uuid references private.reward_claims (id) on delete cascade,
  review_id uuid not null references public.reviews (id) on delete cascade,
  signal_type text not null,
  signal_digest bytea,
  risk_score numeric(5,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default current_timestamp,
  constraint reward_risk_score_check check (risk_score between 0 and 100)
);
create index reward_risk_review_idx on private.reward_risk_signals (review_id, created_at desc);
alter table private.reward_risk_signals enable row level security;
revoke all on table private.reward_risk_signals from public, anon, authenticated;

create table public.reward_claim_statuses (
  id uuid primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  review_id uuid not null references public.reviews (id) on delete cascade,
  status text not null,
  transaction_reference text,
  submitted_at timestamptz not null,
  paid_at timestamptz,
  updated_at timestamptz not null default current_timestamp,
  constraint reward_claim_statuses_user_key unique (user_id),
  constraint reward_claim_statuses_review_key unique (review_id)
);

-- Public-safe, identity-free projections.
alter table public.published_reviews drop constraint if exists published_reviews_rating_check;
alter table public.published_reviews alter column rating type numeric(3,1) using rating::numeric;
alter table public.published_reviews
  add column if not exists rating_facilities smallint,
  add column if not exists rating_teaching smallint,
  add column if not exists rating_class_experience smallint,
  add column if not exists rating_safety smallint,
  add column if not exists rating_value smallint,
  add column if not exists rating_transport smallint,
  add column if not exists rating_campus_life smallint,
  add column if not exists rating_career smallint,
  add column if not exists living_cost_monthly integer,
  add column if not exists content jsonb not null default '{}'::jsonb,
  add column if not exists is_complete_review boolean not null default false,
  add column if not exists visibility_status text not null default 'published',
  add column if not exists published_at timestamptz,
  add constraint published_reviews_rating_check check (rating between 1 and 10),
  add constraint published_reviews_visibility_check check (visibility_status in ('published', 'hidden_under_review'));

create table public.published_review_photos (
  id uuid primary key references public.review_photos (id) on delete cascade,
  review_id uuid not null references public.reviews (id) on delete cascade,
  university_id uuid not null references public.universities (id) on delete cascade,
  category text not null,
  storage_path text not null,
  quality_score numeric(5,2),
  community_score integer not null default 0,
  moderator_featured boolean not null default false,
  sort_order smallint not null default 0,
  visibility_status text not null default 'published',
  created_at timestamptz not null
);
create index published_review_photos_university_category_idx on public.published_review_photos (university_id, category, moderator_featured desc, quality_score desc);

create table public.published_comments (
  id uuid primary key references public.comments (id) on delete cascade,
  review_id uuid not null references public.reviews (id) on delete cascade,
  parent_comment_id uuid,
  depth smallint not null,
  text text not null,
  visibility_status text not null default 'published',
  created_at timestamptz not null
);
create index published_comments_review_idx on public.published_comments (review_id, created_at);

create table public.published_questions (
  id uuid primary key references public.university_questions (id) on delete cascade,
  university_id uuid not null references public.universities (id) on delete cascade,
  body text not null,
  visibility_status text not null default 'published',
  created_at timestamptz not null
);
create index published_questions_university_idx on public.published_questions (university_id, created_at desc);

create table public.published_question_answers (
  id uuid primary key references public.question_answers (id) on delete cascade,
  question_id uuid not null references public.university_questions (id) on delete cascade,
  parent_answer_id uuid,
  depth smallint not null,
  author_label text not null,
  body text not null,
  upvotes_count integer not null default 0,
  visibility_status text not null default 'published',
  created_at timestamptz not null
);
create index published_question_answers_question_idx on public.published_question_answers (question_id, upvotes_count desc, created_at desc);

create table public.published_official_responses (
  id uuid primary key references public.official_responses (id) on delete cascade,
  university_id uuid not null references public.universities (id) on delete cascade,
  target_type text not null,
  target_id uuid,
  body text not null,
  visibility_status text not null default 'published',
  published_at timestamptz not null
);
create index published_official_responses_target_idx on public.published_official_responses (university_id, target_type, target_id, published_at);

create table public.published_unspoken_truths (
  id uuid primary key references public.review_unspoken_truths (id) on delete cascade,
  review_id uuid not null references public.reviews (id) on delete cascade,
  university_id uuid not null references public.universities (id) on delete cascade,
  topic text not null,
  excerpt text not null,
  created_at timestamptz not null
);
create index published_unspoken_truths_university_idx on public.published_unspoken_truths (university_id, created_at desc);

create table public.unspoken_truth_teasers (
  id uuid primary key references public.review_unspoken_truths (id) on delete cascade,
  review_id uuid not null references public.reviews (id) on delete cascade,
  university_id uuid not null references public.universities (id) on delete cascade,
  topic text not null,
  created_at timestamptz not null
);

create or replace view public.inpolor_university_summaries
with (security_invoker = true)
as
select
  u.id as university_id,
  count(pr.id)::integer as review_count,
  round(avg(pr.rating), 1) as overall_rating,
  round(avg(pr.rating_facilities), 1) as rating_facilities,
  round(avg(pr.rating_teaching), 1) as rating_teaching,
  round(avg(pr.rating_class_experience), 1) as rating_class_experience,
  round(avg(pr.rating_safety), 1) as rating_safety,
  round(avg(pr.rating_value), 1) as rating_value,
  round(avg(pr.rating_transport), 1) as rating_transport,
  round(avg(pr.rating_campus_life), 1) as rating_campus_life,
  round(avg(pr.rating_career), 1) as rating_career,
  case when count(pr.living_cost_monthly) >= 5 then round(avg(pr.living_cost_monthly))::integer end as living_cost_monthly,
  count(pr.id) >= 5 as ranking_eligible,
  max(pr.published_at) as newest_review_at
from public.universities u
left join public.published_reviews pr
  on pr.university_id = u.id and pr.visibility_status = 'published'
group by u.id;

-- Refresh redacted projections whenever moderators change publication state.
create or replace function private.sync_inpolor_review_projection()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_course text;
  v_year text;
  v_rating numeric(3,1);
  v_content jsonb;
begin
  if tg_op = 'DELETE' then
    delete from public.published_reviews where id = old.id;
    return old;
  end if;
  if new.status not in ('published', 'hidden_under_review') then
    delete from public.published_reviews where id = new.id;
    return new;
  end if;
  v_course := btrim(coalesce(new.course_name, new.review_data ->> 'course', 'Unknown course'));
  v_year := coalesce(new.study_year::text, new.review_data ->> 'year', 'Unknown year');
  v_rating := coalesce(new.overall_rating,
    case when coalesce(new.review_data ->> 'rating', '') ~ '^[1-9]$|^10$'
      then (new.review_data ->> 'rating')::numeric else 1 end);
  v_content := case when new.status = 'published' then coalesce(new.review_data, '{}'::jsonb) else '{}'::jsonb end;
  insert into public.published_reviews (
    id, university_id, course, year, rating, green_flags, red_flags, spill_the_tea,
    vibe_tags, is_anonymous, likes_count, created_at, rating_facilities, rating_teaching,
    rating_class_experience, rating_safety, rating_value, rating_transport,
    rating_campus_life, rating_career, living_cost_monthly, content,
    is_complete_review, visibility_status, published_at
  ) values (
    new.id, new.university_id, v_course, v_year, v_rating,
    case when new.status = 'published' then btrim(coalesce(new.review_data ->> 'greenFlags', '')) else '' end,
    case when new.status = 'published' then btrim(coalesce(new.review_data ->> 'redFlags', '')) else '' end,
    case when new.status = 'published' then btrim(coalesce(new.review_data ->> 'spillTheTea', 'Content is under review.')) else 'Content is under review.' end,
    case when new.status = 'published' then coalesce(new.review_data -> 'vibeTags', '[]'::jsonb) else '[]'::jsonb end,
    true, coalesce(new.likes_count, 0), new.created_at,
    new.rating_facilities, new.rating_teaching, new.rating_class_experience,
    new.rating_safety, new.rating_value, new.rating_transport,
    new.rating_campus_life, new.rating_career, new.living_cost_monthly,
    v_content, new.is_complete_review, new.status, coalesce(new.published_at, new.updated_at)
  ) on conflict (id) do update set
    university_id = excluded.university_id, course = excluded.course, year = excluded.year,
    rating = excluded.rating, green_flags = excluded.green_flags, red_flags = excluded.red_flags,
    spill_the_tea = excluded.spill_the_tea, vibe_tags = excluded.vibe_tags,
    likes_count = excluded.likes_count, rating_facilities = excluded.rating_facilities,
    rating_teaching = excluded.rating_teaching, rating_class_experience = excluded.rating_class_experience,
    rating_safety = excluded.rating_safety, rating_value = excluded.rating_value,
    rating_transport = excluded.rating_transport, rating_campus_life = excluded.rating_campus_life,
    rating_career = excluded.rating_career, living_cost_monthly = excluded.living_cost_monthly,
    content = excluded.content, is_complete_review = excluded.is_complete_review,
    visibility_status = excluded.visibility_status, published_at = excluded.published_at;
  return new;
end;
$$;
revoke all on function private.sync_inpolor_review_projection() from public, anon, authenticated;
drop trigger if exists reviews_sync_published_projection on public.reviews;
create trigger reviews_sync_published_projection
after insert or update or delete on public.reviews
for each row execute function private.sync_inpolor_review_projection();

create or replace function private.sync_inpolor_content_projection()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare v_university_id uuid;
begin
  if tg_table_name = 'review_photos' then
    if tg_op = 'DELETE' then
      delete from public.published_review_photos where id = old.id; return old;
    end if;
    if new.status not in ('published', 'hidden_under_review') then
      delete from public.published_review_photos where id = new.id; return new;
    end if;
    select r.university_id into v_university_id from public.reviews r where r.id = new.review_id;
    insert into public.published_review_photos values
      (new.id, new.review_id, v_university_id, new.category, new.storage_path, new.quality_score,
       new.community_score, new.moderator_featured, new.sort_order, new.status, new.created_at)
    on conflict (id) do update set quality_score=excluded.quality_score, community_score=excluded.community_score,
      moderator_featured=excluded.moderator_featured, sort_order=excluded.sort_order,
      visibility_status=excluded.visibility_status;
  elsif tg_table_name = 'comments' then
    if tg_op = 'DELETE' then
      delete from public.published_comments where id = old.id; return old;
    end if;
    if new.status not in ('published', 'hidden_under_review') then
      delete from public.published_comments where id = new.id; return new;
    end if;
    insert into public.published_comments values
      (new.id, new.review_id, new.parent_comment_id, new.depth,
       case when new.status='published' then new.text else 'Content is under review.' end, new.status, new.created_at)
    on conflict (id) do update set text=excluded.text, visibility_status=excluded.visibility_status;
  elsif tg_table_name = 'university_questions' then
    if tg_op = 'DELETE' then
      delete from public.published_questions where id = old.id; return old;
    end if;
    if new.status not in ('published', 'hidden_under_review') then
      delete from public.published_questions where id = new.id; return new;
    end if;
    insert into public.published_questions values
      (new.id, new.university_id, case when new.status='published' then new.body else 'Content is under review.' end, new.status, new.created_at)
    on conflict (id) do update set body=excluded.body, visibility_status=excluded.visibility_status;
  elsif tg_table_name = 'question_answers' then
    if tg_op = 'DELETE' then
      delete from public.published_question_answers where id = old.id; return old;
    end if;
    if new.status not in ('published', 'hidden_under_review') then
      delete from public.published_question_answers where id = new.id; return new;
    end if;
    insert into public.published_question_answers values
      (new.id, new.question_id, new.parent_answer_id, new.depth, new.author_label,
       case when new.status='published' then new.body else 'Content is under review.' end,
       new.upvotes_count, new.status, new.created_at)
    on conflict (id) do update set body=excluded.body, upvotes_count=excluded.upvotes_count,
      visibility_status=excluded.visibility_status, author_label=excluded.author_label;
  elsif tg_table_name = 'official_responses' then
    if tg_op = 'DELETE' then
      delete from public.published_official_responses where id = old.id; return old;
    end if;
    if new.status not in ('published', 'hidden_under_review') then
      delete from public.published_official_responses where id = new.id; return new;
    end if;
    insert into public.published_official_responses values
      (new.id, new.university_id, new.target_type, new.target_id,
       case when new.status='published' then new.body else 'Content is under review.' end,
       new.status, coalesce(new.published_at, current_timestamp))
    on conflict (id) do update set body=excluded.body, visibility_status=excluded.visibility_status,
      published_at=excluded.published_at;
  elsif tg_table_name = 'review_unspoken_truths' then
    if tg_op = 'DELETE' then
      delete from public.published_unspoken_truths where id = old.id;
      delete from public.unspoken_truth_teasers where id = old.id;
      return old;
    end if;
    if new.status <> 'approved' then
      delete from public.published_unspoken_truths where id = new.id;
      delete from public.unspoken_truth_teasers where id = new.id;
      return new;
    end if;
    select r.university_id into v_university_id from public.reviews r
     where r.id=new.review_id and r.overall_rating <= 4.0;
    if v_university_id is null then
      delete from public.published_unspoken_truths where id=new.id;
      delete from public.unspoken_truth_teasers where id=new.id;
      return new;
    end if;
    insert into public.published_unspoken_truths(id,review_id,university_id,topic,excerpt,created_at)
    values(new.id,new.review_id,v_university_id,new.topic,new.excerpt,new.created_at)
    on conflict(id) do update set topic=excluded.topic,excerpt=excluded.excerpt;
    insert into public.unspoken_truth_teasers(id,review_id,university_id,topic,created_at)
    values(new.id,new.review_id,v_university_id,new.topic,new.created_at)
    on conflict(id) do update set topic=excluded.topic;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function private.sync_inpolor_content_projection() from public, anon, authenticated;
create trigger review_photos_sync_projection after insert or update or delete on public.review_photos for each row execute function private.sync_inpolor_content_projection();
create trigger comments_sync_projection after insert or update or delete on public.comments for each row execute function private.sync_inpolor_content_projection();
create trigger questions_sync_projection after insert or update or delete on public.university_questions for each row execute function private.sync_inpolor_content_projection();
create trigger answers_sync_projection after insert or update or delete on public.question_answers for each row execute function private.sync_inpolor_content_projection();
create trigger official_responses_sync_projection after insert or update or delete on public.official_responses for each row execute function private.sync_inpolor_content_projection();
create trigger unspoken_truths_sync_projection after insert or update or delete on public.review_unspoken_truths for each row execute function private.sync_inpolor_content_projection();

create or replace function private.sync_review_like_count()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_review_id uuid;
begin
  v_review_id := case when tg_op='DELETE' then old.review_id else new.review_id end;
  update public.reviews set likes_count = (
    select count(*)::integer from public.review_likes l where l.review_id = v_review_id
  ) where id = v_review_id;
  if tg_op='DELETE' then return old; end if;
  return new;
end; $$;
create or replace function private.sync_answer_vote_count()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_answer_id uuid;
begin
  v_answer_id := case when tg_op='DELETE' then old.answer_id else new.answer_id end;
  update public.question_answers set upvotes_count = (
    select count(*)::integer from public.question_answer_votes v where v.answer_id = v_answer_id
  ) where id = v_answer_id;
  if tg_op='DELETE' then return old; end if;
  return new;
end; $$;
revoke all on function private.sync_review_like_count() from public, anon, authenticated;
revoke all on function private.sync_answer_vote_count() from public, anon, authenticated;
create trigger review_likes_sync_count after insert or delete on public.review_likes for each row execute function private.sync_review_like_count();
create trigger answer_votes_sync_count after insert or delete on public.question_answer_votes for each row execute function private.sync_answer_vote_count();

create or replace function private.inpolor_word_count(p_text text)
returns integer language sql immutable set search_path = '' as $$
  select case when btrim(coalesce(p_text, '')) = '' then 0
    else cardinality(regexp_split_to_array(btrim(p_text), E'\\s+')) end;
$$;
revoke all on function private.inpolor_word_count(text) from public, anon, authenticated;

create or replace function public.create_inpolor_reward_draft(p_university_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user_id uuid:=auth.uid(); v_review_id uuid:=extensions.uuid_generate_v4();
begin
  if v_user_id is null then raise exception using errcode='28000',message='Authentication is required.'; end if;
  if not exists(select 1 from public.profiles p where p.id=v_user_id and p.date_of_birth<=current_date-interval '18 years') then
    raise exception using errcode='22023',message='INPOLOR is available only to users aged 18 or older.';
  end if;
  if not exists(select 1 from public.universities u where u.id=p_university_id) then raise exception using errcode='22023',message='A valid university is required.'; end if;
  insert into public.reviews(id,user_id,university_id,review_data,is_anonymous,review_kind,status)
  values(v_review_id,v_user_id,p_university_id,'{}'::jsonb,true,'reward','draft');
  return jsonb_build_object('review_id',v_review_id,'storage_prefix',v_user_id::text||'/'||v_review_id::text||'/');
exception when unique_violation then raise exception using errcode='23505',message='Only one active review per university is allowed.';
end; $$;
revoke all on function public.create_inpolor_reward_draft(uuid) from public,anon;
grant execute on function public.create_inpolor_reward_draft(uuid) to authenticated;

create or replace function public.submit_inpolor_review(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_review_id uuid;
  v_university_id uuid;
  v_kind text;
  v_course_name text;
  v_study_year integer;
  v_content jsonb;
  v_is_complete boolean;
  v_key text;
  v_category text;
begin
  if v_user_id is null then raise exception using errcode='28000', message='Authentication is required.'; end if;
  if not exists (select 1 from public.profiles p where p.id=v_user_id and p.date_of_birth <= current_date - interval '18 years') then
    raise exception using errcode='22023', message='INPOLOR is available only to users aged 18 or older.';
  end if;
  if jsonb_typeof(p_payload) <> 'object' then raise exception using errcode='22023', message='A complete review payload is required.'; end if;
  v_university_id := (p_payload->>'universityId')::uuid;
  v_review_id := coalesce(nullif(p_payload->>'reviewId','')::uuid, extensions.uuid_generate_v4());
  if not exists (select 1 from public.universities u where u.id=v_university_id) then raise exception using errcode='22023', message='A valid university is required.'; end if;
  v_kind := coalesce(p_payload->>'kind', 'standard');
  v_course_name := btrim(coalesce(p_payload->>'courseName', ''));
  v_study_year := (p_payload->>'studyYear')::integer;
  v_content := coalesce(p_payload->'content', '{}'::jsonb);
  v_is_complete := v_kind='reward';
  if v_kind not in ('standard','reward') or length(v_course_name) not between 1 and 160
     or v_study_year is null or v_study_year not between 1990 and extract(year from current_date)::integer
     or jsonb_typeof(v_content) <> 'object'
     or not (p_payload ?& array['ratingFacilities','ratingTeaching','ratingClassExperience','ratingSafety','ratingValue','ratingTransport','ratingCampusLife','ratingCareer'])
     or exists (select 1 from unnest(array[
       coalesce(p_payload->>'ratingFacilities',''),coalesce(p_payload->>'ratingTeaching',''),
       coalesce(p_payload->>'ratingClassExperience',''),coalesce(p_payload->>'ratingSafety',''),
       coalesce(p_payload->>'ratingValue',''),coalesce(p_payload->>'ratingTransport',''),
       coalesce(p_payload->>'ratingCampusLife',''),coalesce(p_payload->>'ratingCareer','')
     ]) rating where rating !~ '^(10|[1-9])$') then
    raise exception using errcode='22023', message='Course, study year, and all eight ratings are required.';
  end if;
  if v_kind='standard' and not exists (select 1 from jsonb_each_text(v_content) c where private.inpolor_word_count(c.value) >= 30) then
    raise exception using errcode='22023', message='A standard review needs at least one 30-word written answer.';
  end if;
  if v_kind='reward' then
    foreach v_key in array array['transport','classSchedule','dailyCommute','nearbyActivities','advantagesDisadvantages','livingCost','safety','hostelCurfew','careerProspects','partTimeWork','goodLecturers','boringClasses','betweenClassHangouts'] loop
      if private.inpolor_word_count(v_content->>v_key) < 30 then raise exception using errcode='22023', message='Every reward-review narrative needs at least 30 words.'; end if;
    end loop;
    if jsonb_typeof(v_content->'affordableFoodPlaces') <> 'array' or jsonb_array_length(v_content->'affordableFoodPlaces') <> 3
       or coalesce((p_payload->>'livingCostMonthly')::integer,0) not between 300 and 10000 then
      raise exception using errcode='22023', message='Reward reviews need three food places and a monthly living cost from RM300 to RM10,000.';
    end if;
    foreach v_category in array array['class','library','affordable_food','daily_route','campus','accommodation','hangout','nearby_activity'] loop
      if (select count(*) from public.review_photos p where p.review_id=v_review_id and p.category=v_category
            and p.redaction_status='confirmed' and p.redaction_confirmed_at is not null) not between 2 and 5 then
        raise exception using errcode='22023', message='Reward reviews need two to five photos in every category.';
      end if;
    end loop;
    if nullif(p_payload->>'reviewId','') is null or not exists(
      select 1 from public.reviews r where r.id=v_review_id and r.user_id=v_user_id
        and r.university_id=v_university_id and r.review_kind='reward' and r.status='draft'
    ) or exists(
      select 1 from public.review_photos p where p.review_id=v_review_id
        and (p.redaction_status<>'confirmed' or p.redaction_confirmed_at is null
          or p.storage_path not like v_user_id::text||'/'||v_review_id::text||'/%')
    ) then raise exception using errcode='22023', message='Reward photos must be server-redacted and confirmed before submission.';
    end if;
  end if;
  if v_kind='reward' then
    update public.reviews set
      course_id=nullif(p_payload->>'courseId','')::uuid,course_name=v_course_name,study_year=v_study_year,
      rating_facilities=(p_payload->>'ratingFacilities')::smallint,rating_teaching=(p_payload->>'ratingTeaching')::smallint,
      rating_class_experience=(p_payload->>'ratingClassExperience')::smallint,rating_safety=(p_payload->>'ratingSafety')::smallint,
      rating_value=(p_payload->>'ratingValue')::smallint,rating_transport=(p_payload->>'ratingTransport')::smallint,
      rating_campus_life=(p_payload->>'ratingCampusLife')::smallint,rating_career=(p_payload->>'ratingCareer')::smallint,
      living_cost_monthly=nullif(p_payload->>'livingCostMonthly','')::integer,review_data=v_content,is_complete_review=true,
      status='submitted',submitted_at=current_timestamp,updated_at=current_timestamp,
      acquisition_source=nullif(p_payload->>'acquisitionSource',''),acquisition_campaign=nullif(p_payload->>'acquisitionCampaign','')
    where id=v_review_id and user_id=v_user_id and status='draft';
  else
    insert into public.reviews (
    id,user_id,university_id,course_id,course_name,study_year,review_kind,
    rating_facilities,rating_teaching,rating_class_experience,rating_safety,
    rating_value,rating_transport,rating_campus_life,rating_career,
    living_cost_monthly,review_data,is_anonymous,is_complete_review,status,
    submitted_at,acquisition_source,acquisition_campaign
  ) values (
    v_review_id,v_user_id,v_university_id,nullif(p_payload->>'courseId','')::uuid,v_course_name,v_study_year,v_kind,
    (p_payload->>'ratingFacilities')::smallint,(p_payload->>'ratingTeaching')::smallint,
    (p_payload->>'ratingClassExperience')::smallint,(p_payload->>'ratingSafety')::smallint,
    (p_payload->>'ratingValue')::smallint,(p_payload->>'ratingTransport')::smallint,
    (p_payload->>'ratingCampusLife')::smallint,(p_payload->>'ratingCareer')::smallint,
    nullif(p_payload->>'livingCostMonthly','')::integer,v_content,true,v_is_complete,'submitted',current_timestamp,
    nullif(p_payload->>'acquisitionSource',''),nullif(p_payload->>'acquisitionCampaign','')
  );
  end if;
  insert into public.review_versions(review_id,version_number,payload,status,submitted_by)
  values(v_review_id,1,p_payload,'submitted',v_user_id);
  if v_is_complete then update public.profiles set has_unlocked_tea=true where id=v_user_id; end if;
  return jsonb_build_object('review_id',v_review_id,'status','submitted','unspoken_truth_unlocked',v_is_complete);
exception when unique_violation then
  raise exception using errcode='23505', message='Only one active review per university is allowed.';
end;
$$;
revoke all on function public.submit_inpolor_review(jsonb) from public, anon;
grant execute on function public.submit_inpolor_review(jsonb) to authenticated;
revoke all on function public.submit_review_for_moderation(uuid,jsonb,boolean) from anon, authenticated;

create or replace function public.submit_inpolor_reward_claim(p_review_id uuid, p_ewallet_number text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_user_id uuid:=auth.uid(); v_number text:=regexp_replace(coalesce(p_ewallet_number,''),'[^0-9]','','g'); v_id uuid; v_digest bytea;
begin
  if v_user_id is null then raise exception using errcode='28000',message='Authentication is required.'; end if;
  if not exists(select 1 from public.reviews r where r.id=p_review_id and r.user_id=v_user_id and r.review_kind='reward' and r.status='published') then
    raise exception using errcode='22023',message='An approved reward review is required.';
  end if;
  if exists(select 1 from private.reward_risk_signals s where s.review_id=p_review_id and s.risk_score>=70) then
    raise exception using errcode='42501',message='This reward requires additional review before a claim can be submitted.';
  end if;
  if v_number !~ '^60?[0-9]{9,11}$' then raise exception using errcode='22023',message='Enter a valid Touch n Go eWallet mobile number.'; end if;
  v_digest:=extensions.digest(convert_to(v_number,'UTF8'),'sha256');
  insert into private.reward_claims(user_id,review_id,ewallet_number,ewallet_digest)
  values(v_user_id,p_review_id,v_number,v_digest) returning id into v_id;
  insert into public.reward_claim_statuses(id,user_id,review_id,status,submitted_at)
  values(v_id,v_user_id,p_review_id,'waiting_for_payment',current_timestamp);
  return jsonb_build_object('claim_id',v_id,'status','waiting_for_payment');
exception when unique_violation then
  raise exception using errcode='23505',message='A lifetime reward or this eWallet number has already been claimed.';
end;
$$;
revoke all on function public.submit_inpolor_reward_claim(uuid,text) from public, anon;
grant execute on function public.submit_inpolor_reward_claim(uuid,text) to authenticated;

create or replace function public.mark_inpolor_reward_paid(p_claim_id uuid,p_transaction_reference text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_paid_at timestamptz:=current_timestamp;
begin
  if not private.can_moderate_inpolor_payments() then raise exception using errcode='42501',message='Payment moderator access is required.'; end if;
  update private.reward_claims set status='paid',transaction_reference=btrim(p_transaction_reference),
    paid_at=v_paid_at,retain_until=v_paid_at+interval '24 months'
  where id=p_claim_id and status in ('waiting_for_payment','eligible') and length(btrim(p_transaction_reference)) between 1 and 200;
  if not found then raise exception using errcode='22023',message='Claim cannot be marked paid.'; end if;
  update public.reward_claim_statuses set status='paid',transaction_reference=btrim(p_transaction_reference),paid_at=v_paid_at,updated_at=v_paid_at where id=p_claim_id;
  return jsonb_build_object('claim_id',p_claim_id,'status','paid','paid_at',v_paid_at);
end; $$;
revoke all on function public.mark_inpolor_reward_paid(uuid,text) from public,anon;
grant execute on function public.mark_inpolor_reward_paid(uuid,text) to authenticated;

create or replace function public.get_inpolor_payment_queue(p_limit integer default 50)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_result jsonb;
begin
  if not private.can_moderate_inpolor_payments() then raise exception using errcode='42501',message='Payment moderator access is required.'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'claim_id',q.id,'review_id',q.review_id,'ewallet_number',q.ewallet_number,
    'status',q.status,'submitted_at',q.submitted_at
  ) order by q.submitted_at),'[]'::jsonb) into v_result
  from (select * from private.reward_claims where status in ('waiting_for_payment','eligible','payment_problem')
        order by submitted_at limit greatest(1,least(coalesce(p_limit,50),100))) q;
  return v_result;
end;
$$;
revoke all on function public.get_inpolor_payment_queue(integer) from public,anon;
grant execute on function public.get_inpolor_payment_queue(integer) to authenticated;

create or replace function public.record_inpolor_reward_risk(
  p_review_id uuid,p_signal_type text,p_signal_digest text,p_score numeric,p_metadata jsonb default '{}'::jsonb
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(auth.jwt()->>'role','')<>'service_role' then raise exception using errcode='42501',message='Service role access is required.'; end if;
  if p_score not between 0 and 100 or length(btrim(p_signal_type)) not between 1 and 80 or jsonb_typeof(p_metadata)<>'object' then
    raise exception using errcode='22023',message='Invalid risk signal.';
  end if;
  insert into private.reward_risk_signals(review_id,signal_type,signal_digest,risk_score,metadata)
  values(p_review_id,btrim(p_signal_type),case when p_signal_digest is null then null else extensions.digest(convert_to(p_signal_digest,'UTF8'),'sha256') end,p_score,p_metadata);
end; $$;
revoke all on function public.record_inpolor_reward_risk(uuid,text,text,numeric,jsonb) from public,anon,authenticated;
grant execute on function public.record_inpolor_reward_risk(uuid,text,text,numeric,jsonb) to service_role;

create or replace function public.moderate_inpolor_review(
  p_review_id uuid,
  p_action text,
  p_note text default null
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_previous text; v_next text;
begin
  if not private.can_moderate_inpolor_content() then
    raise exception using errcode='42501',message='Content moderator access is required.';
  end if;
  select status into v_previous from public.reviews where id=p_review_id for update;
  if v_previous is null then raise exception using errcode='22023',message='Review not found.'; end if;
  v_next := case p_action
    when 'publish' then 'published'
    when 'request_correction' then 'needs_correction'
    when 'reject' then 'rejected'
    when 'hide' then 'hidden_under_review'
    when 'restore' then 'published'
    else null end;
  if v_next is null
     or (p_action='publish' and v_previous not in ('submitted','pending','needs_correction'))
     or (p_action='request_correction' and v_previous not in ('submitted','pending'))
     or (p_action='reject' and v_previous not in ('submitted','pending','needs_correction'))
     or (p_action='hide' and v_previous<>'published')
     or (p_action='restore' and v_previous<>'hidden_under_review') then
    raise exception using errcode='22023',message='Invalid review moderation transition.';
  end if;
  update public.reviews set status=v_next,updated_at=current_timestamp,
    published_at=case when v_next='published' then coalesce(published_at,current_timestamp) else published_at end
  where id=p_review_id;
  insert into public.moderation_actions(content_type,content_id,action,note,actor_id)
  values('review',p_review_id,p_action,nullif(btrim(p_note),''),auth.uid());
  return jsonb_build_object('review_id',p_review_id,'previous_status',v_previous,'status',v_next);
end; $$;
revoke all on function public.moderate_inpolor_review(uuid,text,text) from public,anon;
grant execute on function public.moderate_inpolor_review(uuid,text,text) to authenticated;

create or replace function public.report_inpolor_content(p_content_type text,p_content_id uuid,p_reason_code text,p_details text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user_id uuid:=auth.uid();
begin
  if v_user_id is null then raise exception using errcode='28000',message='Authentication is required.'; end if;
  insert into public.content_reports(reporter_id,content_type,content_id,reason_code,details)
  values(v_user_id,p_content_type,p_content_id,btrim(p_reason_code),nullif(btrim(p_details),''));
  case p_content_type
    when 'review' then update public.reviews set status='hidden_under_review',updated_at=current_timestamp where id=p_content_id and status='published';
    when 'review_photo' then update public.review_photos set status='hidden_under_review' where id=p_content_id and status='published';
    when 'comment' then update public.comments set status='hidden_under_review',updated_at=current_timestamp where id=p_content_id and status='published';
    when 'question' then update public.university_questions set status='hidden_under_review',updated_at=current_timestamp where id=p_content_id and status='published';
    when 'answer' then update public.question_answers set status='hidden_under_review',updated_at=current_timestamp where id=p_content_id and status='published';
    when 'official_response' then update public.official_responses set status='hidden_under_review' where id=p_content_id and status='published';
    else raise exception using errcode='22023',message='Unsupported report target.';
  end case;
  return jsonb_build_object('status','received','message','Report received.');
end; $$;
revoke all on function public.report_inpolor_content(text,uuid,text,text) from public, anon;
grant execute on function public.report_inpolor_content(text,uuid,text,text) to authenticated;

-- RLS: owners see their private work; moderators see only their operational lane.
do $$ declare t text; begin
  foreach t in array array['review_versions','review_photos','moderation_actions','review_unspoken_truths','university_questions','question_answers','question_answer_votes','official_responses','content_reports','review_saves','university_saves','question_saves','notifications','reward_claim_statuses','published_review_photos','published_comments','published_questions','published_question_answers','published_official_responses','published_unspoken_truths','unspoken_truth_teasers'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on table public.%I from public, anon, authenticated',t);
  end loop;
end $$;

grant select on public.published_reviews,public.published_review_photos,public.published_comments,
  public.published_questions,public.published_question_answers,public.published_official_responses,
  public.inpolor_university_summaries,public.unspoken_truth_teasers to anon,authenticated;
grant select on public.published_unspoken_truths to authenticated;
create policy published_review_photos_read on public.published_review_photos for select to anon,authenticated using(true);
create policy published_comments_read on public.published_comments for select to anon,authenticated using(true);
create policy published_questions_read on public.published_questions for select to anon,authenticated using(true);
create policy published_question_answers_read on public.published_question_answers for select to anon,authenticated using(true);
create policy published_official_responses_read on public.published_official_responses for select to anon,authenticated using(true);
create policy published_unspoken_truths_unlocked_read on public.published_unspoken_truths for select to authenticated
  using(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.has_unlocked_tea is true));
create policy unspoken_truth_teasers_read on public.unspoken_truth_teasers for select to anon,authenticated using(true);

grant select on public.reviews,public.review_versions,public.review_photos,public.moderation_actions,public.review_unspoken_truths,
  public.comments,public.university_questions,public.question_answers,public.official_responses,
  public.content_reports,public.notifications,public.reward_claim_statuses to authenticated;
grant insert,delete on public.review_likes,public.question_answer_votes,public.review_saves,
  public.university_saves,public.question_saves to authenticated;
grant select on public.review_likes,public.question_answer_votes,public.review_saves,
  public.university_saves,public.question_saves to authenticated;
grant insert on public.comments,public.university_questions,public.question_answers,public.official_responses to authenticated;
grant insert on public.moderation_actions to authenticated;
grant insert,update on public.review_unspoken_truths to authenticated;
grant update on public.review_versions,public.review_photos,
  public.comments,public.university_questions,public.question_answers,public.official_responses,
  public.content_reports,public.notifications to authenticated;

create policy reviews_owner_or_content_moderator_read on public.reviews for select to authenticated
  using(user_id=(select auth.uid()) or (select private.can_moderate_inpolor_content()));
create policy review_versions_owner_or_moderator_read on public.review_versions for select to authenticated
  using(submitted_by=(select auth.uid()) or (select private.can_moderate_inpolor_content()));
create policy review_versions_moderator_update on public.review_versions for update to authenticated
  using((select private.can_moderate_inpolor_content())) with check((select private.can_moderate_inpolor_content()));
create policy review_photos_owner_or_moderator_read on public.review_photos for select to authenticated
  using(exists(select 1 from public.reviews r where r.id=review_id and (r.user_id=(select auth.uid()) or (select private.can_moderate_inpolor_content()))));
create policy review_photos_moderator_update on public.review_photos for update to authenticated
  using((select private.can_moderate_inpolor_content())) with check((select private.can_moderate_inpolor_content()));
create policy moderation_actions_moderator_read on public.moderation_actions for select to authenticated using((select private.can_moderate_inpolor_content()));
create policy moderation_actions_moderator_insert on public.moderation_actions for insert to authenticated with check(actor_id=(select auth.uid()) and (select private.can_moderate_inpolor_content()));
create policy unspoken_truths_moderator_all on public.review_unspoken_truths for all to authenticated
  using((select private.can_moderate_inpolor_content())) with check((select private.can_moderate_inpolor_content()));

create policy comments_owner_or_moderator_read on public.comments for select to authenticated using(user_id=(select auth.uid()) or (select private.can_moderate_inpolor_content()));
create policy comments_owner_insert on public.comments for insert to authenticated with check(user_id=(select auth.uid()) and status='pending');
create policy comments_moderator_update on public.comments for update to authenticated using((select private.can_moderate_inpolor_content())) with check((select private.can_moderate_inpolor_content()));
create policy questions_owner_or_moderator_read on public.university_questions for select to authenticated using(author_id=(select auth.uid()) or (select private.can_moderate_inpolor_content()));
create policy questions_owner_insert on public.university_questions for insert to authenticated with check(author_id=(select auth.uid()) and status='pending');
create policy questions_moderator_update on public.university_questions for update to authenticated using((select private.can_moderate_inpolor_content())) with check((select private.can_moderate_inpolor_content()));
create policy answers_owner_or_moderator_read on public.question_answers for select to authenticated using(author_id=(select auth.uid()) or (select private.can_moderate_inpolor_content()));
create policy answers_owner_insert on public.question_answers for insert to authenticated with check(
  author_id=(select auth.uid()) and status='pending' and (
    author_label <> 'approved_reviewer' or exists(select 1 from public.reviews r where r.user_id=(select auth.uid()) and r.status='published')
  )
);
create policy answers_moderator_update on public.question_answers for update to authenticated using((select private.can_moderate_inpolor_content())) with check((select private.can_moderate_inpolor_content()));

create policy official_responses_owner_or_moderator_read on public.official_responses for select to authenticated
  using(author_id=(select auth.uid()) or (select private.can_moderate_inpolor_content()));
create policy official_responses_entitled_insert on public.official_responses for insert to authenticated
  with check(author_id=(select auth.uid()) and status='pending' and (select private.can_manage_university(university_id))
    and exists(select 1 from public.universities u where u.id=university_id and u.verification_status='verified' and u.profile_status='complete' and not u.is_suspended));
create policy official_responses_moderator_update on public.official_responses for update to authenticated
  using((select private.can_moderate_inpolor_content())) with check((select private.can_moderate_inpolor_content()));

create policy reports_owner_or_moderator_read on public.content_reports for select to authenticated
  using(reporter_id=(select auth.uid()) or (select private.can_moderate_inpolor_content()));
create policy reports_owner_insert on public.content_reports for insert to authenticated with check(reporter_id=(select auth.uid()) and status='received');
create policy reports_moderator_update on public.content_reports for update to authenticated
  using((select private.can_moderate_inpolor_content())) with check((select private.can_moderate_inpolor_content()));

create policy review_likes_owner_all on public.review_likes for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy answer_votes_owner_all on public.question_answer_votes for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy review_saves_owner_all on public.review_saves for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy university_saves_owner_all on public.university_saves for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy question_saves_owner_all on public.question_saves for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy notifications_owner_read on public.notifications for select to authenticated using(user_id=(select auth.uid()));
create policy notifications_owner_update on public.notifications for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy reward_status_owner_or_payment_read on public.reward_claim_statuses for select to authenticated
  using(user_id=(select auth.uid()) or (select private.can_moderate_inpolor_payments()));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('inpolor-review-photos','inpolor-review-photos',false,5242880,array['image/png','image/jpeg','image/webp'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

-- Photo records are created only by the trusted server redaction pipeline.
grant select,insert,update,delete on table public.review_photos to service_role;

commit;

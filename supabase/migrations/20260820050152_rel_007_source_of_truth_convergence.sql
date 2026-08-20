begin;

-- REL-007: converge repository, staging, and browser contracts without widening
-- the public data boundary. Reference catalogue identifiers remain provenance;
-- product writes use public.universities.id.

-- Canonical private declaration receipt used by the live submission contract.
create table if not exists private.review_declaration_receipts (
  review_id uuid primary key references public.reviews(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  adult_confirmed boolean not null check (adult_confirmed),
  rights_confirmed boolean not null check (rights_confirmed),
  terms_confirmed boolean not null check (terms_confirmed),
  privacy_confirmed boolean not null check (privacy_confirmed),
  declaration_version text not null,
  accepted_at timestamptz not null default current_timestamp
);
alter table private.review_declaration_receipts enable row level security;
revoke all on table private.review_declaration_receipts from public, anon, authenticated;
create index if not exists review_declaration_receipts_user_id_idx
  on private.review_declaration_receipts (user_id);

do $$
begin
  if to_regclass('private.inpolor_review_declaration_receipts') is not null then
    execute $copy$
      insert into private.review_declaration_receipts (
        review_id, user_id, adult_confirmed, rights_confirmed,
        terms_confirmed, privacy_confirmed, declaration_version, accepted_at
      )
      select review_id, user_id, age_18_or_older, content_rights_confirmed,
             terms_accepted, privacy_acknowledged, declaration_version, declared_at
        from private.inpolor_review_declaration_receipts
      on conflict (review_id) do nothing
    $copy$;
  end if;
end;
$$;

-- No review submission path may unlock protected excerpts before publication.
create or replace function private.enforce_inpolor_unlock_evidence()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.has_unlocked_tea is true and not exists (
    select 1
      from public.reviews r
     where r.user_id = new.id
       and r.status = 'published'
  ) then
    new.has_unlocked_tea := false;
  end if;
  return new;
end;
$$;
revoke all on function private.enforce_inpolor_unlock_evidence()
  from public, anon, authenticated;
drop trigger if exists profiles_require_published_review_for_unlock on public.profiles;
create trigger profiles_require_published_review_for_unlock
before insert or update of has_unlocked_tea on public.profiles
for each row execute function private.enforce_inpolor_unlock_evidence();

update public.profiles p
   set has_unlocked_tea = false,
       updated_at = current_timestamp
 where p.has_unlocked_tea is true
   and not exists (
     select 1 from public.reviews r
      where r.user_id = p.id
        and r.status = 'published'
   );

-- One exact browser-to-RPC declaration contract. The inner implementation name
-- differs between clean local rebuilds and current staging, so select it safely.
create or replace function public.submit_inpolor_review(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_declarations jsonb := p_payload -> 'declarations';
  v_result jsonb;
  v_review_id uuid;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Sign in before submitting a review.';
  end if;
  if jsonb_typeof(p_payload) is distinct from 'object' then
    raise exception using errcode = '22023', message = 'A complete review payload is required.';
  end if;
  if jsonb_typeof(v_declarations) is distinct from 'object'
     or not (v_declarations ?& array['version','adult','rights','terms','privacy'])
     or exists (
       select 1
         from jsonb_object_keys(v_declarations) as item(key)
        where item.key <> all(array['version','adult','rights','terms','privacy'])
     )
     or v_declarations ->> 'version' is distinct from 'inpolor-launch-2026-08-16'
     or v_declarations -> 'adult' is distinct from 'true'::jsonb
     or v_declarations -> 'rights' is distinct from 'true'::jsonb
     or v_declarations -> 'terms' is distinct from 'true'::jsonb
     or v_declarations -> 'privacy' is distinct from 'true'::jsonb then
    raise exception using errcode = '22023',
      message = 'All current review declarations are required.';
  end if;

  if to_regprocedure('public.submit_inpolor_review_inner(jsonb)') is not null then
    execute 'select public.submit_inpolor_review_inner($1)'
      into v_result using p_payload - 'declarations';
  elsif to_regprocedure('public.submit_inpolor_review_without_declaration_audit(jsonb)') is not null then
    execute 'select public.submit_inpolor_review_without_declaration_audit($1)'
      into v_result using p_payload - 'declarations';
  elsif to_regprocedure('public.submit_inpolor_review_unchecked(jsonb)') is not null then
    execute 'select public.submit_inpolor_review_unchecked($1)'
      into v_result using p_payload - 'declarations';
  else
    raise exception using errcode = 'P0001',
      message = 'The internal review submission service is unavailable.';
  end if;

  v_review_id := nullif(v_result ->> 'review_id', '')::uuid;
  if v_review_id is null then
    raise exception using errcode = 'P0001',
      message = 'Review submission did not return a valid review identifier.';
  end if;

  insert into private.review_declaration_receipts (
    review_id, user_id, adult_confirmed, rights_confirmed,
    terms_confirmed, privacy_confirmed, declaration_version
  ) values (
    v_review_id, v_user_id, true, true, true, true,
    v_declarations ->> 'version'
  ) on conflict (review_id) do nothing;

  return coalesce(v_result, '{}'::jsonb)
    || jsonb_build_object('unspoken_truth_unlocked', false);
end;
$$;
revoke all on function public.submit_inpolor_review(jsonb) from public, anon;
grant execute on function public.submit_inpolor_review(jsonb) to authenticated;

-- Public review projection retains the structured main answer and legacy
-- fallbacks while removing content whenever moderation hides a row.
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
  v_main_experience text;
  v_green_flags text;
  v_red_flags text;
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
  v_rating := coalesce(
    new.overall_rating,
    case
      when coalesce(new.review_data ->> 'rating', '') ~ '^(10|[1-9])([.][0-9])?$'
        then (new.review_data ->> 'rating')::numeric
      else 1
    end
  );

  if new.status = 'published' then
    v_content := coalesce(new.review_data, '{}'::jsonb);
    v_main_experience := btrim(coalesce(
      new.review_data ->> 'mainExperience',
      new.review_data ->> 'spillTheTea',
      new.review_data ->> 'spill_the_tea',
      'Student experience submitted for community moderation.'
    ));
    v_green_flags := btrim(coalesce(
      new.review_data ->> 'greenFlags',
      new.review_data ->> 'green_flags',
      ''
    ));
    v_red_flags := btrim(coalesce(
      new.review_data ->> 'redFlags',
      new.review_data ->> 'red_flags',
      ''
    ));
  else
    v_content := '{}'::jsonb;
    v_main_experience := 'Content is under review.';
    v_green_flags := '';
    v_red_flags := '';
  end if;

  insert into public.published_reviews (
    id, university_id, course, year, rating, green_flags, red_flags, spill_the_tea,
    vibe_tags, is_anonymous, likes_count, created_at, rating_facilities,
    rating_teaching, rating_class_experience, rating_safety, rating_value,
    rating_transport, rating_campus_life, rating_career, living_cost_monthly,
    content, is_complete_review, visibility_status, published_at
  ) values (
    new.id, new.university_id, v_course, v_year, v_rating,
    v_green_flags, v_red_flags, v_main_experience,
    case when new.status = 'published'
      then coalesce(new.review_data -> 'vibeTags', '[]'::jsonb)
      else '[]'::jsonb end,
    true, coalesce(new.likes_count, 0), new.created_at,
    new.rating_facilities, new.rating_teaching, new.rating_class_experience,
    new.rating_safety, new.rating_value, new.rating_transport,
    new.rating_campus_life, new.rating_career, new.living_cost_monthly,
    v_content, new.is_complete_review, new.status,
    coalesce(new.published_at, new.updated_at)
  ) on conflict (id) do update set
    university_id = excluded.university_id,
    course = excluded.course,
    year = excluded.year,
    rating = excluded.rating,
    green_flags = excluded.green_flags,
    red_flags = excluded.red_flags,
    spill_the_tea = excluded.spill_the_tea,
    vibe_tags = excluded.vibe_tags,
    likes_count = excluded.likes_count,
    rating_facilities = excluded.rating_facilities,
    rating_teaching = excluded.rating_teaching,
    rating_class_experience = excluded.rating_class_experience,
    rating_safety = excluded.rating_safety,
    rating_value = excluded.rating_value,
    rating_transport = excluded.rating_transport,
    rating_campus_life = excluded.rating_campus_life,
    rating_career = excluded.rating_career,
    living_cost_monthly = excluded.living_cost_monthly,
    content = excluded.content,
    is_complete_review = excluded.is_complete_review,
    visibility_status = excluded.visibility_status,
    published_at = excluded.published_at;

  return new;
end;
$$;
revoke all on function private.sync_inpolor_review_projection()
  from public, anon, authenticated;

-- Unlock follows moderator publication, never submission.
create or replace function public.moderate_inpolor_review(
  p_review_id uuid,
  p_action text,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_previous text;
  v_next text;
  v_owner_id uuid;
begin
  if not private.can_moderate_inpolor_content() then
    raise exception using errcode = '42501', message = 'Content moderator access is required.';
  end if;

  select status, user_id into v_previous, v_owner_id
    from public.reviews
   where id = p_review_id
   for update;

  if v_previous is null then
    raise exception using errcode = '22023', message = 'Review not found.';
  end if;

  v_next := case p_action
    when 'publish' then 'published'
    when 'request_correction' then 'needs_correction'
    when 'reject' then 'rejected'
    when 'hide' then 'hidden_under_review'
    when 'restore' then 'published'
    else null
  end;

  if v_next is null
     or (p_action = 'publish' and v_previous not in ('submitted', 'pending', 'needs_correction'))
     or (p_action = 'request_correction' and v_previous not in ('submitted', 'pending'))
     or (p_action = 'reject' and v_previous not in ('submitted', 'pending', 'needs_correction'))
     or (p_action = 'hide' and v_previous <> 'published')
     or (p_action = 'restore' and v_previous <> 'hidden_under_review') then
    raise exception using errcode = '22023', message = 'Invalid review moderation transition.';
  end if;

  update public.reviews
     set status = v_next,
         updated_at = current_timestamp,
         published_at = case when v_next = 'published'
           then coalesce(published_at, current_timestamp)
           else published_at end
   where id = p_review_id;

  if v_next = 'published' and v_owner_id is not null then
    update public.profiles
       set has_unlocked_tea = true,
           updated_at = current_timestamp
     where id = v_owner_id;
  end if;

  insert into public.moderation_actions (
    content_type, content_id, action, note, actor_id
  ) values (
    'review', p_review_id, p_action, nullif(btrim(p_note), ''), auth.uid()
  );

  return jsonb_build_object(
    'review_id', p_review_id,
    'previous_status', v_previous,
    'status', v_next,
    'unspoken_truth_unlocked', v_next = 'published'
  );
end;
$$;
revoke all on function public.moderate_inpolor_review(uuid, text, text)
  from public, anon;
grant execute on function public.moderate_inpolor_review(uuid, text, text)
  to authenticated;

-- Ordinary reports enter a human queue and cannot immediately remove content.
create or replace function public.report_inpolor_content(
  p_content_type text,
  p_content_id uuid,
  p_reason_code text,
  p_details text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_target_exists boolean := false;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication is required.';
  end if;
  if nullif(btrim(coalesce(p_reason_code, '')), '') is null
     or length(btrim(p_reason_code)) > 100
     or length(coalesce(p_details, '')) > 2000 then
    raise exception using errcode = '22023', message = 'A valid report reason is required.';
  end if;

  case p_content_type
    when 'review' then
      select exists(select 1 from public.published_reviews where id = p_content_id)
        into v_target_exists;
    when 'review_photo' then
      select exists(select 1 from public.published_review_photos where id = p_content_id)
        into v_target_exists;
    when 'comment' then
      select exists(select 1 from public.published_comments where id = p_content_id)
        into v_target_exists;
    when 'question' then
      select exists(select 1 from public.published_questions where id = p_content_id)
        into v_target_exists;
    when 'answer' then
      select exists(select 1 from public.published_question_answers where id = p_content_id)
        into v_target_exists;
    when 'official_response' then
      select exists(select 1 from public.published_official_responses where id = p_content_id)
        into v_target_exists;
    else
      raise exception using errcode = '22023', message = 'Unsupported report target.';
  end case;

  if not v_target_exists then
    raise exception using errcode = '22023', message = 'The reported content is not publicly available.';
  end if;

  insert into public.content_reports (
    reporter_id, content_type, content_id, reason_code, details
  ) values (
    v_user_id, p_content_type, p_content_id, btrim(p_reason_code),
    nullif(btrim(p_details), '')
  );

  return jsonb_build_object(
    'status', 'received',
    'message', 'Report received for moderator review.'
  );
exception
  when unique_violation then
    return jsonb_build_object(
      'status', 'already_received',
      'message', 'You have already reported this content.'
    );
end;
$$;
revoke all on function public.report_inpolor_content(text, uuid, text, text)
  from public, anon;
grant execute on function public.report_inpolor_content(text, uuid, text, text)
  to authenticated;

-- Cross-portal accounts may set a missing birth date once without changing role.
create or replace function public.complete_inpolor_community_onboarding(
  p_date_of_birth date,
  p_locale text default 'en'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_existing_date date;
  v_existing_role text;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication is required.';
  end if;
  if p_date_of_birth is null
     or p_date_of_birth > current_date - interval '18 years'
     or p_date_of_birth < date '1900-01-01' then
    raise exception using errcode = '22023', message = 'You must be 18 or older to join INPOLOR.';
  end if;
  if p_locale not in ('en', 'ms') then
    raise exception using errcode = '22023', message = 'Unsupported locale.';
  end if;

  select email into v_email from auth.users where id = v_user_id;
  select date_of_birth, role into v_existing_date, v_existing_role
    from public.profiles
   where id = v_user_id
   for update;

  if not found then
    insert into public.profiles (
      id, email, role, date_of_birth, preferred_locale
    ) values (
      v_user_id, coalesce(v_email, ''), 'community_user',
      p_date_of_birth, p_locale
    );
  else
    if v_existing_date is not null and v_existing_date is distinct from p_date_of_birth then
      raise exception using errcode = '22023', message = 'Date of birth cannot be changed.';
    end if;

    update public.profiles
       set date_of_birth = coalesce(date_of_birth, p_date_of_birth),
           preferred_locale = p_locale,
           email = case when email = '' then coalesce(v_email, '') else email end,
           role = v_existing_role
     where id = v_user_id;
  end if;

  return jsonb_build_object('profile_id', v_user_id, 'onboarded', true);
end;
$$;
revoke all on function public.complete_inpolor_community_onboarding(date, text)
  from public, anon;
grant execute on function public.complete_inpolor_community_onboarding(date, text)
  to authenticated;

-- Preserve the guardian-consent implementation as the inaccessible inner step.
do $$
begin
  if to_regprocedure(
       'public.create_parent_student_invitation_guardian_validated(text,text,text,jsonb,jsonb,text,boolean)'
     ) is null then
    if to_regprocedure(
         'public.create_parent_student_invitation_unchecked(text,text,text,jsonb,jsonb,text,boolean)'
       ) is not null then
      execute 'alter function public.create_parent_student_invitation_unchecked(text,text,text,jsonb,jsonb,text,boolean) rename to create_parent_student_invitation_guardian_validated';
    elsif to_regprocedure(
         'public.create_parent_student_invitation(text,text,text,jsonb,jsonb,text,boolean)'
       ) is not null then
      execute 'alter function public.create_parent_student_invitation(text,text,text,jsonb,jsonb,text,boolean) rename to create_parent_student_invitation_guardian_validated';
    end if;
  end if;
end;
$$;

-- Strictly validate the exact preference shape actually sent by the portal.
create or replace function public.create_parent_student_invitation(
  p_student_email text,
  p_preferred_location text,
  p_monthly_household_income text,
  p_parental_preferences jsonb,
  p_parent_preferences jsonb,
  p_student_age_band text,
  p_guardian_consent_confirmed boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parental_keys constant text[] :=
    array['campus_vibe','campus_concern','ultimate_win','independence'];
  v_parent_keys constant text[] :=
    array['campusVibe','campusConcern','ultimateWin','independence'];
begin
  if jsonb_typeof(p_parental_preferences) is distinct from 'object'
     or jsonb_typeof(p_parent_preferences) is distinct from 'object'
     or not (p_parental_preferences ?& v_parental_keys)
     or not (p_parent_preferences ?& v_parent_keys)
     or exists (
       select 1 from jsonb_object_keys(p_parental_preferences) as item(key)
        where item.key <> all(v_parental_keys)
     )
     or exists (
       select 1 from jsonb_object_keys(p_parent_preferences) as item(key)
        where item.key <> all(v_parent_keys)
     ) then
    raise exception using errcode = '22023', message = 'Every parent preference is required.';
  end if;

  if ((p_parental_preferences ->> 'campus_vibe') = any (array[
       'Public (IPTA) - Warm & Local',
       'Private (IPTS) - Modern & Vibrant',
       'International Branch - Global Exposure',
       'No preference - open to anything!'
     ]::text[])) is not true
     or ((p_parental_preferences ->> 'campus_concern') = any (array[
       'Academic rigor & faculty quality',
       'Campus safety & physical well-being',
       'Mental health & student support',
       'Networking & industry connections'
     ]::text[])) is not true
     or ((p_parental_preferences ->> 'ultimate_win') = any (array[
       'Guaranteed high-paying employment',
       'Strong professional network',
       'Character & leadership development',
       'Path to international migration/work'
     ]::text[])) is not true
     or ((p_parental_preferences ->> 'independence') = any (array[
       'Highly independent self-starter',
       'Needs some structural guidance',
       'Requires close academic monitoring',
       'Needs strong emotional/social support'
     ]::text[])) is not true then
    raise exception using errcode = '22023', message = 'Parent preferences contain an unsupported value.';
  end if;

  if p_parent_preferences ->> 'campusVibe'
       is distinct from p_parental_preferences ->> 'campus_vibe'
     or p_parent_preferences ->> 'campusConcern'
       is distinct from p_parental_preferences ->> 'campus_concern'
     or p_parent_preferences ->> 'ultimateWin'
       is distinct from p_parental_preferences ->> 'ultimate_win'
     or p_parent_preferences ->> 'independence'
       is distinct from p_parental_preferences ->> 'independence' then
    raise exception using errcode = '22023', message = 'Parent preference representations do not match.';
  end if;

  return public.create_parent_student_invitation_guardian_validated(
    p_student_email,
    p_preferred_location,
    p_monthly_household_income,
    p_parental_preferences,
    p_parent_preferences,
    p_student_age_band,
    p_guardian_consent_confirmed
  );
end;
$$;
revoke all on function public.create_parent_student_invitation(
  text, text, text, jsonb, jsonb, text, boolean
) from public, anon;
grant execute on function public.create_parent_student_invitation(
  text, text, text, jsonb, jsonb, text, boolean
) to authenticated;
revoke all on function public.create_parent_student_invitation_guardian_validated(
  text, text, text, jsonb, jsonb, text, boolean
) from public, anon, authenticated;

-- Remove broad, obsolete self-service policies superseded by trusted RPC and
-- membership boundaries.
drop policy if exists "users create basic profiles" on public.profiles;
drop policy if exists "users read their own profile" on public.profiles;
drop policy if exists "users update basic profiles" on public.profiles;
drop policy if exists "representatives create owned universities" on public.universities;
drop policy if exists "representatives update owned universities" on public.universities;
drop policy if exists "representatives delete owned universities" on public.universities;
drop policy if exists "representatives create courses for owned universities" on public.courses;
drop policy if exists "representatives update courses for owned universities" on public.courses;
drop policy if exists "representatives delete courses for owned universities" on public.courses;
drop policy if exists "representatives manage owned gallery images" on public.gallery_images;

-- The private import ledger has no browser policy or grant. RLS is defense in
-- depth for future Data API configuration changes.
alter table private.reference_import_runs enable row level security;
revoke all on table private.reference_import_runs from public, anon, authenticated;

-- Security-invoker catalogue views use narrowly reviewed source rows only.
revoke all on table public.reference_institutions, public.reference_programmes,
  public.nec_classifications, public.reference_institution_links,
  public.reference_programme_links, public.portal_catalog_visibility
  from anon, authenticated;

grant select (id, source_name, previous_name)
  on public.reference_institutions to anon, authenticated;
grant select (
  canonical_record_id, reference_institution_id, reference_no, reference_family,
  qualification_name, previous_qualification_name, nec_code
) on public.reference_programmes to anon, authenticated;
grant select (code, description, broad_area)
  on public.nec_classifications to anon, authenticated;
grant select (reference_institution_id, university_id, status)
  on public.reference_institution_links to anon, authenticated;
grant select (canonical_record_id, course_id, status)
  on public.reference_programme_links to anon, authenticated;
grant select (university_id, portal, status, published_at)
  on public.portal_catalog_visibility to anon, authenticated;

alter view public.shared_catalog_institutions set (security_invoker = true);
alter view public.shared_catalog_programmes set (security_invoker = true);
alter view public.inpolor_catalog_institutions set (security_invoker = true);
alter view public.inpolor_catalog_programmes set (security_invoker = true);

grant select on table public.shared_catalog_institutions,
  public.shared_catalog_programmes, public.inpolor_catalog_institutions,
  public.inpolor_catalog_programmes to anon, authenticated;

drop policy if exists reference_institutions_public_catalog_read on public.reference_institutions;
drop policy if exists reference_programmes_public_catalog_read on public.reference_programmes;
drop policy if exists nec_classifications_public_catalog_read on public.nec_classifications;
drop policy if exists reference_institution_links_verified_read on public.reference_institution_links;
drop policy if exists reference_programme_links_verified_read on public.reference_programme_links;
drop policy if exists portal_catalog_visibility_published_read on public.portal_catalog_visibility;
drop policy if exists reference_institutions_catalog_read on public.reference_institutions;
drop policy if exists reference_programmes_catalog_read on public.reference_programmes;
drop policy if exists nec_classifications_catalog_read on public.nec_classifications;
drop policy if exists reference_institution_links_catalog_read on public.reference_institution_links;
drop policy if exists reference_programme_links_catalog_read on public.reference_programme_links;
drop policy if exists portal_catalog_visibility_public_read on public.portal_catalog_visibility;

create policy portal_catalog_visibility_public_read
  on public.portal_catalog_visibility for select to anon, authenticated
  using (status = 'published');

create policy reference_institution_links_catalog_read
  on public.reference_institution_links for select to anon, authenticated
  using (
    status = 'verified'
    and exists (
      select 1 from public.portal_catalog_visibility pcv
       where pcv.university_id = reference_institution_links.university_id
         and pcv.status = 'published'
    )
  );

create policy reference_institutions_catalog_read
  on public.reference_institutions for select to anon, authenticated
  using (
    exists (
      select 1
        from public.reference_institution_links ril
        join public.portal_catalog_visibility pcv
          on pcv.university_id = ril.university_id
       where ril.reference_institution_id = reference_institutions.id
         and ril.status = 'verified'
         and pcv.status = 'published'
    )
  );

create policy reference_programme_links_catalog_read
  on public.reference_programme_links for select to anon, authenticated
  using (
    status = 'verified'
    and exists (
      select 1
        from public.courses c
        join public.portal_catalog_visibility pcv
          on pcv.university_id = c.university_id
       where c.id = reference_programme_links.course_id
         and pcv.status = 'published'
    )
  );

create policy reference_programmes_catalog_read
  on public.reference_programmes for select to anon, authenticated
  using (
    exists (
      select 1
        from public.reference_institution_links ril
        join public.portal_catalog_visibility pcv
          on pcv.university_id = ril.university_id
       where ril.reference_institution_id = reference_programmes.reference_institution_id
         and ril.status = 'verified'
         and pcv.status = 'published'
    )
  );

create policy nec_classifications_catalog_read
  on public.nec_classifications for select to anon, authenticated
  using (
    exists (
      select 1
        from public.reference_programmes rp
        join public.reference_institution_links ril
          on ril.reference_institution_id = rp.reference_institution_id
        join public.portal_catalog_visibility pcv
          on pcv.university_id = ril.university_id
       where rp.nec_code = nec_classifications.code
         and ril.status = 'verified'
         and pcv.status = 'published'
    )
  );

-- This endpoint reads a public row and does not need to bypass RLS.
create or replace function public.get_institution_entitlement(p_university_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'university_id', u.id,
    'verified', u.verification_status = 'verified',
    'complete', u.profile_status = 'complete',
    'suspended', u.is_suspended,
    'official_response_enabled', u.verification_status = 'verified'
      and u.profile_status = 'complete' and not u.is_suspended,
    'badge', case when u.verification_status = 'verified'
      and u.profile_status = 'complete' and not u.is_suspended
      then 'institution_official' else null end
  )
  from public.universities u
  where u.id = p_university_id;
$$;
revoke all on function public.get_institution_entitlement(uuid) from public;
grant execute on function public.get_institution_entitlement(uuid) to anon, authenticated;

create index if not exists published_reviews_university_visibility_published_idx
  on public.published_reviews (university_id, visibility_status, published_at desc);
create index if not exists content_reports_content_created_idx
  on public.content_reports (content_type, content_id, created_at desc);

commit;

begin;

-- Remove legacy single-owner policies that remained alongside the newer
-- membership-based policies. Keeping both policy sets weakens the entitlement
-- boundary and makes every write evaluate multiple permissive policies.
drop policy if exists "representatives create owned universities" on public.universities;
drop policy if exists "representatives update owned universities" on public.universities;
drop policy if exists "representatives delete owned universities" on public.universities;
drop policy if exists "representatives create courses for owned universities" on public.courses;
drop policy if exists "representatives update courses for owned universities" on public.courses;
drop policy if exists "representatives delete courses for owned universities" on public.courses;
drop policy if exists "representatives manage owned gallery images" on public.gallery_images;

-- Public catalogue views now run with the caller's permissions. Only reviewed,
-- public-safe source columns are reachable and RLS controls which link rows can
-- participate in the views.
drop policy if exists reference_institutions_public_catalog_read on public.reference_institutions;
create policy reference_institutions_public_catalog_read
  on public.reference_institutions for select to anon, authenticated
  using (true);

drop policy if exists reference_programmes_public_catalog_read on public.reference_programmes;
create policy reference_programmes_public_catalog_read
  on public.reference_programmes for select to anon, authenticated
  using (true);

drop policy if exists nec_classifications_public_catalog_read on public.nec_classifications;
create policy nec_classifications_public_catalog_read
  on public.nec_classifications for select to anon, authenticated
  using (true);

drop policy if exists reference_institution_links_verified_read on public.reference_institution_links;
create policy reference_institution_links_verified_read
  on public.reference_institution_links for select to anon, authenticated
  using (status = 'verified');

drop policy if exists reference_programme_links_verified_read on public.reference_programme_links;
create policy reference_programme_links_verified_read
  on public.reference_programme_links for select to anon, authenticated
  using (status = 'verified');

drop policy if exists portal_catalog_visibility_published_read on public.portal_catalog_visibility;
create policy portal_catalog_visibility_published_read
  on public.portal_catalog_visibility for select to anon, authenticated
  using (status = 'published');

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

-- Keep public review rows identity-free while supporting both the current
-- structured review payload and already-published legacy payloads.
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
revoke all on function private.sync_inpolor_review_projection() from public, anon, authenticated;

-- A contribution unlocks protected excerpts only after a moderator publishes it.
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
revoke all on function public.moderate_inpolor_review(uuid, text, text) from public, anon;
grant execute on function public.moderate_inpolor_review(uuid, text, text) to authenticated;

-- Reports are queued for human moderation. One ordinary report must not remove
-- public content before a moderator has evaluated it.
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
revoke all on function public.report_inpolor_content(text, uuid, text, text) from public, anon;
grant execute on function public.report_inpolor_content(text, uuid, text, text) to authenticated;

-- Permit an existing cross-portal profile to record a birth date once while
-- preserving its existing role. Later changes remain blocked by the profile
-- birth-date trigger.
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

  return jsonb_build_object(
    'profile_id', v_user_id,
    'onboarded', true
  );
end;
$$;
revoke all on function public.complete_inpolor_community_onboarding(date, text) from public, anon;
grant execute on function public.complete_inpolor_community_onboarding(date, text) to authenticated;

-- Wrap the current invitation implementation with exact server-side preference
-- validation. The browser cannot submit incomplete or invented preference keys.
alter function public.create_parent_student_invitation(
  text, text, text, jsonb, jsonb, text, boolean
) rename to create_parent_student_invitation_unchecked;
revoke all on function public.create_parent_student_invitation_unchecked(
  text, text, text, jsonb, jsonb, text, boolean
) from public, anon, authenticated;

create function public.create_parent_student_invitation(
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
begin
  if jsonb_typeof(p_parental_preferences) is distinct from 'object'
     or jsonb_typeof(p_parent_preferences) is distinct from 'object'
     or not (p_parental_preferences ?& array[
       'campus_vibe', 'campus_concern', 'ultimate_win', 'independence'
     ])
     or not (p_parent_preferences ?& array[
       'campusVibe', 'campusConcern', 'ultimateWin', 'independence'
     ]) then
    raise exception using errcode = '22023', message = 'Every parent preference is required.';
  end if;

  if p_parental_preferences ->> 'campus_vibe' not in (
       'Public (IPTA) - Warm & Local',
       'Private (IPTS) - Modern & Vibrant',
       'International Branch - Global Exposure',
       'No preference - open to anything!'
     )
     or p_parental_preferences ->> 'campus_concern' not in (
       'Academic rigor & faculty quality',
       'Campus safety & physical well-being',
       'Mental health & student support',
       'Networking & industry connections'
     )
     or p_parental_preferences ->> 'ultimate_win' not in (
       'Guaranteed high-paying employment',
       'Strong professional network',
       'Character & leadership development',
       'Path to international migration/work'
     )
     or p_parental_preferences ->> 'independence' not in (
       'Highly independent self-starter',
       'Needs some structural guidance',
       'Requires close academic monitoring',
       'Needs strong emotional/social support'
     ) then
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

  return public.create_parent_student_invitation_unchecked(
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

create index if not exists published_reviews_university_visibility_published_idx
  on public.published_reviews (university_id, visibility_status, published_at desc);
create index if not exists content_reports_content_created_idx
  on public.content_reports (content_type, content_id, created_at desc);

commit;

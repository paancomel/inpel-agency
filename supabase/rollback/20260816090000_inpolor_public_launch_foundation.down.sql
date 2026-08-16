begin;

drop trigger if exists unspoken_truths_sync_projection on public.review_unspoken_truths;
drop trigger if exists official_responses_sync_projection on public.official_responses;
drop trigger if exists answers_sync_projection on public.question_answers;
drop trigger if exists questions_sync_projection on public.university_questions;
drop trigger if exists comments_sync_projection on public.comments;
drop trigger if exists review_photos_sync_projection on public.review_photos;
drop trigger if exists answer_votes_sync_count on public.question_answer_votes;
drop trigger if exists review_likes_sync_count on public.review_likes;
drop trigger if exists reviews_sync_published_projection on public.reviews;
drop trigger if exists profiles_lock_birth_date on public.profiles;

drop view if exists public.inpolor_university_summaries;
drop table if exists public.unspoken_truth_teasers;
drop table if exists public.published_unspoken_truths;
drop table if exists public.published_official_responses;
drop table if exists public.published_question_answers;
drop table if exists public.published_questions;
drop table if exists public.published_comments;
drop table if exists public.published_review_photos;
drop table if exists public.reward_claim_statuses;
drop table if exists private.reward_risk_signals;
drop table if exists private.reward_claims;
drop table if exists public.notifications;
drop table if exists public.question_saves;
drop table if exists public.university_saves;
drop table if exists public.review_saves;
drop table if exists public.content_reports;
drop table if exists public.official_responses;
drop table if exists public.question_answer_votes;
drop table if exists public.question_answers;
drop table if exists public.university_questions;
drop table if exists public.review_unspoken_truths;
drop table if exists public.moderation_actions;
drop table if exists public.review_photos;
drop table if exists public.review_versions;

drop function if exists public.report_inpolor_content(text,uuid,text,text);
drop function if exists public.moderate_inpolor_review(uuid,text,text);
drop function if exists public.get_inpolor_payment_queue(integer);
drop function if exists public.record_inpolor_reward_risk(uuid,text,text,numeric,jsonb);
drop function if exists public.mark_inpolor_reward_paid(uuid,text);
drop function if exists public.submit_inpolor_reward_claim(uuid,text);
drop function if exists public.submit_inpolor_review(jsonb);
drop function if exists public.create_inpolor_reward_draft(uuid);
drop function if exists private.inpolor_word_count(text);
drop function if exists private.sync_answer_vote_count();
drop function if exists private.sync_review_like_count();
drop function if exists private.sync_inpolor_content_projection();
drop function if exists private.sync_inpolor_review_projection();
drop function if exists private.can_moderate_inpolor_payments();
drop function if exists private.can_moderate_inpolor_content();
drop function if exists private.has_inpolor_role(text[]);
drop function if exists private.prevent_profile_birth_date_change();
drop function if exists public.set_institution_verification(uuid,text);

grant update on table public.universities to authenticated;

delete from storage.buckets where id='inpolor-review-photos';

alter table public.comments drop constraint if exists comments_status_check;
alter table public.comments
  drop column if exists parent_comment_id,
  drop column if exists depth,
  drop column if exists updated_at,
  add constraint comments_status_check check(status in ('pending','published','rejected','removed'));

alter table public.published_reviews
  drop constraint if exists published_reviews_rating_check,
  drop constraint if exists published_reviews_visibility_check,
  drop column if exists rating_facilities,
  drop column if exists rating_teaching,
  drop column if exists rating_class_experience,
  drop column if exists rating_safety,
  drop column if exists rating_value,
  drop column if exists rating_transport,
  drop column if exists rating_campus_life,
  drop column if exists rating_career,
  drop column if exists living_cost_monthly,
  drop column if exists content,
  drop column if exists is_complete_review,
  drop column if exists visibility_status,
  drop column if exists published_at;
alter table public.published_reviews alter column rating type integer using rating::integer;
alter table public.published_reviews add constraint published_reviews_rating_check check(rating between 1 and 5);

drop index if exists public.reviews_user_updated_idx;
drop index if exists public.reviews_university_status_published_idx;
drop index if exists public.reviews_one_active_per_user_university_idx;
alter table public.reviews drop constraint if exists reviews_status_check;
alter table public.reviews
  drop constraint if exists reviews_kind_check,
  drop constraint if exists reviews_course_name_check,
  drop constraint if exists reviews_study_year_check,
  drop constraint if exists reviews_living_cost_check,
  drop constraint if exists reviews_ratings_check,
  drop column if exists course_id,
  drop column if exists course_name,
  drop column if exists study_year,
  drop column if exists review_kind,
  drop column if exists rating_facilities,
  drop column if exists rating_teaching,
  drop column if exists rating_class_experience,
  drop column if exists rating_safety,
  drop column if exists rating_value,
  drop column if exists rating_transport,
  drop column if exists rating_campus_life,
  drop column if exists rating_career,
  drop column if exists overall_rating,
  drop column if exists living_cost_monthly,
  drop column if exists is_complete_review,
  drop column if exists current_version,
  drop column if exists acquisition_source,
  drop column if exists acquisition_campaign,
  drop column if exists submitted_at,
  drop column if exists published_at,
  drop column if exists updated_at,
  add constraint reviews_status_check check(status in ('pending','published','rejected','removed'));

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles drop constraint if exists profiles_preferred_locale_check;
alter table public.profiles
  drop column if exists date_of_birth,
  drop column if exists preferred_locale,
  drop column if exists updated_at,
  add constraint profiles_role_check check(role in ('parent','student','university_rep','admin'));

create or replace function private.sync_published_review_projection()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op='DELETE' then delete from public.published_reviews where id=old.id; return old; end if;
  if new.status<>'published' then delete from public.published_reviews where id=new.id; return new; end if;
  insert into public.published_reviews(id,university_id,course,year,rating,green_flags,red_flags,spill_the_tea,vibe_tags,is_anonymous,likes_count,created_at)
  values(new.id,new.university_id,btrim(coalesce(new.review_data->>'course','')),btrim(coalesce(new.review_data->>'year','')),
    case when coalesce(new.review_data->>'rating','')~'^[1-5]$' then (new.review_data->>'rating')::integer else 1 end,
    btrim(coalesce(new.review_data->>'greenFlags','')),btrim(coalesce(new.review_data->>'redFlags','')),
    btrim(coalesce(new.review_data->>'spillTheTea','')),coalesce(new.review_data->'vibeTags','[]'::jsonb),
    coalesce(new.is_anonymous,false),coalesce(new.likes_count,0),new.created_at)
  on conflict(id) do update set university_id=excluded.university_id,course=excluded.course,year=excluded.year,
    rating=excluded.rating,green_flags=excluded.green_flags,red_flags=excluded.red_flags,
    spill_the_tea=excluded.spill_the_tea,vibe_tags=excluded.vibe_tags,is_anonymous=excluded.is_anonymous,
    likes_count=excluded.likes_count,created_at=excluded.created_at;
  return new;
end;
$$;
revoke all on function private.sync_published_review_projection() from public,anon,authenticated;
create trigger reviews_sync_published_projection
after insert or update of status,review_data,is_anonymous,likes_count,university_id,created_at or delete
on public.reviews for each row execute function private.sync_published_review_projection();

grant execute on function public.submit_review_for_moderation(uuid,jsonb,boolean) to anon,authenticated;

commit;

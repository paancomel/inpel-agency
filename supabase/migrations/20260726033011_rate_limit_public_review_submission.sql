begin;

-- Keep only a short-lived digest for abuse control. The public API never gets
-- access to this private table and no raw client IP address is persisted.
create table private.review_submission_rate_limits (
  id bigint generated always as identity primary key,
  subject_digest bytea not null,
  submitted_at timestamptz not null default current_timestamp,
  constraint review_submission_rate_limits_subject_digest_length_check
    check (octet_length(subject_digest) = 32)
);

create index review_submission_rate_limits_subject_submitted_at_idx
  on private.review_submission_rate_limits (subject_digest, submitted_at desc);

alter table private.review_submission_rate_limits enable row level security;
revoke all on table private.review_submission_rate_limits from public, anon, authenticated;

create or replace function private.enforce_review_submission_rate_limit()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_headers jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  v_forwarded_for text := btrim(split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1));
  v_subject text;
  v_subject_digest bytea;
  v_recent_count integer;
begin
  if v_user_id is not null then
    v_subject := 'user:' || v_user_id::text;
  elsif v_forwarded_for <> '' then
    v_subject := 'ip:' || v_forwarded_for;
  else
    raise exception using
      errcode = 'PGRST',
      message = json_build_object(
        'message', 'Review submission could not verify its request origin. Please retry in your browser.'
      )::text,
      detail = json_build_object('status', 400)::text;
  end if;

  v_subject_digest := extensions.digest(convert_to(v_subject, 'UTF8'), 'sha256');
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_subject, 0));

  delete from private.review_submission_rate_limits
   where submitted_at < current_timestamp - interval '24 hours';

  select count(*) into v_recent_count
    from private.review_submission_rate_limits
   where subject_digest = v_subject_digest
     and submitted_at >= current_timestamp - interval '10 minutes';

  if v_recent_count >= 5 then
    raise exception using
      errcode = 'PGRST',
      message = json_build_object(
        'message', 'Too many review submissions. Please wait 10 minutes and try again.'
      )::text,
      detail = json_build_object('status', 429)::text;
  end if;

  insert into private.review_submission_rate_limits (subject_digest)
  values (v_subject_digest);
end;
$$;

create or replace function private.enforce_public_review_rate_limit_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('request.path', true) = 'rpc/submit_review_for_moderation' then
    perform private.enforce_review_submission_rate_limit();
  end if;
  return new;
end;
$$;

revoke all on function private.enforce_review_submission_rate_limit() from public, anon, authenticated;
revoke all on function private.enforce_public_review_rate_limit_trigger() from public, anon, authenticated;

drop trigger if exists reviews_enforce_submission_rate_limit on public.reviews;
create trigger reviews_enforce_submission_rate_limit
  before insert on public.reviews
  for each row
  execute function private.enforce_public_review_rate_limit_trigger();

commit;

begin;

-- Reward photos are accepted only after a trusted redaction service has produced
-- a metadata-free derivative and the contributor has confirmed that derivative.
alter table public.review_photos
  add column if not exists processing_provider text,
  add column if not exists processing_version text,
  add column if not exists metadata_stripped_at timestamptz,
  add column if not exists original_deleted_at timestamptz,
  add column if not exists safety_checked_at timestamptz,
  add constraint review_photos_confirmed_pipeline_check check (
    redaction_status <> 'confirmed' or (
      processing_provider is not null
      and processing_version is not null
      and metadata_stripped_at is not null
      and original_deleted_at is not null
      and safety_checked_at is not null
      and redaction_confirmed_at is not null
    )
  );

-- Keep every object private. The Edge Function uses a server secret and emits
-- short-lived signed URLs only for owner confirmation or a published projection.
update storage.buckets
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/png','image/jpeg','image/webp']
where id = 'inpolor-review-photos';

drop policy if exists inpolor_review_photo_direct_select on storage.objects;
drop policy if exists inpolor_review_photo_direct_insert on storage.objects;
drop policy if exists inpolor_review_photo_direct_update on storage.objects;
drop policy if exists inpolor_review_photo_direct_delete on storage.objects;

-- The original RPC validates database state, while this wrapper additionally
-- requires the browser to reference the exact confirmed server-generated assets.
alter function public.submit_inpolor_review(jsonb) rename to submit_inpolor_review_unchecked;
revoke all on function public.submit_inpolor_review_unchecked(jsonb) from public, anon, authenticated;

create or replace function public.submit_inpolor_review(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_review_id uuid;
  v_photo_ids uuid[];
begin
  if v_user_id is null then
    raise exception using errcode='28000', message='Authentication is required.';
  end if;

  if coalesce(p_payload->>'kind', 'standard') = 'reward' then
    v_review_id := nullif(p_payload->>'reviewId', '')::uuid;
    if v_review_id is null or jsonb_typeof(p_payload->'photoIds') <> 'array' then
      raise exception using errcode='22023', message='Confirmed reward photo references are required.';
    end if;

    select coalesce(array_agg(value::uuid order by value::uuid), '{}'::uuid[])
      into v_photo_ids
      from jsonb_array_elements_text(p_payload->'photoIds');

    if cardinality(v_photo_ids) not between 16 and 40
       or cardinality(v_photo_ids) <> (select count(distinct requested.id) from unnest(v_photo_ids) as requested(id))
       or not exists (
         select 1 from public.reviews r
         where r.id=v_review_id and r.user_id=v_user_id
           and r.review_kind='reward' and r.status='draft'
       )
       or exists (
         select 1 from unnest(v_photo_ids) as requested(id)
         left join public.review_photos p on p.id=requested.id
         where p.id is null or p.review_id<>v_review_id
           or p.redaction_status<>'confirmed'
           or p.redaction_confirmed_at is null
           or p.metadata_stripped_at is null
           or p.original_deleted_at is null
           or p.safety_checked_at is null
           or p.storage_path not like v_user_id::text||'/'||v_review_id::text||'/safe/%'
       )
       or exists (
         select 1 from public.review_photos p
         where p.review_id=v_review_id and p.redaction_status='confirmed'
           and not (p.id=any(v_photo_ids))
       ) then
      raise exception using errcode='22023', message='Reward submission must reference every confirmed server-processed photo exactly once.';
    end if;
  end if;

  return public.submit_inpolor_review_unchecked(p_payload);
end;
$$;
revoke all on function public.submit_inpolor_review(jsonb) from public, anon;
grant execute on function public.submit_inpolor_review(jsonb) to authenticated;

commit;

begin;

-- A review remains anonymous in every public projection, while the exact
-- declarations made at submission are retained privately as compliance evidence.
create table private.inpolor_review_declaration_receipts (
  id uuid primary key default extensions.uuid_generate_v4(),
  review_id uuid not null unique references public.reviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  declaration_version text not null,
  age_18_or_older boolean not null check (age_18_or_older),
  terms_accepted boolean not null check (terms_accepted),
  privacy_acknowledged boolean not null check (privacy_acknowledged),
  content_rights_confirmed boolean not null check (content_rights_confirmed),
  age_eligibility_verified_at timestamptz not null,
  declared_at timestamptz not null default current_timestamp,
  constraint inpolor_review_declaration_version_check
    check (declaration_version = 'inpolor-review-v1')
);

alter table private.inpolor_review_declaration_receipts enable row level security;
revoke all on table private.inpolor_review_declaration_receipts from public, anon, authenticated;

-- Preserve the existing photo-pipeline wrapper as an inaccessible internal step.
alter function public.submit_inpolor_review(jsonb)
  rename to submit_inpolor_review_without_declaration_audit;
revoke all on function public.submit_inpolor_review_without_declaration_audit(jsonb)
  from public, anon, authenticated;

create or replace function public.submit_inpolor_review(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_declarations jsonb := p_payload->'declarations';
  v_result jsonb;
  v_review_id uuid;
  v_verified_at timestamptz := current_timestamp;
begin
  if v_user_id is null then
    raise exception using errcode='28000', message='Authentication is required.';
  end if;

  if jsonb_typeof(v_declarations) is distinct from 'object'
     or v_declarations->>'version' is distinct from 'inpolor-review-v1'
     or v_declarations->'age18OrOlder' is distinct from 'true'::jsonb
     or v_declarations->'termsAccepted' is distinct from 'true'::jsonb
     or v_declarations->'privacyAcknowledged' is distinct from 'true'::jsonb
     or v_declarations->'contentRightsConfirmed' is distinct from 'true'::jsonb then
    raise exception using errcode='22023',
      message='All current INPOLOR review declarations, including the 18+ declaration, are required.';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = v_user_id
      and p.date_of_birth <= current_date - interval '18 years'
  ) then
    raise exception using errcode='22023',
      message='INPOLOR is available only to users aged 18 or older.';
  end if;

  v_result := public.submit_inpolor_review_without_declaration_audit(p_payload);
  v_review_id := nullif(v_result->>'review_id', '')::uuid;
  if v_review_id is null then
    raise exception using errcode='P0001', message='The review declaration receipt could not be linked.';
  end if;

  insert into private.inpolor_review_declaration_receipts (
    review_id,
    user_id,
    declaration_version,
    age_18_or_older,
    terms_accepted,
    privacy_acknowledged,
    content_rights_confirmed,
    age_eligibility_verified_at
  ) values (
    v_review_id,
    v_user_id,
    v_declarations->>'version',
    true,
    true,
    true,
    true,
    v_verified_at
  );

  return v_result;
end;
$$;

revoke all on function public.submit_inpolor_review(jsonb) from public, anon;
grant execute on function public.submit_inpolor_review(jsonb) to authenticated;

commit;

create table private.review_declaration_receipts (
  review_id uuid primary key references public.reviews (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  adult_confirmed boolean not null,
  rights_confirmed boolean not null,
  terms_confirmed boolean not null,
  privacy_confirmed boolean not null,
  declaration_version text not null,
  accepted_at timestamptz not null default now()
);

alter table private.review_declaration_receipts enable row level security;
revoke all on table private.review_declaration_receipts from public, anon, authenticated;

alter function public.submit_inpolor_review(jsonb) rename to submit_inpolor_review_inner;
revoke all on function public.submit_inpolor_review_inner(jsonb) from public, anon, authenticated;

create function public.submit_inpolor_review(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_review_id uuid;
  v_user_id uuid := auth.uid();
  v_declarations jsonb := coalesce(p_payload -> 'declarations', '{}'::jsonb);
  v_version text := btrim(coalesce(v_declarations ->> 'version', ''));
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Sign in before submitting a review.';
  end if;

  if coalesce((v_declarations ->> 'adult')::boolean, false) is not true
     or coalesce((v_declarations ->> 'rights')::boolean, false) is not true
     or coalesce((v_declarations ->> 'terms')::boolean, false) is not true
     or coalesce((v_declarations ->> 'privacy')::boolean, false) is not true
     or v_version <> 'inpolor-launch-2026-08-16' then
    raise exception using errcode = '22023', message = 'All current review declarations are required.';
  end if;

  v_review_id := public.submit_inpolor_review_inner(p_payload - 'declarations');

  insert into private.review_declaration_receipts (
    review_id, user_id, adult_confirmed, rights_confirmed,
    terms_confirmed, privacy_confirmed, declaration_version
  ) values (
    v_review_id, v_user_id, true, true, true, true, v_version
  ) on conflict (review_id) do nothing;

  return v_review_id;
end;
$$;

revoke all on function public.submit_inpolor_review(jsonb) from public, anon;
grant execute on function public.submit_inpolor_review(jsonb) to authenticated;

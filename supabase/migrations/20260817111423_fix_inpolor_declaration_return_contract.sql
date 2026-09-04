drop function public.submit_inpolor_review(jsonb);
create function public.submit_inpolor_review(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
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
  v_result := public.submit_inpolor_review_inner(p_payload - 'declarations');
  v_review_id := nullif(v_result ->> 'review_id', '')::uuid;
  if v_review_id is null then
    raise exception using errcode = '22023', message = 'Review submission did not return a valid review identifier.';
  end if;
  insert into private.review_declaration_receipts (
    review_id, user_id, adult_confirmed, rights_confirmed,
    terms_confirmed, privacy_confirmed, declaration_version
  ) values (
    v_review_id, v_user_id, true, true, true, true, v_version
  ) on conflict (review_id) do nothing;
  return v_result;
end;
$$;
revoke all on function public.submit_inpolor_review(jsonb) from public, anon;
grant execute on function public.submit_inpolor_review(jsonb) to authenticated;

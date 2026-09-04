begin;

do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id
    from auth.users
   where email = 'qa-inpolor-browser-20260904@example.test';

  if v_user_id is null then
    return;
  end if;

  delete from private.review_declaration_receipts where user_id = v_user_id;
  delete from public.review_versions where submitted_by = v_user_id;
  delete from public.reviews where user_id = v_user_id;
  delete from public.profiles where id = v_user_id;
  delete from auth.users where id = v_user_id;
end;
$$;

commit;

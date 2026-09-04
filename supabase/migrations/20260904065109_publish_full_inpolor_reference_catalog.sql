begin;

-- User-authorized staging publication of the complete imported MQA reference
-- catalogue. These rows retain source-only facts; no representative, contact,
-- address, price, or course claim is created.
insert into public.universities (
  name,
  verification_status,
  profile_status,
  is_suspended
)
select
  ri.source_name,
  'verified',
  'complete',
  false
from public.reference_institutions ri
on conflict (name) do nothing;

insert into public.reference_institution_links (
  reference_institution_id,
  university_id,
  status,
  match_method,
  reviewed_at,
  notes
)
select
  ri.id,
  u.id,
  'verified',
  'import',
  current_timestamp,
  'Staging bulk publication of the MQA reference catalogue, authorized 2026-09-04.'
from public.reference_institutions ri
join public.universities u on u.name = ri.source_name
on conflict (reference_institution_id) do update
set university_id = excluded.university_id,
    status = excluded.status,
    match_method = excluded.match_method,
    reviewed_at = excluded.reviewed_at,
    notes = excluded.notes;

insert into public.portal_catalog_visibility (
  university_id,
  portal,
  status,
  published_at,
  notes
)
select
  ril.university_id,
  'inpolor',
  'published',
  current_timestamp,
  'Staging bulk publication of the MQA reference catalogue, authorized 2026-09-04.'
from public.reference_institution_links ril
on conflict (university_id, portal) do update
set status = excluded.status,
    published_at = excluded.published_at,
    notes = excluded.notes,
    updated_at = current_timestamp;

do $$
begin
  if (select count(*) from public.reference_institution_links where status = 'verified')
       <> (select count(*) from public.reference_institutions) then
    raise exception 'Every reference institution must have one verified directory link.';
  end if;

  if (select count(*) from public.portal_catalog_visibility where portal = 'inpolor' and status = 'published')
       <> (select count(*) from public.reference_institutions) then
    raise exception 'Every reference institution must be published to INPOLOR.';
  end if;
end;
$$;

commit;
